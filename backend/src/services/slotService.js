import { GameSlot, CapturedPokemon } from '../models/index.js';
import sequelize from '../config/database.js';

/**
 * Obtiene todos los slots de juego de un usuario con conteo de pokémon capturados
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Array de slots del usuario
 */
export async function getSlotsByUserId(userId) {
  const slots = await GameSlot.findAll({
    where: { user_id: userId }
  });

  // Añadir conteo de pokémon capturados por slot
  const slotsWithCount = await Promise.all(slots.map(async slot => {
    const count = await CapturedPokemon.count({
      where: { slot_id: slot.id }
    });
    return { ...slot.toJSON(), captured_count: count };
  }));

  return slotsWithCount;
}

/**
 * Obtiene un slot específico de un usuario
 * @param {number} userId - ID del usuario
 * @param {number} slotNumber - Número de slot (1, 2 o 3)
 * @returns {Promise<Object>} Objeto del slot
 * @throws {Error} Si el slot no existe
 */
export async function getSlotByNumber(userId, slotNumber) {
  const slot = await GameSlot.findOne({
    where: { user_id: userId, slot_number: slotNumber }
  });

  if (!slot) {
    throw new Error('Slot no encontrado');
  }

  return slot;
}

/**
 * Crea un nuevo slot de juego para un usuario
 * @param {number} userId - ID del usuario
 * @param {Object} slotData - Datos del slot (explorer, color, difficulty_id, etc)
 * @returns {Promise<Object>} Objeto del slot creado
 */
export async function createNewSlot(userId, slotData) {
  const slot = await GameSlot.create({
    user_id: userId,
    ...slotData
  });

  return slot;
}

/**
 * Actualiza los datos de un slot existente
 * @param {number} userId - ID del usuario propietario
 * @param {number} slotNumber - Número de slot a actualizar
 * @param {Object} slotData - Nuevos datos (hp, pokeball, position, etc)
 * @returns {Promise<Object>} Objeto del slot actualizado
 */
export async function updateSlotData(userId, slotNumber, slotData) {
  const slot = await getSlotByNumber(userId, slotNumber);
  await slot.update(slotData);
  return slot;
}

/**
 * Elimina un slot de juego
 * @param {number} userId - ID del usuario propietario
 * @param {number} slotNumber - Número de slot a eliminar
 * @returns {Promise<Object>} Mensaje de confirmación
 */
export async function deleteSlotData(userId, slotNumber) {
  const slot = await getSlotByNumber(userId, slotNumber);
  await slot.destroy();
  return { message: 'Slot eliminado' };
}