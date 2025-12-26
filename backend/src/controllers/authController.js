import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/database.js';

// ============================================================
// REGISTRO DE USUARIO
// ============================================================
export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      code,
      firstName,
      lastName,
      documentType,
      documentNumber,
      phone,
      role,
      institutionId
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el código ya existe
    const existingCode = await queryOne(
      'SELECT id FROM users WHERE code = $1',
      [code]
    );

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'El código ya está registrado'
      });
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await queryOne(
      `INSERT INTO users (
        email, password_hash, code, first_name, last_name,
        document_type, document_number, phone, role, institution_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, code, first_name, last_name, role`,
      [
        email,
        passwordHash,
        code,
        firstName,
        lastName,
        documentType,
        documentNumber,
        phone,
        role,
        institutionId || null
      ]
    );

    // Generar token
    const token = jwt.sign(
      { userId: result.id, role: result.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: result,
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// ============================================================
// LOGIN
// ============================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await queryOne(
      `SELECT u.*, i.name as institution_name 
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.email = $1`,
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = $1',
      [user.id]
    );

    // Registrar log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, 'login', 'user', user.id, req.ip]
    );

    // Generar token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remover password del objeto
    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// ============================================================
// OBTENER PERFIL DEL USUARIO
// ============================================================
export const getProfile = async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.*, i.name as institution_name, i.code as institution_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    delete user.password_hash;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

// ============================================================
// ACTUALIZAR PERFIL
// ============================================================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    const result = await queryOne(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           email = COALESCE($4, email)
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone`,
      [firstName, lastName, phone, email, req.user.id]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

// ============================================================
// CAMBIAR CONTRASEÑA
// ============================================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Obtener usuario con password
    const user = await queryOne(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hash nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
};

// ============================================================
// VERIFICAR TOKEN
// ============================================================
export const verifyToken = async (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user: req.user
    }
  });
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  verifyToken
};