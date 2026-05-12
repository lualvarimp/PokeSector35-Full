import express from 'express';
import { getAllRanking, getUserRanking, createRanking, deleteRanking, getRankingPercentage } from '../controllers/rankingController.js';
import { verifyToken, requireAdmin } from '../middlewares/index.js';
import { validateCreateRanking } from '../validations/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/ranking:
 *   get:
 *     summary: Obtener ranking global
 *     description: Obtiene el ranking global ordenado por cantidad de pokémon capturados. Puede filtrar por dificultad. Solo incluye usuarios con mínimo 10 encuentros.
 *     tags:
 *       - Ranking
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: ["facil", "normal", "dificil", "infernal"]
 *         description: Filtrar por dificultad (opcional)
 *         example: "normal"
 *     responses:
 *       200:
 *         description: Ranking global obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ranking'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/', verifyToken, getAllRanking);

/**
 * @swagger
 * /api/ranking/by-percentage:
 *   get:
 *     summary: Obtener ranking por porcentaje de captura
 *     description: Obtiene el ranking ordenado por el porcentaje de capturas exitosas (capturas / total encuentros). Mejor para ver quién tiene más precisión.
 *     tags:
 *       - Ranking
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: ["facil", "normal", "dificil", "infernal"]
 *         description: Filtrar por dificultad (opcional)
 *         example: "normal"
 *     responses:
 *       200:
 *         description: Ranking por porcentaje obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   captured_count:
 *                     type: integer
 *                   escaped_count:
 *                     type: integer
 *                   capture_rate:
 *                     type: number
 *                     format: double
 *                     example: 75.50
 *                   difficulty_id:
 *                     type: string
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/by-percentage', verifyToken, getRankingPercentage);

/**
 * @swagger
 * /api/ranking/{userId}:
 *   get:
 *     summary: Obtener ranking de un usuario
 *     description: Obtiene el historial de rankings (todas las partidas completadas) de un usuario específico
 *     tags:
 *       - Ranking
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Historial de rankings del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ranking'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.get('/:userId', verifyToken, getUserRanking);

/**
 * @swagger
 * /api/ranking/{userId}:
 *   post:
 *     summary: Registrar nueva entrada en ranking
 *     description: Registra una nueva partida completada. Requiere mínimo 10 encuentros totales (capturas + escapadas).
 *     tags:
 *       - Ranking
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
 *               captured_count:
 *                 type: integer
 *                 minimum: 0
 *                 example: 18
 *               escaped_count:
 *                 type: integer
 *                 minimum: 0
 *                 example: 2
 *               difficulty_id:
 *                 type: string
 *                 enum: ["facil", "normal", "dificil", "infernal"]
 *                 example: "normal"
 *             required:
 *               - captured_count
 *               - escaped_count
 *               - difficulty_id
 *     responses:
 *       201:
 *         description: Entrada de ranking creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ranking'
 *       400:
 *         description: Validación fallida (menos de 10 encuentros)
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
router.post('/:userId', verifyToken, validateCreateRanking, createRanking);

/**
 * @swagger
 * /api/ranking/{rankingId}:
 *   delete:
 *     summary: Eliminar entrada de ranking
 *     description: Elimina una entrada de ranking. Solo admin puede hacer esto. Útil para remover datos fraudulentos o de prueba.
 *     tags:
 *       - Ranking
 *     parameters:
 *       - in: path
 *         name: rankingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Entrada de ranking eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ranking eliminado"
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
 *         description: Ranking no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:rankingId', verifyToken, requireAdmin, deleteRanking);

export default router;
