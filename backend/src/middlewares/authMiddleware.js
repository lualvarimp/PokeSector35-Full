import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos de admin' });
  }
  next();
}

/**
 * Middleware que verifica que el usuario autenticado es el propietario del recurso o es admin.
 * Compara req.user.id (del token) con req.params.id o req.params.userId (de la URL).
 */
export function requireOwnerOrAdmin(req, res, next) {
  const paramId = req.params.id || req.params.userId;
  if (String(req.user.id) !== String(paramId) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
  }
  next();
}

/**
 * Middleware para proteger las vistas del panel admin.
 * Lee el token desde la cookie 'admin_token' (las rutas de vistas no envían header Authorization).
 * Si no hay cookie o el token es inválido o no es admin, redirige al login.
 */
export function verifyAdminView(req, res, next) {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) {
      return res.redirect('/login');
    }

    const tokenCookie = cookies.split(';').map(c => c.trim()).find(c => c.startsWith('admin_token='));
    if (!tokenCookie) {
      return res.redirect('/login');
    }

    const token = tokenCookie.split('=')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.redirect('/login');
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
}