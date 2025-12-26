import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Verificar JWT Token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario en DB
    const result = await query(
      'SELECT id, email, role, first_name, last_name, institution_id, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Verificar roles
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }

    next();
  };
};

// Verificar que es estudiante de la institución
export const checkInstitution = async (req, res, next) => {
  try {
    const institutionId = req.params.institutionId || req.body.institutionId;

    if (req.user.role === 'root') {
      return next();
    }

    if (req.user.role === 'director' || req.user.role === 'profesor') {
      if (req.user.institution_id !== institutionId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta institución'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

export default { verifyToken, checkRole, checkInstitution };