import { getSlotsByUserId, getSlotByNumber, createNewSlot, updateSlotData, deleteSlotData } from '../services/index.js';

/**
 * Endpoint: GET /api/users/:userId/slots
 * Obtiene todos los slots de juego de un usuario
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario propietario
 * @param {Object} res - Express response
 * @returns {Array} Array de objetos slot
 * @example
 * // Respuesta exitosa (200):
 * // [{ id: 1, slot_number: 1, explorer: "boy", hp: 10, ... }, ...]
 */
export async function getSlotsByUser(req, res) {
  try {
    const slots = await getSlotsByUserId(req.params.userId);
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: GET /api/users/:userId/slots/:slotNumber
 * Obtiene un slot específico de un usuario por su número (1, 2 o 3)
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {string} req.params.slotNumber - Número de slot (1, 2 o 3)
 * @param {Object} res - Express response
 * @returns {Object} Objeto del slot
 */
export async function getSlotById(req, res) {
  try {
    const slot = await getSlotByNumber(req.params.userId, req.params.slotNumber);
    res.json(slot);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * Endpoint: POST /api/users/:userId/slots
 * Crea un nuevo slot de juego para el usuario
 * Requiere validación previa (validateCreateSlot middleware)
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {number} req.body.slot_number - Número de slot (1, 2 o 3)
 * @param {string} req.body.explorer - Tipo de explorador
 * @param {string} req.body.explorer_name - Nombre personalizado
 * @param {string} req.body.color - Color hex (#RRGGBB)
 * @param {string} req.body.difficulty_id - Dificultad
 * @param {Object} res - Express response
 * @returns {Object} Objeto del slot creado
 */
export async function createSlot(req, res) {
  try {
    const slot = await createNewSlot(req.params.userId, req.body);
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Endpoint: PUT /api/users/:userId/slots/:slotNumber
 * Actualiza datos de un slot (típicamente HP y pokéballs)
 * Requiere validación previa (validateUpdateSlot middleware)
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario
 * @param {string} req.params.slotNumber - Número de slot a actualizar
 * @param {number} [req.body.hp] - Nuevos puntos de vida (0-10)
 * @param {number} [req.body.pokeball] - Nuevas pokéballs disponibles
 * @param {number} [req.body.position_r] - Nueva posición fila
 * @param {number} [req.body.position_c] - Nueva posición columna
 * @param {Object} res - Express response
 * @returns {Object} Objeto del slot actualizado
 */
export async function updateSlot(req, res) {
  try {
    const slot = await updateSlotData(req.params.userId, req.params.slotNumber, req.body);
    res.json(slot);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * Endpoint: DELETE /api/users/:userId/slots/:slotNumber
 * Elimina un slot de juego (cascada: también elimina capturas y replays asociados)
 * @param {Object} req - Express request
 * @param {string} req.params.userId - ID del usuario propietario
 * @param {string} req.params.slotNumber - Número de slot a eliminar
 * @param {Object} res - Express response
 * @returns {Object} Mensaje de confirmación
 */
export async function deleteSlot(req, res) {
  try {
    const result = await deleteSlotData(req.params.userId, req.params.slotNumber);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
