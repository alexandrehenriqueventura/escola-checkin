const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { autenticar } = require('../middleware/authMiddleware');

// GET /sala/:token - Busca informações da sala pelo QR token (requer autenticação)
router.get('/sala/:token', autenticar, async (req, res) => {
  const { token } = req.params;
  const { data: sala, error } = await supabaseAdmin
    .from('salas').select('id, nome, andar, descricao')
    .eq('qr_token', token).eq('ativa', true).single();
  if (error || !sala) return res.status(404).json({ erro: 'Sala nao encontrada.' });
  res.json({ sala });
});

// POST /confirmar - Registra presença do professor na sala
router.post('/confirmar', autenticar, async (req, res) => {
  const { qr_token } = req.body;
  const professorId = req.professor.id;
  if (!qr_token) return res.status(400).json({ erro: 'qr_token obrigatorio.' });
  const { data: sala, error: errSala } = await supabaseAdmin
    .from('salas').select('id, nome').eq('qr_token', qr_token).eq('ativa', true).single();
  if (errSala || !sala) return res.status(404).json({ erro: 'Sala nao encontrada.' });
  await supabaseAdmin.from('presencas')
    .update({ ativa: false, saida_em: new Date().toISOString() })
    .eq('professor_id', professorId).eq('ativa', true);
  const { data: presenca, error: errPresenca } = await supabaseAdmin
    .from('presencas').insert({ professor_id: professorId, sala_id: sala.id, ativa: true })
    .select().single();
  if (errPresenca) return res.status(500).json({ erro: 'Erro ao registrar presenca.' });
  res.json({ mensagem: `${req.professor.nome} confirmado na ${sala.nome}!`, presenca, sala });
});

// POST /encerrar - Encerra presença ativa do professor
router.post('/encerrar', autenticar, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('presencas')
    .update({ ativa: false, saida_em: new Date().toISOString() })
    .eq('professor_id', req.professor.id).eq('ativa', true).select().single();
  if (error || !data) return res.status(404).json({ erro: 'Nenhuma presenca ativa encontrada.' });
  res.json({ mensagem: 'Presenca encerrada com sucesso.', presenca: data });
});

module.exports = router;
