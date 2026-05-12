export function validateCreateRanking(req, res, next) {
  const { captured_count, escaped_count, difficulty_id } = req.body;

  if (captured_count === undefined || escaped_count === undefined || !difficulty_id) {
    return res.status(400).json({ error: 'captured_count, escaped_count y difficulty_id son requeridos' });
  }

  if (captured_count < 0 || escaped_count < 0) {
    return res.status(400).json({ error: 'Los conteos no pueden ser negativos' });
  }

  const totalEncounters = captured_count + escaped_count;
  if (totalEncounters < 10) {
    return res.status(400).json({ error: 'Mínimo 10 encuentros para registrar en ranking' });
  }

  if (!['facil', 'normal', 'dificil', 'infernal'].includes(difficulty_id)) {
    return res.status(400).json({ error: 'difficulty_id inválida' });
  }

  next();
}