import { saveReplay, getReplayBySlot, getReplaysByUser, deleteReplay } from '../services/index.js';

/**
 * Endpoint: POST /api/users/:userId/slots/:slotId/replay
 * Guarda la grabación de una partida completa
 * El movements array contiene la posición, HP y pokéballs en cada turno
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {string} req.params.slotId - ID del slot jugado
 * @param {Array} req.body.movements - Array de movimientos [{hp, r, c, pok}, ...]
 * @param {Object} res - Express response
 * @returns {Object} Objeto del replay guardado
 * @example
 * // POST body:
 * // { movements: [ {hp: 10, r: 0, c: 0, pok: 0}, {hp: 10, r: 1, c: 0, pok: 0}, ... ] }
 */
export async function createReplay(req, res) {
  try {
    const { movements } = req.body;
    const userId = req.params.userId;
    const slotId = req.params.slotId;

    if (!movements || !Array.isArray(movements)) {
      return res.status(400).json({ error: 'Movements debe ser un array' });
    }

    const replay = await saveReplay(userId, slotId, movements);
    res.status(201).json(replay);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/users/:userId/slots/:slotId/replay
 * Obtiene la grabación completa de una partida específica
 * Devuelve el array de movimientos que puedes usar para reproducir la partida
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {string} req.params.slotId - ID del slot
 * @param {Object} res - Express response
 * @returns {Object} Objeto replay con array movements
 */
export async function getReplay(req, res) {
  try {
    const slotId = req.params.slotId;
    const replay = await getReplayBySlot(slotId);
    res.json(replay);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/users/:userId/replays
 * Obtiene todos los replays de un usuario
 * Útil para análisis de patrones de juego, mapas de calor, estadísticas
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {Object} res - Express response
 * @returns {Array} Array de todos los replays del usuario
 */
export async function getUserReplays(req, res) {
  try {
    const userId = req.params.userId;
    const replays = await getReplaysByUser(userId);
    res.json(replays);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: DELETE /api/users/:userId/replays/:replayId
 * Elimina un replay (solo para admins)
 * @param {Object} req - Express request
 * @param {string} req.params.replayId - ID del replay a eliminar
 * @param {Object} req.user - Usuario autenticado (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación
 */
export async function removeReplay(req, res) {
  try {
    const replayId = req.params.replayId;
    const result = await deleteReplay(replayId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
