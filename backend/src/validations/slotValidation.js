export function validateCreateSlot(req, res, next) {
  const { slot_number, color, difficulty_id } = req.body;

  if (!slot_number || !color || !difficulty_id) {
    return res.status(400).json({ error: 'slot_number, color y difficulty_id son requeridos' });
  }

  if (![1, 2, 3].includes(slot_number)) {
    return res.status(400).json({ error: 'slot_number debe ser 1, 2 o 3' });
  }

  if (!['facil', 'normal', 'dificil', 'infernal'].includes(difficulty_id)) {
    return res.status(400).json({ error: 'difficulty_id inválida' });
  }

  // Si no viene explorer, asignar valor por defecto
  if (!req.body.explorer) {
    req.body.explorer = 'boy';
  }

  next();
}

export function validateUpdateSlot(req, res, next) {
  const { hp, pokeball } = req.body;

  if (hp !== undefined && (hp < 0 || hp > 10)) {
    return res.status(400).json({ error: 'HP debe estar entre 0 y 10' });
  }

  if (pokeball !== undefined && pokeball < 0) {
    return res.status(400).json({ error: 'Pokeballs no puede ser negativo' });
  }

  next();
}