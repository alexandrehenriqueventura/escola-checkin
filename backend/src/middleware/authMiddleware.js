const { supabaseAdmin } = require('../services/supabase');

async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token nao fornecido.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ erro: 'Token invalido ou expirado.' });
    }
    const { data: professor, error: errProf } = await supabaseAdmin
      .from('professores').select('*').eq('email', user.email).single();
    if (errProf || !professor) {
      return res.status(403).json({ erro: 'Professor nao cadastrado no sistema.' });
    }
    req.user = user;
    req.professor = professor;
    next();
  } catch (err) {
    return res.status(500).json({ erro: 'Erro ao validar autenticacao.' });
  }
}

async function isAdmin(req, res, next) {
    try {
          const { data: admin, error } = await supabaseAdmin
            .from('administradores').select('*').eq('email', req.user.email).single();
          if (error || !admin) {
                  return res.status(403).json({ error: 'Acesso restrito a administradores.' });
                }
          next();
        } catch (err) {
          return res.status(500).json({ error: 'Erro ao validar permissoes.' });
        }
  }

module.exports = { autenticar, isAdmin };
