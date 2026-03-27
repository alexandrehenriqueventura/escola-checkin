const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');
const { gerarQRPorta, gerarQRLista } = require('../services/qrGenerator');
const { autenticar } = require('../middleware/authMiddleware');
const BASE_FRONTEND = process.env.FRONTEND_URL;

// Cache de QR Codes em memória (evita gerar 60 imagens a cada request)
const qrCache = new Map();

// GET /escola - Lista todas as presenças ativas (requer autenticação)
router.get('/escola', autenticar, async (req, res) => {
  const { data, error } = await supabaseAdmin.from('presencas_ativas').select('*').order('entrada_em', { ascending: false });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ presencas: data || [] });
});

// GET /sala/:sala_id - Lista presenças ativas de uma sala específica (requer autenticação)
router.get('/sala/:sala_id', autenticar, async (req, res) => {
  const { sala_id } = req.params;
  const { data, error } = await supabaseAdmin.from('presencas_ativas').select('*').eq('sala_id', sala_id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ presencas: data || [] });
});

// GET /salas - Lista salas com QR codes (requer autenticação)
router.get('/salas', autenticar, async (req, res) => {
  const { data: salas, error } = await supabaseAdmin.from('salas').select('*').eq('ativa', true).order('nome');
  if (error) return res.status(500).json({ erro: error.message });

  const salasComQR = await Promise.all(
    salas.map(async (sala) => ({
      ...sala,
      qr_porta: qrCache.get(`porta-${sala.qr_token}`) || await (async () => { const qr = await gerarQRPorta(sala.qr_token, BASE_FRONTEND); qrCache.set(`porta-${sala.qr_token}`, qr); return qr; })()
      ,
      qr_lista: qrCache.get(`lista-${sala.id}`) || await (async () => { const qr = await gerarQRLista(sala.id, BASE_FRONTEND); qrCache.set(`lista-${sala.id}`, qr); return qr; })()
    }))
  );

  res.json({ salas: salasComQR });
});

module.exports = router;
