require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');

const checkinRoutes = require('./routes/checkin');
const listaRoutes = require('./routes/lista');
const adminRoutes = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// CORS: usar apenas FRONTEND_URL definida; sem fallback para 'true' em produção
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin || (process.env.NODE_ENV !== 'production' ? true : false),
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'escola-checkin-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
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
    const { supabaseAdmin } = require('./services/supabase');
    const email = profile.emails[0].value;

    const { data: aluno } = await supabaseAdmin.from('alunos').select('*').eq('email', email).single();
    if (aluno) return done(null, { id: aluno.id, email: aluno.email, nome: aluno.nome, tipo: 'aluno', foto: profile.photos[0]?.value });

    const { data: prof } = await supabaseAdmin.from('professores').select('*').eq('email', email).single();
    if (prof) return done(null, { id: prof.id, email: prof.email, nome: prof.nome, tipo: 'professor', foto: profile.photos[0]?.value });

    const { data: admin } = await supabaseAdmin.from('administradores').select('*').eq('email', email).single();
    if (admin) return done(null, { id: admin.id, email: admin.email, nome: admin.nome, tipo: 'admin', foto: profile.photos[0]?.value });

    // Auto-register as aluno
    const { data: novo } = await supabaseAdmin.from('alunos').insert({
      nome: profile.displayName,
      email,
      google_id: profile.id,
      qr_token: profile.id + '_' + Date.now()
    }).select().single();
    return done(null, { id: novo.id, email: novo.email, nome: novo.nome, tipo: 'aluno', foto: profile.photos[0]?.value });
  } catch (e) { return done(e); }
}));

// Serializa apenas dados mínimos do usuário na sessão (id, email, tipo)
passport.serializeUser((user, done) => done(null, JSON.stringify({ id: user.id, email: user.email, nome: user.nome, tipo: user.tipo, foto: user.foto })));
passport.deserializeUser((str, done) => done(null, JSON.parse(str)));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});
app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

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
