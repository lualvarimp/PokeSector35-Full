import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GameSlot = sequelize.define('GameSlot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  slot_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  explorer: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  explorer_name: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false
  },
  difficulty_id: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  hp: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  pokeball: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  position_r: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  position_c: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_game_over: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_goal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'game_slots',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

export default GameSlot;