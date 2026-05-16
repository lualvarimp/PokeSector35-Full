// =============================================================================
//  rateLimitMiddleware.js — Rate limiting para prevenir ataques de fuerza bruta
// =============================================================================
//  RESPONSABILIDAD: Limitar intentos de login/register por IP para evitar
//  ataques de fuerza bruta y spam de cuentas.
//
//  CONFIGURACIÓN:
//    · LOGIN: máximo 5 intentos fallidos en 15 minutos → bloqueo 15 minutos
//    · REGISTER: máximo 3 intentos en 1 hora → bloqueo 3 horas
//
//  USO:
//    En authRoutes.js:
//    import { rateLimitLogin, rateLimitRegister } from '../middlewares/rateLimitMiddleware.js';
//    router.post('/login-game', rateLimitLogin, authController.loginGame);
//    router.post('/register', rateLimitRegister, authController.register);
// =============================================================================

// Almacena intentos por IP
// Estructura: { ip: { count: N, firstAttempt: timestamp, blocked: boolean } }
const loginAttempts = new Map();
const registerAttempts = new Map();

// ─── Configuración ──────────────────────────────────────────────────────────
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;        // 15 minutos
const LOGIN_BLOCK_MS = 15 * 60 * 1000;         // 15 minutos

const REGISTER_MAX_ATTEMPTS = 3;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;     // 1 hora
const REGISTER_BLOCK_MS = 3 * 60 * 60 * 1000;  // 3 horas

// ─── Obtener IP del cliente ──────────────────────────────────────────────────
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.socket.remoteAddress ||
         'unknown';
}

// ─── Limpiar intentos expirados ──────────────────────────────────────────────
function cleanupAttempts(attemptsMap, windowMS) {
  const now = Date.now();
  for (const [ip, data] of attemptsMap.entries()) {
    if (now - data.firstAttempt > windowMS + (windowMS === LOGIN_WINDOW_MS ? LOGIN_BLOCK_MS : REGISTER_BLOCK_MS)) {
      attemptsMap.delete(ip);
    }
  }
}

// ─── Rate Limit para LOGIN ───────────────────────────────────────────────────
export function rateLimitLogin(req, res, next) {
  const ip = getClientIP(req);
  cleanupAttempts(loginAttempts, LOGIN_WINDOW_MS);

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 0, firstAttempt: Date.now(), blocked: false, blockedUntil: null });
  }

  const data = loginAttempts.get(ip);
  const now = Date.now();

  // Si está bloqueado, verificar si el bloqueo ha expirado
  if (data.blocked && now < data.blockedUntil) {
    const minutosRestantes = Math.ceil((data.blockedUntil - now) / 1000 / 60);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} minutos.`,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000)
    });
  }

  // Si el bloqueo expiró, resetear
  if (data.blocked && now >= data.blockedUntil) {
    data.blocked = false;
    data.count = 0;
    data.firstAttempt = now;
  }

  // Si pasó la ventana de tiempo, resetear contador
  if (now - data.firstAttempt > LOGIN_WINDOW_MS) {
    data.count = 0;
    data.firstAttempt = now;
  }

  // Pasar información al controlador para que incremente el contador si falla
  req.loginAttempts = data;
  req.ipAddress = ip;

  next();
}

// ─── Rate Limit para REGISTER ────────────────────────────────────────────────
export function rateLimitRegister(req, res, next) {
  const ip = getClientIP(req);
  cleanupAttempts(registerAttempts, REGISTER_WINDOW_MS);

  if (!registerAttempts.has(ip)) {
    registerAttempts.set(ip, { count: 0, firstAttempt: Date.now(), blocked: false, blockedUntil: null });
  }

  const data = registerAttempts.get(ip);
  const now = Date.now();

  // Si está bloqueado, verificar si el bloqueo ha expirado
  if (data.blocked && now < data.blockedUntil) {
    const horasRestantes = Math.ceil((data.blockedUntil - now) / 1000 / 3600);
    return res.status(429).json({
      error: `Demasiados intentos de registro. Intenta de nuevo en ${horasRestantes} horas.`,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000)
    });
  }

  // Si el bloqueo expiró, resetear
  if (data.blocked && now >= data.blockedUntil) {
    data.blocked = false;
    data.count = 0;
    data.firstAttempt = now;
  }

  // Si pasó la ventana de tiempo, resetear contador
  if (now - data.firstAttempt > REGISTER_WINDOW_MS) {
    data.count = 0;
    data.firstAttempt = now;
  }

  // Pasar información al controlador para que incremente el contador si falla
  req.registerAttempts = data;
  req.ipAddress = ip;

  next();
}

// ─── Funciones para incrementar intentos fallidos ────────────────────────────
export function incrementLoginAttempts(req) {
  if (!req.loginAttempts) return;

  const data = req.loginAttempts;
  data.count++;

  if (data.count >= LOGIN_MAX_ATTEMPTS) {
    data.blocked = true;
    data.blockedUntil = Date.now() + LOGIN_BLOCK_MS;
  }
}

export function incrementRegisterAttempts(req) {
  if (!req.registerAttempts) return;

  const data = req.registerAttempts;
  data.count++;

  if (data.count >= REGISTER_MAX_ATTEMPTS) {
    data.blocked = true;
    data.blockedUntil = Date.now() + REGISTER_BLOCK_MS;
  }
}

// ─── Función para obtener intentos restantes ────────────────────────────────
export function getLoginAttemptsRemaining(req) {
  if (!req.loginAttempts) return LOGIN_MAX_ATTEMPTS;
  return Math.max(0, LOGIN_MAX_ATTEMPTS - req.loginAttempts.count);
}

export function getRegisterAttemptsRemaining(req) {
  if (!req.registerAttempts) return REGISTER_MAX_ATTEMPTS;
  return Math.max(0, REGISTER_MAX_ATTEMPTS - req.registerAttempts.count);
}