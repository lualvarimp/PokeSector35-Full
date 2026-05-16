// =============================================================================
//  usernameValidation.js — Validación de nombres de usuario contra spam/bots
// =============================================================================
//  RESPONSABILIDAD: Rechazar nombres sospechosos que parecen creados por bots
//  o spam. Se aplica en el registro.
//
//  CRITERIOS DE RECHAZO:
//    · Nombres muy cortos (menos de 3 caracteres)
//    · Nombres muy largos (más de 20 caracteres)
//    · Nombres con patrones repetitivos (aaaa, 1111, etc.)
//    · Nombres genéricos de bots (user, admin, test, bot, spam, etc.)
//    · Solo números o símbolos
//    · Demasiados números consecutivos (user123456)
//
//  USO:
//    import { validateUsername } from './usernameValidation.js';
//    const { valid, reason } = validateUsername(username);
//    if (!valid) return res.status(400).json({ error: reason });
// =============================================================================

// Lista de palabras reservadas / nombres sospechosos
const SUSPICIOUS_NAMES = [
  'user', 'admin', 'test', 'bot', 'spam', 'hack', 'root', 'guest', 'demo',
  'system', 'config', 'password', 'login', 'account', 'null', 'undefined',
  'admin123', 'test123', 'user123', 'a', 'the', 'temp', 'tmp', 'xxxx',
  'asdf', 'qwerty', '123', '1234', 'abcd', 'pokemon', 'pokesector',
];

/**
 * Valida un nombre de usuario para detectar bots/spam
 * @param {string} username - Nombre de usuario a validar
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validateUsername(username) {
  if (!username) {
    return { valid: false, reason: 'El nombre de usuario es requerido' };
  }

  const trimmed = username.trim();

  // Longitud
  if (trimmed.length < 3) {
    return { valid: false, reason: 'El nombre debe tener al menos 3 caracteres' };
  }

  if (trimmed.length > 20) {
    return { valid: false, reason: 'El nombre no puede exceder 20 caracteres' };
  }

  // Nombres sospechosos
  if (SUSPICIOUS_NAMES.includes(trimmed.toLowerCase())) {
    return { valid: false, reason: 'Este nombre no está disponible' };
  }

  // Solo números
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, reason: 'El nombre no puede contener solo números' };
  }

  // Solo caracteres especiales
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, reason: 'El nombre debe contener al menos una letra' };
  }

  // Caracteres inválidos (solo letras, números, guiones, guiones bajos)
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, reason: 'Solo se permiten letras, números, guiones y guiones bajos' };
  }

  // Patrones repetitivos: aaaa, 1111, aaa, 111, etc.
  if (/(.)\1{2,}/.test(trimmed)) {
    return { valid: false, reason: 'El nombre contiene demasiados caracteres repetidos' };
  }

  // Demasiados números consecutivos (más de 4): user12345
  if (/\d{5,}/.test(trimmed)) {
    return { valid: false, reason: 'El nombre contiene demasiados números consecutivos' };
  }

  // Patrón típico de bot: empieza con palabra común + números (user123, test456)
  if (/^(user|test|admin|guest|player|bot)\d+$/i.test(trimmed)) {
    return { valid: false, reason: 'Este patrón de nombre parece automatizado' };
  }

  return { valid: true, reason: null };
}

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} { valid: boolean, reason: string }
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, reason: 'La contraseña es requerida' };
  }

  if (password.length < 4) {
    return { valid: false, reason: 'La contraseña debe tener al menos 4 caracteres' };
  }

  if (password.length > 128) {
    return { valid: false, reason: 'La contraseña es demasiado larga' };
  }

  // Contraseñas muy débiles / típicas de bots
  const weakPasswords = ['123456', 'password', '123123', 'admin', 'test', 'asdf', 'qwerty', 'aaaaaa'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return { valid: false, reason: 'La contraseña es demasiado débil' };
  }

  return { valid: true, reason: null };
}