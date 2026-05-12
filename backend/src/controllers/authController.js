import { registerUser, loginUser, generateAccessToken, generateRefreshToken, refreshAccessToken } from '../services/index.js';

/**
 * Endpoint: POST /api/auth/register
 * Crea una nueva cuenta de usuario
 * @param {Object} req - Express request
 * @param {string} req.body.username - Nombre de usuario
 * @param {string} req.body.password - Contraseña
 * @param {Object} res - Express response
 */
export async function register(req, res) {
  try {
    const { username, password } = req.body;
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
    res.status(400).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/auth/login
 * Autentica un usuario y devuelve tokens JWT
 * ⚠️ SOLO permite login a usuarios con rol 'admin'
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
    res.status(401).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/auth/login-game
 * Autentica un usuario del juego (cualquier rol)
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
    res.status(401).json({ error: error.message });
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