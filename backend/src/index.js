import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import './models/index.js';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, verifyAdminView } from './middlewares/index.js';

// ========== __dirname para ES6 MODULES ==========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== CREAR LA APP ==========
const app = express();

// ========== SEGURIDAD — Headers HTTP ==========
app.use(helmet());

// ========== CORS — solo permite capitanpixel.com en producción ==========
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://capitanpixel.com',
      'https://www.capitanpixel.com',
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: origen no permitido'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50kb' }));

// ========== CONFIGURACIÓN DE VISTAS (PUG) ==========
app.use(express.static(path.join(__dirname, '../public')));
app.use('/pokesector35', express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ========== RUTAS DE VISTAS (PANEL ADMIN) ==========
app.get('/', (req, res) => {
  res.redirect('/pokesector35/login');
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'PokéSector Admin - Login' });
});

app.get('/admin/dashboard', verifyAdminView, (req, res) => {
  res.render('dashboard', { title: 'PokéSector Admin - Dashboard' });
});

app.get('/admin/users', verifyAdminView, (req, res) => {
  res.render('users', { title: 'PokéSector Admin - Usuarios' });
});

app.get('/admin/ranking', verifyAdminView, (req, res) => {
  res.render('ranking', { title: 'PokéSector Admin - Ranking' });
});

app.get('/admin/users/:id', verifyAdminView, (req, res) => {
  res.render('users-detail', { title: 'PokéSector Admin - Detalles Usuario' });
});

app.get('/admin/pokedex', verifyAdminView, (req, res) => {
  res.render('pokedex', { title: 'PokéSector Admin - Pokédex' });
});

app.get('/admin/slots', verifyAdminView, (req, res) => {
  res.render('slots', { title: 'PokéSector Admin - Slots' });
});

// ========== RUTAS API ==========
app.use('/api', routes);

// ========== ERROR HANDLER ==========
app.use(errorHandler);

// ========== ARRANCAR SERVIDOR ==========
const startServer = async () => {
  try {
    // Verificar que las variables JWT existen antes de arrancar
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT_SECRET y JWT_REFRESH_SECRET son obligatorios en el .env');
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('✅ Base de datos conectada');

    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor PokeSector corriendo en puerto ${PORT}`);
      console.log(`🎮 Panel Admin disponible en /login`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar:', error.message);
  }
};

startServer();