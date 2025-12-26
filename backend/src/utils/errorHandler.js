export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referencia inválida'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
};