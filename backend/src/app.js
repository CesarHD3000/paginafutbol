const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const partidoRoutes = require('./routes/partidoRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const equipoRoutes = require('./routes/equipoRoutes');
const jugadorRoutes = require('./routes/jugadorRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');

const app = express();
const path = require('path');

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos (FOTOS)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Definir rutas
app.use('/api/auth', authRoutes);
app.use('/api/partidos', partidoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/jugadores', jugadorRoutes);
app.use('/api/categorias', categoriaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de Liga de Fútbol operando 🚀');
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Ha ocurrido un error interno en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Probar conexión a la DB al arrancar
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  try {
    await db.query('SELECT NOW()');
  } catch (err) {
    console.error('⚠️ No se pudo conectar a la base de datos. Revisa tu .env');
  }
});
