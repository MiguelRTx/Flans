require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initializeDatabase } = require('../config/database');
const authRoutes     = require('./routes/auth');
const creatorRoutes  = require('./routes/creators');
const followerRoutes = require('../routes/followers');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

initializeDatabase();

app.use('/api/auth',      authRoutes);
app.use('/api/creators',  creatorRoutes);
app.use('/api/followers', followerRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend-Flans API funcionando correctamente ' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🍮 Backend-Flans corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos: http://localhost:${PORT}/uploads`);
});

module.exports = app;
