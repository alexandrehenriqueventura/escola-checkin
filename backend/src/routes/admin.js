const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { autenticar } = require('../middleware/authMiddleware');

async function isAdmin(req, res, next) {
  const { data } = await supabaseAdmin.from('admins')
    .select('id').eq('email', req.user.email).single();
  if (!data) return res.status(403).json({ erro: 'Acesso restrito a coordenacao.' });
  next();
}

// PROFESSORES
router.get('/professores', autenticar, isAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('professores').select('*').order('nome');
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ professores: data });
});

router.post('/professores', autenticar, isAdmin, async (req, res) => {
  const { nome, email, disciplina } = req.body;
  if (!nome || !email) return res.status(400).json({ erro: 'Nome e email sao obrigatorios.' });
  const { data, error } = await supabaseAdmin.from('professores')
    .insert({ nome, email, disciplina, ativo: true }).select().single();
  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json({ professor: data });
});

router.patch('/professores/:id', autenticar, isAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('professores')
    .update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ professor: data });
});

router.delete('/professores/:id', autenticar, isAdmin, async (req, res) => {
  await supabaseAdmin.from('presencas')
    .update({ ativa: false, saida_em: new Date().toISOString() })
    .eq('professor_id', req.params.id).eq('ativa', true);
  const { error } = await supabaseAdmin.from('professores').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ mensagem: 'Professor removido.' });
});

// SALAS
router.get('/salas', autenticar, isAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('salas').select('*').order('nome');
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ salas: data });
});

router.post('/salas', autenticar, isAdmin, async (req, res) => {
  const { nome, andar, descricao } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome da sala e obrigatorio.' });
  const { data, error } = await supabaseAdmin.from('salas')
    .insert({ nome, andar, descricao }).select().single();
  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json({ sala: data });
});

router.patch('/salas/:id', autenticar, isAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('salas')
    .update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ sala: data });
});

// DASHBOARD
router.get('/dashboard', autenticar, isAdmin, async (req, res) => {
  const hoje = new Date().toISOString().split('T')[0];
  const [presAtivas, presHoje, totalProfs, totalSalas] = await Promise.all([
    supabaseAdmin.from('presencas').select('id', { count: 'exact' }).eq('ativa', true),
    supabaseAdmin.from('presencas').select('id', { count: 'exact' }).gte('entrada_em', `${hoje}T00:00:00`),
    supabaseAdmin.from('professores').select('id', { count: 'exact' }).eq('ativo', true),
    supabaseAdmin.from('salas').select('id', { count: 'exact' }).eq('ativa', true),
  ]);
  res.json({
    presencas_ativas: presAtivas.count || 0,
    presencas_hoje: presHoje.count || 0,
    total_professores: totalProfs.count || 0,
    total_salas: totalSalas.count || 0,
  });
});

// HISTORICO
router.get('/historico', autenticar, isAdmin, async (req, res) => {
  const { data: dataFiltro } = req.query;
  let query = supabaseAdmin.from('historico_presencas').select('*').limit(200);
  if (dataFiltro) query = query.gte('entrada_em', `${dataFiltro}T00:00:00`).lte('entrada_em', `${dataFiltro}T23:59:59`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ historico: data });
});

module.exports = router;
