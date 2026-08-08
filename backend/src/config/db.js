const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: (connectionString && connectionString.includes('neon')) || process.env.NODE_ENV === 'production' || process.env.VERCEL ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a la base de datos');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a la base de datos', err);
});

module.exports = {
  query: (text, params) => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está configurada en las variables de entorno de Vercel.');
    }
    return pool.query(text, params);
  },
  pool
};
