import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import './models/index.js';

import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/index.js';

// ========== __dirname para ES6 MODULES ==========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CREAR LA APP PRIMERO ==========
const app = express();

// ========== MIDDLEWARES ==========
app.use(cors());
app.use(express.json());

// ========== CONFIGURACIÓN DE VISTAS (PUG) ==========
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ========== SWAGGER UI - DOCUMENTACIÓN ==========
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========== RUTAS DE VISTAS (PANEL ADMIN) ==========
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'PokéSector Admin - Login' });
});

app.get('/admin/dashboard', (req, res) => {
  res.render('dashboard', { title: 'PokéSector Admin - Dashboard' });
});

app.get('/user/dashboard', (req, res) => {
  res.render('dashboard', { title: 'PokéSector - Mi Dashboard' });
});

app.get('/admin/users', (req, res) => {
  res.render('users', { title: 'PokéSector Admin - Usuarios' });
});

app.get('/user/users', (req, res) => {
  res.render('users', { title: 'PokéSector - Usuarios' });
});

app.get('/admin/ranking', (req, res) => {
  res.render('ranking', { title: 'PokéSector Admin - Ranking' });
});

app.get('/user/ranking', (req, res) => {
  res.render('ranking', { title: 'PokéSector - Ranking' });
});

app.get('/admin/users/:id', (req, res) => {
  res.render('users-detail', { title: 'PokéSector Admin - Detalles Usuario' });
});

app.get('/admin/pokedex', (req, res) => {
  res.render('pokedex', { title: 'PokéSector Admin - Pokédex' });
});

app.get('/admin/slots', (req, res) => {
  res.render('slots', { title: 'PokéSector Admin - Slots' });
});

// ========== RUTAS API ==========
app.use('/api', routes);

// ========== ERROR HANDLER ==========
app.use(errorHandler);

// ========== ARRANCAR SERVIDOR ==========
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Base de datos conectada en puerto 5432')

    await sequelize.sync({ force: false })
    console.log('✅ Modelos sincronizados')

    const PORT = process.env.PORT || 3000
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor PokeSector corriendo en http://localhost:${PORT}`)
      console.log(`📚 Swagger UI disponible en http://localhost:${PORT}/api-docs`)
      console.log(`🎮 Panel Admin disponible en http://localhost:${PORT}/login`)
    });

  } catch (error) {
    console.error('❌ Error al iniciar:', error)
  }
}

startServer()