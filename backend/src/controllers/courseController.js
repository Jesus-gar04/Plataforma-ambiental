import { query, queryOne, withTransaction } from '../config/database.js';
import { storage } from '../config/supabase.js';

// ============================================================
// OBTENER TODOS LOS CURSOS
// ============================================================
export const getAllCourses = async (req, res) => {
  try {
    const { isActive } = req.query;

    let sql = `
      SELECT c.*, 
             u.first_name || ' ' || u.last_name as created_by_name,
             COUNT(DISTINCT ce.id) as total_enrollments,
             COUNT(DISTINCT m.id) as total_modules
      FROM courses c
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN modules m ON c.id = m.course_id
    `;

    const params = [];
    
    if (isActive !== undefined) {
      sql += ' WHERE c.is_active = $1';
      params.push(isActive === 'true');
    }

    sql += ' GROUP BY c.id, u.first_name, u.last_name ORDER BY c.created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos'
    });
  }
};

// ============================================================
// OBTENER CURSO POR ID
// ============================================================
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await queryOne(
      `SELECT c.*, 
              u.first_name || ' ' || u.last_name as created_by_name,
              COUNT(DISTINCT ce.id) as total_enrollments,
              COUNT(DISTINCT m.id) as total_modules
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN course_enrollments ce ON c.id = ce.course_id
       LEFT JOIN modules m ON c.id = m.course_id
       WHERE c.id = $1
       GROUP BY c.id, u.first_name, u.last_name`,
      [id]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Obtener módulos del curso
    const modules = await query(
      `SELECT m.*,
              COUNT(DISTINCT mc.id) as total_contents,
              COUNT(DISTINCT e.id) as total_evaluations
       FROM modules m
       LEFT JOIN module_contents mc ON m.id = mc.module_id
       LEFT JOIN evaluations e ON m.id = e.module_id
       WHERE m.course_id = $1
       GROUP BY m.id
       ORDER BY m.order_index`,
      [id]
    );

    course.modules = modules.rows;

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener curso'
    });
  }
};

// ============================================================
// CREAR CURSO
// ============================================================
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      durationHours,
      passingScore,
      startDate,
      endDate,
      maxEnrollments
    } = req.body;

    const course = await queryOne(
      `INSERT INTO courses (
        title, description, short_description, duration_hours,
        passing_score, start_date, end_date, max_enrollments, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        title,
        description,
        shortDescription,
        durationHours || 20,
        passingScore || 75,
        startDate,
        endDate,
        maxEnrollments,
        req.user.id
      ]
    );

    // Registrar log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, 'create_course', 'course', course.id, JSON.stringify({ title })]
    );

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: course
    });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear curso',
      error: error.message
    });
  }
};

// ============================================================
// ACTUALIZAR CURSO
// ============================================================
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      shortDescription,
      durationHours,
      passingScore,
      startDate,
      endDate,
      isActive,
      maxEnrollments
    } = req.body;

    const course = await queryOne(
      `UPDATE courses SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        short_description = COALESCE($3, short_description),
        duration_hours = COALESCE($4, duration_hours),
        passing_score = COALESCE($5, passing_score),
        start_date = COALESCE($6, start_date),
        end_date = COALESCE($7, end_date),
        is_active = COALESCE($8, is_active),
        max_enrollments = COALESCE($9, max_enrollments)
       WHERE id = $10
       RETURNING *`,
      [
        title,
        description,
        shortDescription,
        durationHours,
        passingScore,
        startDate,
        endDate,
        isActive,
        maxEnrollments,
        id
      ]
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: course
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar curso'
    });
  }
};

// ============================================================
// ELIMINAR CURSO
// ============================================================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay estudiantes inscritos
    const enrollments = await queryOne(
      'SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = $1',
      [id]
    );

    if (parseInt(enrollments.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un curso con estudiantes inscritos'
      });
    }

    await query('DELETE FROM courses WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar curso'
    });
  }
};

// ============================================================
// CREAR MÓDULO
// ============================================================
export const createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, orderIndex, durationMinutes, iconName } = req.body;

    const module = await queryOne(
      `INSERT INTO modules (
        course_id, title, description, order_index, duration_minutes, icon_name
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [courseId, title, description, orderIndex, durationMinutes || 60, iconName]
    );

    res.status(201).json({
      success: true,
      message: 'Módulo creado exitosamente',
      data: module
    });
  } catch (error) {
    console.error('Error al crear módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear módulo',
      error: error.message
    });
  }
};

// ============================================================
// OBTENER MÓDULOS DE UN CURSO
// ============================================================
export const getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await query(
      `SELECT m.*,
              COUNT(DISTINCT mc.id) as total_contents,
              COUNT(DISTINCT e.id) as total_evaluations
       FROM modules m
       LEFT JOIN module_contents mc ON m.id = mc.module_id
       LEFT JOIN evaluations e ON m.id = e.module_id
       WHERE m.course_id = $1 AND m.is_active = true
       GROUP BY m.id
       ORDER BY m.order_index`,
      [courseId]
    );

    res.json({
      success: true,
      data: modules.rows
    });
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener módulos'
    });
  }
};

// ============================================================
// ACTUALIZAR MÓDULO
// ============================================================
export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, orderIndex, durationMinutes, isActive, iconName } = req.body;

    const module = await queryOne(
      `UPDATE modules SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        order_index = COALESCE($3, order_index),
        duration_minutes = COALESCE($4, duration_minutes),
        is_active = COALESCE($5, is_active),
        icon_name = COALESCE($6, icon_name)
       WHERE id = $7
       RETURNING *`,
      [title, description, orderIndex, durationMinutes, isActive, iconName, moduleId]
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Módulo actualizado exitosamente',
      data: module
    });
  } catch (error) {
    console.error('Error al actualizar módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar módulo'
    });
  }
};

// ============================================================
// ELIMINAR MÓDULO
// ============================================================
export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    await query('DELETE FROM modules WHERE id = $1', [moduleId]);

    res.json({
      success: true,
      message: 'Módulo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar módulo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar módulo'
    });
  }
};

// ============================================================
// CREAR CONTENIDO DE MÓDULO
// ============================================================
export const createModuleContent = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      contentType,
      contentText,
      orderIndex,
      durationMinutes,
      isRequired
    } = req.body;

    let contentUrl = null;
    let fileName = null;
    let fileSize = null;
    let mimeType = null;

    // Si hay archivo subido
    if (req.file) {
      const file = req.file;
      const timestamp = Date.now();
      const bucket = contentType === 'video' 
        ? process.env.STORAGE_BUCKET_VIDEOS
        : contentType === 'imagen'
        ? process.env.STORAGE_BUCKET_IMAGES
        : process.env.STORAGE_BUCKET_DOCUMENTS;

      const filePath = `${moduleId}/${timestamp}_${file.originalname}`;

      const uploadResult = await storage.uploadFile(bucket, filePath, file.buffer, {
        contentType: file.mimetype
      });

      if (uploadResult.success) {
        contentUrl = uploadResult.url;
        fileName = file.originalname;
        fileSize = file.size;
        mimeType = file.mimetype;
      }
    }

    const content = await queryOne(
      `INSERT INTO module_contents (
        module_id, title, content_type, content_url, content_text,
        order_index, duration_minutes, is_required, file_name, file_size, mime_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        moduleId,
        title,
        contentType,
        contentUrl,
        contentText,
        orderIndex,
        durationMinutes,
        isRequired !== false,
        fileName,
        fileSize,
        mimeType
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Contenido creado exitosamente',
      data: content
    });
  } catch (error) {
    console.error('Error al crear contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear contenido',
      error: error.message
    });
  }
};

// ============================================================
// OBTENER CONTENIDOS DE UN MÓDULO
// ============================================================
export const getModuleContents = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const contents = await query(
      `SELECT * FROM module_contents
       WHERE module_id = $1
       ORDER BY order_index`,
      [moduleId]
    );

    res.json({
      success: true,
      data: contents.rows
    });
  } catch (error) {
    console.error('Error al obtener contenidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contenidos'
    });
  }
};

// ============================================================
// INSCRIBIRSE A UN CURSO
// ============================================================
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verificar si ya está inscrito
    const existing = await queryOne(
      'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás inscrito en este curso'
      });
    }

    // Verificar límite de inscripciones
    const course = await queryOne(
      'SELECT max_enrollments, current_enrollments FROM courses WHERE id = $1',
      [courseId]
    );

    if (course.max_enrollments && course.current_enrollments >= course.max_enrollments) {
      return res.status(400).json({
        success: false,
        message: 'El curso ha alcanzado el límite de inscripciones'
      });
    }

    const enrollment = await queryOne(
      `INSERT INTO course_enrollments (user_id, course_id, started_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [userId, courseId]
    );

    res.status(201).json({
      success: true,
      message: 'Inscripción exitosa',
      data: enrollment
    });
  } catch (error) {
    console.error('Error al inscribirse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inscribirse al curso'
    });
  }
};

// ============================================================
// OBTENER MIS CURSOS INSCRITOS
// ============================================================
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await query(
      `SELECT c.*, ce.status, ce.progress_percentage, ce.started_at, ce.completed_at,
              ce.id as enrollment_id
       FROM course_enrollments ce
       JOIN courses c ON ce.course_id = c.id
       WHERE ce.user_id = $1
       ORDER BY ce.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: courses.rows
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos'
    });
  }
};

export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  getCourseModules,
  updateModule,
  deleteModule,
  createModuleContent,
  getModuleContents,
  enrollCourse,
  getMyCourses
};