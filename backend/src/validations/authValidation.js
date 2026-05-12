export function validateRegister(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username y password son requeridos' });
  }

  if (username.length < 3 || username.length > 15) {
    return res.status(400).json({ error: 'Username debe tener entre 3 y 15 caracteres' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password debe tener mínimo 6 caracteres' });
  }

  next();
}

export function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username y password son requeridos' });
  }

  next();
}