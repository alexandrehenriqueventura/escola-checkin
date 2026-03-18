require('dotenv').config();
const express = require('express');
const cors = require('cors');

const checkinRoutes = require('./routes/checkin');
const listaRoutes = require('./routes/lista');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/checkin', checkinRoutes);
app.use('/lista', listaRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
