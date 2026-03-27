// Middleware: verifica se o usuário está autenticado via sessão do Passport
async function autenticar(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado. Faça login primeiro.' });
  }

  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não encontrado na sessão.' });
  }

  next();
}

module.exports = { autenticar };
