import { User } from '../models/index.js';
import { getUserStats } from '../services/index.js';
import bcrypt from 'bcrypt';

/**
 * Endpoint: GET /api/users
 * Obtiene lista de todos los usuarios del sistema (solo para admins)
 * Excluye el hash de contraseña por seguridad
 * @param {Object} req - Express request
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Array} Array de objetos usuario sin password_hash
 */
export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/users/:id
 * Obtiene información de un usuario específico
 * Cada usuario solo ve su propia información (controlado en autorización)
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario a obtener
 * @param {Object} res - Express response
 * @returns {Object} Objeto usuario sin password_hash ni deleted_at
 */
export async function getUserById(req, res) {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'deleted_at'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: PUT /api/users/:id
 * Actualiza información de un usuario (nombre, email si fuera)
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario a actualizar
 * @param {Object} req.body - Campos a actualizar
 * @param {Object} res - Express response
 * @returns {Object} Objeto usuario actualizado
 */
export async function updateUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Solo permitir actualizar el username — nunca role, password_hash ni deleted_at
    const allowedFields = ['username'];
    const filteredData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        filteredData[key] = req.body[key];
      }
    }

    await user.update(filteredData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: DELETE /api/users/:id
 * Elimina un usuario (soft delete: marca deleted_at con la fecha actual)
 * El usuario sigue en la BD pero aparecerá como "eliminado"
 * Solo admins pueden hacer esto
 * IMPORTANTE: Un admin NO puede eliminar a otro admin
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario a eliminar
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación y datos del usuario
 */
export async function deleteUser(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validación: un admin no puede eliminar a otro admin
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'No se puede eliminar a un administrador' });
    }

    // Soft delete: marcar deleted_at
    await user.update({ deleted_at: new Date() });
    res.json({ message: 'Usuario eliminado', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/users/:id/stats
 * Obtiene estadísticas agregadas de un usuario
 * Incluye totales de partidas, pokémon capturados/escapados, pokémon únicos
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario
 * @param {Object} res - Express response
 * @returns {Object} Objeto con estadísticas
 * @example
 * // Respuesta:
 * // { username: "Ash", total_games: 5, total_captured: 32, total_escaped: 8, unique_pokemon: 20 }
 */
export async function getStats(req, res) {
  try {
    const stats = await getUserStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * Endpoint: PUT /api/users/:id/restore
 * Restaura un usuario eliminado (revierte soft delete)
 * Solo admins pueden hacer esto
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario a restaurar
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación y datos del usuario
 */
export async function restoreUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await user.update({ deleted_at: null });
    res.json({ message: 'Usuario restaurado', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: DELETE /api/users/:id/permanent
 * Elimina un usuario permanentemente (hard delete)
 * ADVERTENCIA: Esta acción no se puede deshacer
 * Solo admins pueden hacer esto
 * IMPORTANTE: Un admin NO puede eliminar permanentemente a otro admin
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario a eliminar permanentemente
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación
 */
export async function permanentDeleteUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, { paranoid: false });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validación: un admin no puede eliminar permanentemente a otro admin
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'No se puede eliminar a un administrador' });
    }
    
    await user.destroy({ force: true });
    res.json({ message: 'Usuario eliminado permanentemente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: PUT /api/users/:id/change-password
 * Cambia la contraseña de un usuario
 * La nueva contraseña se hashea con bcrypt antes de guardar
 * Solo admins pueden cambiar contraseñas de otros usuarios
 * @param {Object} req - Express request
 * @param {string} req.params.id - ID del usuario
 * @param {string} req.body.new_password - Nueva contraseña (mínimo 6 caracteres)
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación
 */
export async function changePassword(req, res) {
  try {
    const { new_password } = req.body;
    const userId = req.params.id;
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Contraseña debe tener mínimo 6 caracteres' });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Hashear con bcrypt
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hashedPassword });
    
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}