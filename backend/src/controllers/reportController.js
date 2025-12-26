import { query } from '../config/database.js';

export const getGeneralStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM institutions WHERE is_active = true) as total_institutions,
        (SELECT COUNT(*) FROM users WHERE role = 'estudiante') as total_students,
        (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
        (SELECT COUNT(*) FROM course_enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM certificates) as total_certificates
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
};

export const getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await query(`
      SELECT 
        COUNT(*) as total_enrollments,
        COUNT(CASE WHEN status = 'completado' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'en_progreso' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'abandonado' THEN 1 END) as abandoned,
        AVG(progress_percentage) as avg_progress,
        (SELECT COUNT(*) FROM certificates c JOIN course_enrollments ce ON c.enrollment_id = ce.id WHERE ce.course_id = $1) as certificates_issued
      FROM course_enrollments
      WHERE course_id = $1
    `, [courseId]);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas del curso' });
  }
};

export const getInstitutionReport = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const report = await query(`
      SELECT 
        u.id, u.code, u.first_name, u.last_name, u.email,
        COUNT(ce.id) as enrolled_courses,
        COUNT(CASE WHEN ce.status = 'completado' THEN 1 END) as completed_courses,
        AVG(ce.progress_percentage) as avg_progress,
        COUNT(cert.id) as certificates
      FROM users u
      LEFT JOIN course_enrollments ce ON u.id = ce.user_id
      LEFT JOIN certificates cert ON ce.id = cert.enrollment_id
      WHERE u.institution_id = $1 AND u.role = 'estudiante'
      GROUP BY u.id
      ORDER BY u.last_name
    `, [institutionId]);

    res.json({ success: true, data: report.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener reporte' });
  }
};

export default { getGeneralStats, getCourseStats, getInstitutionReport };