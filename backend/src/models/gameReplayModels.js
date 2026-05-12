import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GameReplay = sequelize.define('GameReplay', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slot_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movements: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'game_replay',
  timestamps: true,
  createdAt: 'completed_at',
  updatedAt: false
});

export default GameReplay;