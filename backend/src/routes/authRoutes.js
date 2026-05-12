import express from 'express';
import { register, login, loginGame, refresh, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validations/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Username debe ser único y entre 3-15 caracteres. Password mínimo 6 caracteres.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 15
 *                 example: "Ash"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "pikachuForever123"
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validación fallida (username duplicado, formato inválido, etc)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario ya existe"
 *     security: []
 */
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión (SOLO para administradores)
 *     description: Autentica un usuario y devuelve tokens JWT. RESTRICCION - Solo usuarios con rol admin pueden loguear. Los usuarios con rol user recibiran error 403.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Ash"
 *               password:
 *                 type: string
 *                 example: "pikachuForever123"
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve tokens JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Usuario o contraseña incorrectos"
 *       403:
 *         description: Usuario no es administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Solo administradores pueden acceder a este panel"
 *     security: []
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/login-game:
 *   post:
 *     summary: Iniciar sesión (jugadores del juego, cualquier rol)
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required: [username, password]
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas
 *     security: []
 */
router.post('/login-game', validateLogin, loginGame);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     description: Usa un refresh token válido para obtener un nuevo access token sin volver a loguear
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             required:
 *               - refresh_token
 *     responses:
 *       200:
 *         description: Nuevo access token generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Refresh token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security: []
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión del usuario (actualmente es un endpoint stub)
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso"
 *     security:
 *       - BearerAuth: []
 */
router.post('/logout', logout);

export default router;