import { Ranking } from '../models/index.js';
import sequelize from '../config/database.js';

/**
 * Obtiene el ranking global, opcionalmente filtrado por dificultad
 * Usa la vista SQL ranking_view que filtra usuarios eliminados y requiere mínimo 10 encuentros
 * @param {string} [difficulty] - Dificultad opcional (facil, normal, dificil, infernal)
 * @returns {Promise<Array>} Array de rankings ordenados por capturas descendente
 */
export async function getRankingGlobal(difficulty = null) {
  let query = 'SELECT * FROM ranking_view';

  if (difficulty) {
    query += ` WHERE difficulty_id = '${difficulty}'`;
  }

  query += ' ORDER BY captured_count DESC';

  const ranking = await sequelize.query(query);
  return ranking[0];
}

/**
 * Obtiene el historial de rankings de un usuario específico
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Array de rankings del usuario ordenados por fecha descendente
 */
export async function getRankingByUser(userId) {
  const userRanking = await Ranking.findAll({
    where: { user_id: userId },
    order: [['completed_at', 'DESC']]
  });

  return userRanking;
}

/**
 * Crea una nueva entrada de ranking cuando se completa una partida
 * @param {number} userId - ID del usuario
 * @param {Object} rankingData - Datos de la partida (captured_count, escaped_count, difficulty_id)
 * @returns {Promise<Object>} Objeto de ranking creado
 */
export async function createNewRanking(userId, rankingData) {
  const ranking = await Ranking.create({
    user_id: userId,
    ...rankingData
  });

  return ranking;
}

/**
 * Elimina una entrada de ranking (solo para admins)
 * @param {number} rankingId - ID de la entrada a eliminar
 * @returns {Promise<Object>} Mensaje de confirmación
 * @throws {Error} Si la entrada no existe
 */
export async function deleteRankingById(rankingId) {
  const ranking = await Ranking.findByPk(rankingId);

  if (!ranking) {
    throw new Error('Ranking no encontrado');
  }

  await ranking.destroy();
  return { message: 'Ranking eliminado' };
}

/**
 * Obtiene el ranking ordenado por porcentaje de captura (calculado)
 * Solo incluye jugadores con mínimo 10 encuentros
 * Útil para ver quién tiene mejor ratio de capturas, no solo cantidad
 * @param {string} [difficulty] - Dificultad opcional
 * @returns {Promise<Array>} Array de rankings ordenados por capture_rate descendente
 */
export async function getRankingByPercentage(difficulty = null) {
  let query = `
    SELECT 
      r.id,
      r.user_id,
      u.username,
      r.captured_count,
      r.escaped_count,
      r.difficulty_id,
      r.completed_at,
      ROUND((r.captured_count * 100.0 / NULLIF(r.captured_count + r.escaped_count, 0))::numeric, 2) AS capture_rate
    FROM ranking r
    JOIN users u ON r.user_id = u.id
    WHERE u.deleted_at IS NULL
      AND (r.captured_count + r.escaped_count) >= 10
  `;

  if (difficulty) {
    query += ` AND r.difficulty_id = '${difficulty}'`;
  }

  query += ` ORDER BY capture_rate DESC, r.completed_at ASC`;

  const ranking = await sequelize.query(query);
  return ranking[0];
}
