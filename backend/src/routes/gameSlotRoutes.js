import express from 'express';
import { getSlotsByUser, getSlotById, createSlot, updateSlot, deleteSlot } from '../controllers/gameSlotController.js';
import { verifyToken } from '../middlewares/index.js';
import { validateCreateSlot, validateUpdateSlot } from '../validations/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/{userId}/slots:
 *   get:
 *     summary: Obtener todos los slots del usuario
 *     description: Lista todos los slots de juego (partidas guardadas) del usuario. Un usuario puede tener máximo 3 slots.
 *     tags:
 *       - Slots de Juego
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de slots obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameSlot'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:userId/slots', verifyToken, getSlotsByUser);

/**
 * @swagger
 * /api/users/{userId}/slots/{slotNumber}:
 *   get:
 *     summary: Obtener un slot específico
 *     description: Obtiene información detallada de un slot de juego específico (1, 2 o 3)
 *     tags:
 *       - Slots de Juego
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: slotNumber
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del slot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSlot'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Slot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:userId/slots/:slotNumber', verifyToken, getSlotById);

/**
 * @swagger
 * /api/users/{userId}/slots:
 *   post:
 *     summary: Crear nuevo slot de juego
 *     description: Crea una nueva partida guardada. El usuario puede tener máximo 3 slots simultáneamente.
 *     tags:
 *       - Slots de Juego
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slot_number:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 example: 1
 *               explorer:
 *                 type: string
 *                 example: "boy"
 *               explorer_name:
 *                 type: string
 *                 example: "ASH"
 *               color:
 *                 type: string
 *                 format: color
 *                 example: "#019273"
 *               difficulty_id:
 *                 type: string
 *                 enum: ["facil", "normal", "dificil", "infernal"]
 *                 example: "normal"
 *             required:
 *               - slot_number
 *               - explorer
 *               - explorer_name
 *               - color
 *               - difficulty_id
 *     responses:
 *       201:
 *         description: Slot creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSlot'
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.post('/:userId/slots', verifyToken, validateCreateSlot, createSlot);

/**
 * @swagger
 * /api/users/{userId}/slots/{slotNumber}:
 *   put:
 *     summary: Actualizar datos del slot
 *     description: Actualiza el estado actual de un slot durante la partida (HP, pokéballs, posición, etc)
 *     tags:
 *       - Slots de Juego
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: slotNumber
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hp:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 8
 *               pokeball:
 *                 type: integer
 *                 minimum: 0
 *                 example: 15
 *               position_r:
 *                 type: integer
 *                 example: 5
 *               position_c:
 *                 type: integer
 *                 example: 7
 *               is_game_over:
 *                 type: boolean
 *                 example: false
 *               is_goal:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Slot actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSlot'
 *       400:
 *         description: Validación fallida (valores fuera de rango)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Slot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.put('/:userId/slots/:slotNumber', verifyToken, validateUpdateSlot, updateSlot);

/**
 * @swagger
 * /api/users/{userId}/slots/{slotNumber}:
 *   delete:
 *     summary: Eliminar slot de juego
 *     description: Elimina un slot completamente. Se eliminan también todos los pokémon capturados en este slot y su replay (cascada).
 *     tags:
 *       - Slots de Juego
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: slotNumber
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         example: 1
 *     responses:
 *       200:
 *         description: Slot eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slot eliminado"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Slot no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:userId/slots/:slotNumber', verifyToken, deleteSlot);

export default router;
