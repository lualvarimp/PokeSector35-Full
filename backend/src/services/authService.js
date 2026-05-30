import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, RefreshToken } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Máximo de refresh tokens activos por usuario.
 * Permite tener sesión en varios dispositivos sin acumular tokens sin límite.
 */
const MAX_REFRESH_TOKENS_PER_USER = 5;

/**
 * Registra un nuevo usuario en el sistema
 * @param {string} username - Nombre de usuario único (3-15 caracteres)
 * @param {string} password - Contraseña sin encriptar (mínimo 6 caracteres)
 * @returns {Promise<Object>} Objeto del usuario creado (sin password_hash)
 * @throws {Error} Si el usuario ya existe
 */
export async function registerUser(username, password) {
  const userExists = await User.findOne({ where: { username } });
  if (userExists) {
    throw new Error('Usuario ya existe');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password_hash,
    role: 'user'
  });

  return user;
}

/**
 * Valida credenciales y devuelve el usuario si son correctas
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {Promise<Object>} Objeto del usuario autenticado
 * @throws {Error} Si las credenciales son incorrectas
 */
export async function loginUser(username, password) {
  const user = await User.findOne({ where: { username, deleted_at: null } });
  if (!user) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  return user;
}

/**
 * Genera un access token JWT con información del usuario
 * @param {Object} user - Objeto del usuario
 * @param {number} user.id - ID del usuario
 * @param {string} user.username - Nombre de usuario
 * @param {string} user.role - Rol (admin o user)
 * @returns {string} Access token firmado
 */
export function generateAccessToken(user) {
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return token;
}

/**
 * Genera y almacena un refresh token JWT en la BD
 * Limita a MAX_REFRESH_TOKENS_PER_USER tokens activos por usuario,
 * eliminando los más antiguos si se supera el límite.
 * @param {Object} user - Objeto del usuario
 * @param {number} user.id - ID del usuario
 * @returns {Promise<string>} Refresh token firmado
 */
export async function generateRefreshToken(user) {
  // 1. Limpiar tokens expirados de este usuario
  await RefreshToken.destroy({
    where: {
      user_id: user.id,
      expires_at: { [Op.lt]: new Date() }
    }
  });

  // 2. Contar tokens activos restantes
  const activeCount = await RefreshToken.count({
    where: { user_id: user.id }
  });

  // 3. Si hay demasiados, eliminar los más antiguos para dejar hueco
  if (activeCount >= MAX_REFRESH_TOKENS_PER_USER) {
    const tokensToDelete = await RefreshToken.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'ASC']],
      limit: activeCount - MAX_REFRESH_TOKENS_PER_USER + 1
    });

    const idsToDelete = tokensToDelete.map(t => t.id);
    await RefreshToken.destroy({
      where: { id: { [Op.in]: idsToDelete } }
    });
  }

  // 4. Crear el nuevo token
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: expiresAt
  });

  return refreshToken;
}

/**
 * Valida un refresh token y genera un nuevo access token si es válido
 * @param {string} refreshToken - Token JWT de refresh
 * @returns {Promise<string>} Nuevo access token
 * @throws {Error} Si el refresh token es inválido o ha expirado
 */
export async function refreshAccessToken(refreshToken) {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const storedToken = await RefreshToken.findOne({
    where: { token: refreshToken, user_id: decoded.id }
  });

  if (!storedToken) {
    throw new Error('Refresh token inválido o expirado');
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Limpiar tokens expirados de toda la tabla aprovechando la petición
  await RefreshToken.destroy({
    where: {
      expires_at: { [Op.lt]: new Date() }
    }
  });

  return generateAccessToken(user);
}