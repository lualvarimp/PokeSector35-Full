import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CapturedPokemon = sequelize.define('CapturedPokemon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  slot_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pokemon_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pokemon_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_global: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'captured_pokemon',
  timestamps: true,
  createdAt: 'captured_at',
  updatedAt: false
});

export default CapturedPokemon;