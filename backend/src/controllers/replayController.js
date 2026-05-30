import { saveReplay, getReplayBySlot, getReplaysByUser, deleteReplay } from '../services/index.js';

/**
 * Límite máximo de movimientos por partida.
 * Un mapa grande con muchas idas y venidas no debería superar los 2000 turnos.
 */
const MAX_MOVEMENTS = 2000;

/**
 * Valida que un movimiento individual tenga la estructura correcta.
 * Cada movimiento debe tener: hp (número), r (número), c (número), pok (número).
 * @param {Object} mov - Movimiento a validar
 * @returns {boolean} true si es válido
 */
function isValidMovement(mov) {
  return (
    mov !== null &&
    typeof mov === 'object' &&
    typeof mov.hp === 'number' &&
    typeof mov.r === 'number' &&
    typeof mov.c === 'number' &&
    typeof mov.pok === 'number'
  );
}

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
 */
export async function createReplay(req, res) {
  try {
    const { movements } = req.body;
    const userId = req.params.userId;
    const slotId = req.params.slotId;

    if (!movements || !Array.isArray(movements)) {
      return res.status(400).json({ error: 'Movements debe ser un array' });
    }

    if (movements.length === 0) {
      return res.status(400).json({ error: 'Movements no puede estar vacío' });
    }

    if (movements.length > MAX_MOVEMENTS) {
      return res.status(400).json({ error: `Movements no puede superar ${MAX_MOVEMENTS} elementos` });
    }

    // Validar que cada movimiento tenga la estructura esperada
    const allValid = movements.every(isValidMovement);
    if (!allValid) {
      return res.status(400).json({ error: 'Cada movimiento debe tener hp, r, c y pok como números' });
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