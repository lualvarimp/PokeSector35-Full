export function validateCreateSlot(req, res, next) {
  const { slot_number, color, difficulty_id, sticker } = req.body;

  if (!slot_number || !color || !difficulty_id || !sticker) {
    return res.status(400).json({ error: 'slot_number, color, difficulty_id y sticker son requeridos' });
  }

  if (![1, 2, 3].includes(slot_number)) {
    return res.status(400).json({ error: 'slot_number debe ser 1, 2 o 3' });
  }

  if (!['facil', 'normal', 'dificil', 'infernal'].includes(difficulty_id)) {
    return res.status(400).json({ error: 'difficulty_id inválida' });
  }

  // Validar que sticker sea una ruta válida
  if (!sticker.includes('/img/stickers/') || !sticker.endsWith('.webp')) {
    return res.status(400).json({ error: 'sticker debe ser una ruta válida (/img/stickers/nombre.webp)' });
  }

  // Si no viene explorer, asignar valor por defecto
  if (!req.body.explorer) {
    req.body.explorer = 'boy';
  }

  next();
}

export function validateUpdateSlot(req, res, next) {
  const { hp, pokeball, sticker } = req.body;

  if (hp !== undefined && (hp < 0 || hp > 10)) {
    return res.status(400).json({ error: 'HP debe estar entre 0 y 10' });
  }

  if (pokeball !== undefined && pokeball < 0) {
    return res.status(400).json({ error: 'Pokeballs no puede ser negativo' });
  }

  if (sticker !== undefined && (!sticker.includes('/img/stickers/') || !sticker.endsWith('.webp'))) {
    return res.status(400).json({ error: 'sticker debe ser una ruta válida (/img/stickers/nombre.webp)' });
  }

  next();
}