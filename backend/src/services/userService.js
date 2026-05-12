import { User, Ranking, CapturedPokemon, GameSlot } from '../models/index.js';
import sequelize from '../config/database.js';

/**
 * Obtiene estadísticas completas de un usuario usando Sequelize (sin SQL injection)
 * @param {number} userId - ID del usuario
 * @returns {Object} Estadísticas del usuario
 */
export async function getUserStats(userId) {
  try {
    // Validar que el usuario existe
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Contar pokémon capturados únicos (is_global = true) - sin SQL injection
    const uniquePokemonCount = await CapturedPokemon.count({
      distinct: true,
      col: 'pokemon_id',
      where: {
        user_id: userId,
        is_global: true
      }
    });

    // Contar pokémon capturados totales - sin SQL injection
    const totalCaptured = await CapturedPokemon.count({
      where: { user_id: userId }
    });

    // Obtener estadísticas de rangos usando Sequelize - sin SQL injection
    const rankingStats = await Ranking.findAll({
      where: { user_id: userId },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('escaped_count')), 'total_escaped'],
        [sequelize.fn('SUM', sequelize.col('captured_count')), 'total_captured']
      ],
      raw: true
    });

    const totalEscaped = rankingStats[0]?.total_escaped || 0;

    // Contar slots con partidas completadas - sin SQL injection
    const slotsWithGames = await GameSlot.count({
      where: {
        user_id: userId,
        is_game_over: true
      }
    });

    // Contar slots totales - sin SQL injection
    const totalSlots = await GameSlot.count({
      where: { user_id: userId }
    });

    // Contar total de partidas (entrada en ranking) - sin SQL injection
    const totalGames = await Ranking.count({
      where: { user_id: userId }
    });

    // Obtener el nombre del explorador del slot más reciente
    const latestSlot = await GameSlot.findOne({
      where: { user_id: userId },
      order: [['updated_at', 'DESC']],
      attributes: ['explorer_name']
    });
    const explorerName = latestSlot?.explorer_name || '-';

    return {
      username: user.username,
      explorer_name: explorerName,
      total_games: totalGames,
      total_captured: totalCaptured,
      total_escaped: totalEscaped || 0,
      total_slots: totalSlots,
      unique_pokemon: uniquePokemonCount,
      average_pokemon_per_slot: totalSlots > 0 ? Math.round(totalCaptured / totalSlots) : 0
    };
  } catch (error) {
    throw new Error(`Error obteniendo estadísticas: ${error.message}`);
  }
}