const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon') ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  console.log('✅ Conexión exitosa a la base de datos en Neon');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a la base de datos', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
