import { registerUser, loginUser, generateAccessToken, generateRefreshToken, refreshAccessToken } from '../services/index.js';
import { incrementLoginAttempts, getLoginAttemptsRemaining, incrementRegisterAttempts, getRegisterAttemptsRemaining } from '../middlewares/rateLimitMiddleware.js';
import { validateUsername, validatePassword } from '../validations/usernameValidation.js';

/**
 * Endpoint: POST /api/auth/register
 * Crea una nueva cuenta de usuario
 * Con validación contra bots/spam y rate limiting
 * @param {Object} req - Express request
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña
 * @param {Object} res - Express response
 */
export async function register(req, res) {
  try {
    const { username, password } = req.body;

    // ─── VALIDACIÓN 1: Username contra bots/spam ────────────────────────────
    const { valid: usernameValid, reason: usernameReason } = validateUsername(username);
    if (!usernameValid) {
      incrementRegisterAttempts(req);
      return res.status(400).json({ error: usernameReason });
    }

    // ─── VALIDACIÓN 2: Contraseña contra bots/spam ──────────────────────────
    const { valid: passwordValid, reason: passwordReason } = validatePassword(password);
    if (!passwordValid) {
      incrementRegisterAttempts(req);
      return res.status(400).json({ error: passwordReason });
    }

    // ─── REGISTRO: Si validaciones pasaron ──────────────────────────────────
    console.log(`📝 Registro: username="${username}"`);
    const user = await registerUser(username, password);
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(201).json({ 
      message: 'Usuario registrado', 
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('❌ Error en register:', error.message, error.stack);
    
    // Si es error de usuario duplicado, incrementar intentos
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      incrementRegisterAttempts(req);
    }
    
    res.status(400).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/auth/login
 * Autentica un usuario y devuelve tokens JWT
 * ⚠️ SOLO permite login a usuarios con rol 'admin'
 * Con rate limiting contra fuerza bruta
 * @param {Object} req - Express request
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña
 * @param {Object} res - Express response
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);

    // ✅ VALIDACIÓN: Solo admin puede loguear
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'SOLO ADMINISTRADORES' 
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({ 
      message: 'Login exitoso', 
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    // En login fallido, incrementar intentos
    incrementLoginAttempts(req);
    res.status(401).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/auth/login-game
 * Autentica un usuario del juego (cualquier rol)
 * Con rate limiting contra fuerza bruta
 * @param {Object} req - Express request
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña
 * @param {Object} res - Express response
 */
export async function loginGame(req, res) {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({ 
      message: 'Login exitoso', 
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    // En login fallido, incrementar intentos y mostrar cuántos intentos restan
    incrementLoginAttempts(req);
    const attemptsRemaining = getLoginAttemptsRemaining(req);
    
    if (attemptsRemaining === 0) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta. Cuenta bloqueada por 15 minutos.' 
      });
    }
    
    res.status(401).json({ 
      error: `Contraseña incorrecta. Te quedan ${attemptsRemaining} intentos.`,
      attemptsRemaining: attemptsRemaining
    });
  }
}

/**
 * Endpoint: POST /api/auth/refresh
 * Genera un nuevo access token usando un refresh token válido
 * @param {Object} req - Express request
 * @param {string} req.body.refresh_token - Refresh token
 * @param {Object} res - Express response
 */
export async function refresh(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const accessToken = await refreshAccessToken(refresh_token);
    res.json({ access_token: accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
}

/**
 * Endpoint: POST /api/auth/logout
 * Cierra la sesión del usuario (actualmente es un stub)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export async function logout(req, res) {
  try {
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}