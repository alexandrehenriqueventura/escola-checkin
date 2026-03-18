const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { gerarQRPorta, gerarQRLista } = require('../services/qrGenerator');

const BASE_FRONTEND = process.env.FRONTEND_URL;

router.get('/escola', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('presencas_ativas').select('*').order('entrada_em', { ascending: false });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ presencas: data || [] });
});

router.get('/sala/:sala_id', async (req, res) => {
  const { sala_id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('presencas_ativas').select('*').eq('sala_id', sala_id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ presencas: data || [] });
});

router.get('/salas', async (req, res) => {
  const { data: salas, error } = await supabaseAdmin
    .from('salas').select('*').eq('ativa', true).order('nome');
  if (error) return res.status(500).json({ erro: error.message });
  const salasComQR = await Promise.all(
    salas.map(async (sala) => ({
      ...sala,
      qr_porta: await gerarQRPorta(sala.qr_token, BASE_FRONTEND),
      qr_lista: await gerarQRLista(sala.id, BASE_FRONTEND)
    }))
  );
  res.json({ salas: salasComQR });
});

module.exports = router;
