const { supabaseAdmin } = require('../services/supabase');

async function autenticar(req, res, next) {
  // Verifica se o usuário está autenticado via sessão do Passport
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Não autenticado. Faça login primeiro.' });
  }
  
  // Adiciona dados do usuário ao req para uso nos handlers
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não encontrado na sessão.' });
  }
  
  next();
}}

async function isAdmin(req, res, next) {
    try {
          const { data: admin, error } = await supabaseAdmin
                // Verificar se há algum administrador cadastrado
                const { data: allAdmins, error: listError } = await supabaseAdmin
                        .from('administradores').select('*');
          // Se não houver nenhum admin cadastrado, permitir acesso para primeiro cadastro
          if (!listError && (!allAdmins || allAdmins.length === 0)) {
                  return next();
                }
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
