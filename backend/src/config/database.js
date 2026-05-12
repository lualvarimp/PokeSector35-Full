import { Sequelize } from 'sequelize';

import dotenv from 'dotenv';
dotenv.config();
console.log('PUERTO DB:', process.env.DB_PORT)

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Cambiar a console.log si quieres ver las queries
  }
);

export default sequelize;
