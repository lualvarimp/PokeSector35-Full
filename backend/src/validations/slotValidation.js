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

  // Validar que color sea un hex válido (#RRGGBB)
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return res.status(400).json({ error: 'color debe ser un hex válido (#RRGGBB)' });
  }

  // Validar que sticker sea una ruta segura: solo letras, números, guiones y guiones bajos
  if (!/^\/img\/stickers\/[\w-]+\.webp$/.test(sticker)) {
    return res.status(400).json({ error: 'sticker debe ser una ruta válida (/img/stickers/nombre.webp)' });
  }

  // Si no viene explorer, asignar valor por defecto
  if (!req.body.explorer) {
    req.body.explorer = 'boy';
  }

  next();
}

export function validateUpdateSlot(req, res, next) {
  const { hp, pokeball, color, sticker, position_r, position_c } = req.body;

  if (hp !== undefined && (hp < 0 || hp > 10)) {
    return res.status(400).json({ error: 'HP debe estar entre 0 y 10' });
  }

  if (pokeball !== undefined && pokeball < 0) {
    return res.status(400).json({ error: 'Pokeballs no puede ser negativo' });
  }

  if (color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return res.status(400).json({ error: 'color debe ser un hex válido (#RRGGBB)' });
  }

  if (sticker !== undefined && !/^\/img\/stickers\/[\w-]+\.webp$/.test(sticker)) {
    return res.status(400).json({ error: 'sticker debe ser una ruta válida (/img/stickers/nombre.webp)' });
  }

  // Tablero de 7 columnas x 5 filas (35 casillas)
  if (position_r !== undefined && (position_r < 0 || position_r > 4)) {
    return res.status(400).json({ error: 'position_r debe estar entre 0 y 4' });
  }

  if (position_c !== undefined && (position_c < 0 || position_c > 6)) {
    return res.status(400).json({ error: 'position_c debe estar entre 0 y 6' });
  }

  next();
}