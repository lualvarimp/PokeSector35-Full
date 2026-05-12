import User from './userModels.js';
import GameSlot from './gameSlotModels.js';
import CapturedPokemon from './capturedPokemonModels.js';
import Ranking from './rankingModels.js';
import RefreshToken from './refreshTokenModels.js';
import GameReplay from './gameReplayModels.js';

// Relaciones
User.hasMany(GameSlot, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GameSlot.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CapturedPokemon, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CapturedPokemon.belongsTo(User, { foreignKey: 'user_id' });

GameSlot.hasMany(CapturedPokemon, { foreignKey: 'slot_id', onDelete: 'CASCADE' });
CapturedPokemon.belongsTo(GameSlot, { foreignKey: 'slot_id' });

User.hasMany(Ranking, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Ranking.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(GameReplay, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GameReplay.belongsTo(User, { foreignKey: 'user_id' });

GameSlot.hasMany(GameReplay, { foreignKey: 'slot_id', onDelete: 'CASCADE' });
GameReplay.belongsTo(GameSlot, { foreignKey: 'slot_id' });

export { User, GameSlot, CapturedPokemon, Ranking, RefreshToken, GameReplay };