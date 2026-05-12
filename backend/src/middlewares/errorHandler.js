export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  console.error('   Stack:', err.stack);

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Error de validación en la BD' });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'El valor ya existe en la BD' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  res.status(500).json({ error: err.message || 'Error interno del servidor' });
}