import { GameReplay } from '../models/index.js';

/**
 * Guarda un replay completo de una partida en la base de datos
 * El replay contiene un array JSON de todos los movimientos realizados
 * @param {number} userId - ID del usuario propietario
 * @param {number} slotId - ID del slot asociado
 * @param {Array} movements - Array de movimientos (posición, HP, pokéballs, etc)
 * @returns {Promise<Object>} Objeto del replay creado
 * @throws {Error} Si hay error al guardar
 */
export async function saveReplay(userId, slotId, movements) {
  try {
    const replay = await GameReplay.create({
      user_id: userId,
      slot_id: slotId,
      movements: movements
    });
    return replay;
  } catch (error) {
    throw new Error('Error al guardar replay: ' + error.message);
  }
}

/**
 * Obtiene el replay de un slot específico
 * @param {number} slotId - ID del slot
 * @returns {Promise<Object>} Objeto del replay con el array de movimientos
 * @throws {Error} Si el replay no existe
 */
export async function getReplayBySlot(slotId) {
  try {
    const replay = await GameReplay.findOne({
      where: { slot_id: slotId }
    });
    if (!replay) {
      throw new Error('Replay no encontrado');
    }
    return replay;
  } catch (error) {
    throw new Error('Error al obtener replay: ' + error.message);
  }
}

/**
 * Obtiene todos los replays de un usuario
 * Útil para análisis de datos y patrones de juego
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Array de replays del usuario
 * @throws {Error} Si hay error
 */
export async function getReplaysByUser(userId) {
  try {
    const replays = await GameReplay.findAll({
      where: { user_id: userId }
    });
    return replays;
  } catch (error) {
    throw new Error('Error al obtener replays: ' + error.message);
  }
}

/**
 * Elimina un replay (solo para admins)
 * @param {number} replayId - ID del replay a eliminar
 * @returns {Promise<Object>} Mensaje de confirmación
 * @throws {Error} Si el replay no existe
 */
export async function deleteReplay(replayId) {
  try {
    const replay = await GameReplay.findByPk(replayId);
    if (!replay) {
      throw new Error('Replay no encontrado');
    }
    await replay.destroy();
    return { message: 'Replay eliminado' };
  } catch (error) {
    throw new Error('Error al eliminar replay: ' + error.message);
  }
}
