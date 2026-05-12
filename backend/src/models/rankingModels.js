import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ranking = sequelize.define('Ranking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  captured_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  escaped_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  difficulty_id: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'ranking',
  timestamps: true,
  createdAt: 'completed_at',
  updatedAt: false
});

export default Ranking;