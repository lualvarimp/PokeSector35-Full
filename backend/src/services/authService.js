import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

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
 * Los refresh tokens duran 7 días y se usan solo para renovar access tokens
 * @param {Object} user - Objeto del usuario
 * @param {number} user.id - ID del usuario
 * @returns {Promise<string>} Refresh token firmado
 */
export async function generateRefreshToken(user) {
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

  return generateAccessToken(user);
}
