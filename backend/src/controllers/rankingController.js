import { getRankingGlobal, getRankingByUser, createNewRanking, deleteRankingById } from '../services/index.js';
import { getRankingByPercentage } from '../services/index.js';

/**
 * Endpoint: GET /api/ranking
 * Obtiene el ranking global, opcionalmente filtrado por dificultad
 * Ordena por cantidad de pokémon capturados (descendente)
 * @param {Object} req - Express request
 * @param {string} [req.query.difficulty] - Filtro opcional (facil, normal, dificil, infernal)
 * @param {Object} res - Express response
 * @returns {Array} Array de rankings ordenados por capturas
 * @example
 * // GET /api/ranking?difficulty=normal
 * // Devuelve solo rankings de dificultad "normal"
 */
export async function getAllRanking(req, res) {
  try {
    const difficulty = req.query.difficulty;
    const ranking = await getRankingGlobal(difficulty);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/ranking/:userId
 * Obtiene el historial de rankings de un usuario específico
 * Muestra todas sus partidas completadas en orden cronológico descendente
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {Object} req.user - Datos del usuario autenticado (validado por JWT)
 * @param {Object} res - Express response
 * @returns {Array} Array de rankings del usuario
 */
export async function getUserRanking(req, res) {
  try {
    const userRanking = await getRankingByUser(req.params.userId);
    res.json(userRanking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/ranking/:userId
 * Registra una nueva entrada en el ranking cuando se completa una partida
 * Requiere mínimo 10 encuentros totales (validado por validateCreateRanking)
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {number} req.body.captured_count - Pokémon capturados en la partida
 * @param {number} req.body.escaped_count - Pokémon que escaparon
 * @param {string} req.body.difficulty_id - Dificultad en que se jugó
 * @param {Object} res - Express response
 * @returns {Object} Objeto de ranking creado con timestamp
 */
export async function createRanking(req, res) {
  try {
    const ranking = await createNewRanking(req.params.userId, req.body);
    res.status(201).json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: DELETE /api/ranking/:rankingId
 * Elimina una entrada de ranking (solo para admins)
 * Útil para remover rankings fraudulentos o datos de prueba
 * @param {Object} req - Express request
 * @param {string} req.params.rankingId - ID de la entrada a eliminar
 * @param {Object} req.user - Datos del usuario (debe ser admin)
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación
 */
export async function deleteRanking(req, res) {
  try {
    const result = await deleteRankingById(req.params.rankingId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/ranking/by-percentage
 * Obtiene el ranking ordenado por porcentaje de captura en lugar de cantidad total
 * Muestra quién tiene mejor ratio: capturas / (capturas + escapadas)
 * Solo incluye jugadores con mínimo 10 encuentros
 * @param {Object} req - Express request
 * @param {string} [req.query.difficulty] - Filtro opcional por dificultad
 * @param {Object} res - Express response
 * @returns {Array} Array de rankings con campo capture_rate añadido
 * @example
 * // Respuesta incluye:
 * // { username: "Ash", captured_count: 15, escaped_count: 5, capture_rate: 75.00 }
 */
export async function getRankingPercentage(req, res) {
  try {
    const difficulty = req.query.difficulty;
    const ranking = await getRankingByPercentage(difficulty);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
