import express from 'express';
import { getPokedexByUser, addCapturedPokemon, deleteCapturedPokemon, getCapturesBySlot } from '../controllers/capturedPokemonController.js';
import { verifyToken } from '../middlewares/index.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/{id}/pokedex:
 *   get:
 *     summary: Obtener Pokédex del usuario
 *     description: Obtiene la lista completa de pokémon capturados por el usuario en todas sus partidas
 *     tags:
 *       - Pokédex
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pokédex del usuario obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CapturedPokemon'
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
router.get('/:id/pokedex', verifyToken, getPokedexByUser);

/**
 * @swagger
 * /api/users/{id}/pokedex:
 *   post:
 *     summary: Agregar pokémon capturado al Pokédex
 *     description: Registra un nuevo pokémon capturado en el Pokédex del usuario. Se integra con PokeAPI.
 *     tags:
 *       - Pokédex
 *     parameters:
 *       - in: path
 *         name: id
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
 *               pokemon_id:
 *                 type: integer
 *                 description: ID del pokémon según PokeAPI
 *                 example: 25
 *               pokemon_name:
 *                 type: string
 *                 description: Nombre del pokémon (usualmente en mayúsculas)
 *                 example: "PIKACHU"
 *               slot_id:
 *                 type: integer
 *                 description: ID del slot donde fue capturado (opcional)
 *                 nullable: true
 *                 example: 1
 *               is_global:
 *                 type: boolean
 *                 description: Si es captura global (true) o local de slot (false)
 *                 example: true
 *             required:
 *               - pokemon_id
 *               - pokemon_name
 *     responses:
 *       201:
 *         description: Pokémon agregado al Pokédex
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CapturedPokemon'
 *       400:
 *         description: Validación fallida (faltan campos requeridos)
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
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - BearerAuth: []
 */
router.post('/:id/pokedex', verifyToken, addCapturedPokemon);

/**
 * @swagger
 * /api/users/{id}/pokedex/{pokemonId}:
 *   delete:
 *     summary: Eliminar pokémon del Pokédex
 *     description: Elimina una captura de pokémon del Pokédex. Útil si fue registrada por error.
 *     tags:
 *       - Pokédex
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: pokemonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la captura a eliminar (no del pokémon en PokeAPI)
 *         example: 1
 *     responses:
 *       200:
 *         description: Pokémon eliminado del Pokédex
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pokémon eliminado correctamente"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pokémon no encontrado
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
router.delete('/:id/pokedex/:pokemonId', verifyToken, deleteCapturedPokemon);

/**
 * @swagger
 * /api/users/{userId}/captures/{slotId}:
 *   get:
 *     summary: Obtener capturas de un slot específico
 *     description: Obtiene todos los pokémon capturados en una partida específica (slot)
 *     tags:
 *       - Pokédex
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
 *         description: Capturas del slot obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CapturedPokemon'
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
router.get('/:userId/captures/:slotId', verifyToken, getCapturesBySlot);

export default router;
