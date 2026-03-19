require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const checkinRoutes = require('./routes/checkin');
const listaRoutes = require('./routes/lista');
const adminRoutes = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'escola-checkin-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Passport Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const { data: aluno } = await supabase.from('alunos').select('*').eq('email', email).single();
    if (aluno) return done(null, { ...aluno, tipo: 'aluno', foto: profile.photos[0]?.value });
    const { data: prof } = await supabase.from('professores').select('*').eq('email', email).single();
    if (prof) return done(null, { ...prof, tipo: 'professor', foto: profile.photos[0]?.value });
    const { data: admin } = await supabase.from('administradores').select('*').eq('email', email).single();
    if (admin) return done(null, { ...admin, tipo: 'admin', foto: profile.photos[0]?.value });
    // Auto-register as aluno
    const { data: novo } = await supabase.from('alunos').insert({ nome: profile.displayName, email, google_id: profile.id, qr_token: profile.id + '_' + Date.now() }).select().single();
    return done(null, { ...novo, tipo: 'aluno', foto: profile.photos[0]?.value });
  } catch(e) { return done(e); }
}));

passport.serializeUser((user, done) => done(null, JSON.stringify(user)));
passport.deserializeUser((str, done) => done(null, JSON.parse(str)));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});
app.get('/auth/logout', (req, res) => { req.logout(() => res.redirect('/')); });

// Page routes
app.get('/dashboard', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});
app.get('/checkin', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/checkin.html'));
});
app.get('/lista', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/lista.html'));
});
app.get('/admin', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// API: current user
app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Nao autenticado' });
  res.json(req.user);
});

// API: salas
app.get('/api/salas', async (req, res) => {
  const { data, error } = await supabase.from('salas').select('*').order('nome');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// API: QR code de sala
app.get('/api/salas/:id/qrcode', async (req, res) => {
  const QRCode = require('qrcode');
  const url = `${process.env.CALLBACK_URL?.replace('/auth/google/callback','') || req.protocol+'://'+req.get('host')}/checkin?sala=${req.params.id}`;
  const qr = await QRCode.toDataURL(url);
  res.send(`<html><body style='display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column'><h2>Sala ${req.params.id}</h2><img src='${qr}'><p>${url}</p></body></html>`);
});

// API: presencas
app.get('/api/presencas', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Nao autenticado' });
  let query = supabase.from('presencas').select('*, alunos(nome), salas(nome)').order('timestamp', { ascending: false }).limit(200);
  if (req.query.sala_id) query = query.eq('sala_id', req.query.sala_id);
  if (req.query.data) {
    const d = req.query.data;
    query = query.gte('timestamp', d + 'T00:00:00').lte('timestamp', d + 'T23:59:59');
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// API routes
app.use('/api/checkin', checkinRoutes);
app.use('/api/lista', listaRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Middleware 404 para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
