import express from 'express';
import { createReplay, getReplay, getUserReplays, removeReplay } from '../controllers/replayController.js';
import { verifyToken, requireAdmin } from '../middlewares/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/{userId}/slots/{slotId}/replay:
 *   post:
 *     summary: Guardar grabación de partida
 *     description: Guarda el replay (grabación) completa de una partida. El movements array contiene posición, HP y pokéballs en cada turno.
 *     tags:
 *       - Replays
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: slotId
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
 *               movements:
 *                 type: array
 *                 description: Array de movimientos, cada uno con HP, fila, columna y pokéballs
 *                 items:
 *                   type: object
 *                   properties:
 *                     hp:
 *                       type: integer
 *                       example: 10
 *                     r:
 *                       type: integer
 *                       description: Posición fila
 *                       example: 0
 *                     c:
 *                       type: integer
 *                       description: Posición columna
 *                       example: 0
 *                     pok:
 *                       type: integer
 *                       description: Pokéballs disponibles
 *                       example: 20
 *                 example:
 *                   - {hp: 10, r: 0, c: 0, pok: 20}
 *                   - {hp: 10, r: 1, c: 0, pok: 20}
 *                   - {hp: 10, r: 2, c: 0, pok: 19}
 *             required:
 *               - movements
 *     responses:
 *       201:
 *         description: Replay guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 slot_id:
 *                   type: integer
 *                   example: 1
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 movements:
 *                   type: array
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validación fallida (movements debe ser array)
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
 *       500:
 *         description: Error al guardar replay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.post('/:userId/slots/:slotId/replay', verifyToken, createReplay);

/**
 * @swagger
 * /api/users/{userId}/slots/{slotId}/replay:
 *   get:
 *     summary: Obtener replay de una partida
 *     description: Obtiene la grabación completa de una partida específica con todos los movimientos registrados
 *     tags:
 *       - Replays
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Replay obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 slot_id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 movements:
 *                   type: array
 *                   description: Array con todos los movimientos de la partida
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Replay no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:userId/slots/:slotId/replay', verifyToken, getReplay);

/**
 * @swagger
 * /api/users/{userId}/replays:
 *   get:
 *     summary: Obtener todos los replays del usuario
 *     description: Obtiene todas las grabaciones de un usuario. Útil para análisis de patrones de juego y estadísticas.
 *     tags:
 *       - Replays
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Replays del usuario obtenidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   slot_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   movements:
 *                     type: array
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:userId/replays', verifyToken, getUserReplays);

/**
 * @swagger
 * /api/users/{userId}/replays/{replayId}:
 *   delete:
 *     summary: Eliminar un replay
 *     description: Elimina una grabación de partida del servidor. Solo admin puede hacer esto.
 *     tags:
 *       - Replays
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: replayId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Replay eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Replay eliminado"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: No tiene permisos de admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Replay no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:userId/replays/:replayId', verifyToken, requireAdmin, removeReplay);

export default router;
