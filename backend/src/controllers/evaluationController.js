import { query, queryOne, withTransaction } from '../config/database.js';

export const createEvaluation = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, passingScore, timeLimit, maxAttempts, questions } = req.body;

    const result = await withTransaction(async (client) => {
      const evaluation = await client.query(
        `INSERT INTO evaluations (module_id, title, description, passing_score, time_limit_minutes, max_attempts)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [moduleId, title, description, passingScore || 75, timeLimit || 30, maxAttempts || 3]
      );

      const evalId = evaluation.rows[0].id;

      for (const q of questions) {
        const question = await client.query(
          `INSERT INTO questions (evaluation_id, question_text, question_type, points, order_index, explanation)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [evalId, q.text, q.type, q.points || 1, q.order, q.explanation]
        );

        const questionId = question.rows[0].id;

        for (const opt of q.options) {
          await client.query(
            `INSERT INTO answer_options (question_id, option_text, is_correct, order_index)
             VALUES ($1, $2, $3, $4)`,
            [questionId, opt.text, opt.isCorrect, opt.order]
          );
        }
      }

      return evaluation.rows[0];
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear evaluación', error: error.message });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await queryOne('SELECT * FROM evaluations WHERE id = $1', [evaluationId]);
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });

    const questions = await query(
      `SELECT q.*, json_agg(json_build_object('id', ao.id, 'text', ao.option_text, 'order', ao.order_index) ORDER BY ao.order_index) as options
       FROM questions q
       LEFT JOIN answer_options ao ON q.id = ao.question_id
       WHERE q.evaluation_id = $1
       GROUP BY q.id
       ORDER BY q.order_index`,
      [evaluationId]
    );

    evaluation.questions = questions.rows;

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener evaluación' });
  }
};

export const submitEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const enrollment = await queryOne(
      'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = (SELECT course_id FROM modules WHERE id = (SELECT module_id FROM evaluations WHERE id = $2))',
      [userId, evaluationId]
    );

    if (!enrollment) return res.status(404).json({ success: false, message: 'No estás inscrito en este curso' });

    const attemptCount = await queryOne(
      'SELECT COUNT(*) as count FROM evaluation_attempts WHERE enrollment_id = $1 AND evaluation_id = $2',
      [enrollment.id, evaluationId]
    );

    const evaluation = await queryOne('SELECT max_attempts FROM evaluations WHERE id = $1', [evaluationId]);

    if (parseInt(attemptCount.count) >= evaluation.max_attempts) {
      return res.status(400).json({ success: false, message: 'Has alcanzado el máximo de intentos' });
    }

    const result = await withTransaction(async (client) => {
      const attempt = await client.query(
        `INSERT INTO evaluation_attempts (enrollment_id, evaluation_id, attempt_number, started_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`,
        [enrollment.id, evaluationId, parseInt(attemptCount.count) + 1]
      );

      const attemptId = attempt.rows[0].id;
      let correctAnswers = 0;
      let totalPoints = 0;

      for (const ans of answers) {
        const correct = await client.query(
          'SELECT is_correct, points FROM answer_options ao JOIN questions q ON ao.question_id = q.id WHERE ao.id = $1',
          [ans.optionId]
        );

        const isCorrect = correct.rows[0]?.is_correct || false;
        if (isCorrect) {
          correctAnswers++;
          totalPoints += correct.rows[0].points;
        }

        await client.query(
          `INSERT INTO user_answers (attempt_id, question_id, answer_option_id, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [attemptId, ans.questionId, ans.optionId, isCorrect]
        );
      }

      const totalQuestions = await client.query(
        'SELECT COUNT(*) as count FROM questions WHERE evaluation_id = $1',
        [evaluationId]
      );

      const percentage = (correctAnswers / parseInt(totalQuestions.rows[0].count)) * 100;
      const isPassed = percentage >= evaluation.passing_score;

      await client.query(
        `UPDATE evaluation_attempts SET score = $1, max_score = $2, percentage = $3, is_passed = $4, completed_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [totalPoints, parseInt(totalQuestions.rows[0].count), percentage, isPassed, attemptId]
      );

      return { attemptId, percentage, isPassed, correctAnswers, totalQuestions: parseInt(totalQuestions.rows[0].count) };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar evaluación', error: error.message });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const userId = req.user.id;

    const attempts = await query(
      `SELECT ea.* FROM evaluation_attempts ea
       JOIN course_enrollments ce ON ea.enrollment_id = ce.id
       WHERE ce.user_id = $1 AND ea.evaluation_id = $2
       ORDER BY ea.attempt_number DESC`,
      [userId, evaluationId]
    );

    res.json({ success: true, data: attempts.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener intentos' });
  }
};

export default { createEvaluation, getEvaluation, submitEvaluation, getMyAttempts };