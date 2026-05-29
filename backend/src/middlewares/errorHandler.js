export function errorHandler(err, req, res, next) {
  // En producción solo logueamos el mensaje, nunca el stack completo
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Error:', err.message);
  } else {
    console.error('❌ Error:', err.message);
    console.error('   Stack:', err.stack);
  }

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

  // En producción nunca enviamos detalles internos al cliente
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message || 'Error interno del servidor';

  res.status(500).json({ error: message });
}