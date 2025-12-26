import { query, queryOne } from '../config/database.js';
import bcrypt from 'bcrypt';

export const getAllInstitutions = async (req, res) => {
  try {
    const institutions = await query(
      `SELECT i.*, COUNT(u.id) as total_users 
       FROM institutions i 
       LEFT JOIN users u ON i.id = u.institution_id 
       GROUP BY i.id 
       ORDER BY i.name`
    );
    res.json({ success: true, data: institutions.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener instituciones' });
  }
};

export const createInstitution = async (req, res) => {
  try {
    const { code, name, address, city, department, phone, email, contactPerson, maxStudents } = req.body;

    const institution = await queryOne(
      `INSERT INTO institutions (code, name, address, city, department, phone, email, contact_person, max_students)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, name, address, city, department, phone, email, contactPerson, maxStudents || 100]
    );

    res.status(201).json({ success: true, data: institution });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear institución', error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { email, password, firstName, lastName, documentType, documentNumber, phone } = req.body;

    const institution = await queryOne('SELECT code FROM institutions WHERE id = $1', [institutionId]);
    if (!institution) return res.status(404).json({ success: false, message: 'Institución no encontrada' });

    const studentCount = await queryOne(
      'SELECT COUNT(*) as count FROM users WHERE institution_id = $1 AND role = $2',
      [institutionId, 'estudiante']
    );

    const studentCode = `${institution.code}-EST${String(parseInt(studentCount.count) + 1).padStart(3, '0')}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const student = await queryOne(
      `INSERT INTO users (institution_id, code, email, password_hash, role, first_name, last_name, document_type, document_number, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, code, email, first_name, last_name, role`,
      [institutionId, studentCode, email, passwordHash, 'estudiante', firstName, lastName, documentType, documentNumber, phone]
    );

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear estudiante', error: error.message });
  }
};

export const getInstitutionStudents = async (req, res) => {
  try {
    const { institutionId } = req.params;

    const students = await query(
      `SELECT u.id, u.code, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              COUNT(ce.id) as enrolled_courses
       FROM users u
       LEFT JOIN course_enrollments ce ON u.id = ce.user_id
       WHERE u.institution_id = $1 AND u.role = 'estudiante'
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      [institutionId]
    );

    res.json({ success: true, data: students.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes' });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { firstName, lastName, email, phone, isActive } = req.body;

    const student = await queryOne(
      `UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
       email = COALESCE($3, email), phone = COALESCE($4, phone), is_active = COALESCE($5, is_active)
       WHERE id = $6 RETURNING *`,
      [firstName, lastName, email, phone, isActive, studentId]
    );

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar estudiante' });
  }
};

export default { getAllInstitutions, createInstitution, createStudent, getInstitutionStudents, updateStudent };