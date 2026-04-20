const db = require('./db');
const bcrypt = require('bcryptjs');

const initDB = async () => {
  try {
    console.log('⏳ Inicializando base de datos con arquitectura jerárquica...');

    // Limpiar tablas existentes para asegurar estructura limpia
    await db.query(`
      DROP TABLE IF EXISTS eventos CASCADE;
      DROP TABLE IF EXISTS partidos CASCADE;
      DROP TABLE IF EXISTS jugadores CASCADE;
      DROP TABLE IF EXISTS equipos CASCADE;
      DROP TABLE IF EXISTS categorias CASCADE;
      DROP TABLE IF EXISTS clubes CASCADE;
      DROP TABLE IF EXISTS usuarios CASCADE;
    `);

    // Tipos ENUM
    await db.query(`
      DO $$ BEGIN
        CREATE TYPE partido_estado AS ENUM ('pendiente', 'en_vivo', 'finalizado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.query(`
      DO $$ BEGIN
        CREATE TYPE evento_tipo AS ENUM ('gol', 'asistencia', 'tarjeta_amarilla', 'tarjeta_roja');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 1. Tabla de CLUBES (La institución)
    await db.query(`
      CREATE TABLE IF NOT EXISTS clubes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        logo_path TEXT,
        color_principal VARCHAR(7) DEFAULT '#ff3d3d',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de CATEGORIAS (Primera, Sub-35, Femenino, etc.)
    await db.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL,
        descripcion TEXT,
        orden INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabla de EQUIPOS (Intersección entre Club y Categoría)
    await db.query(`
      CREATE TABLE IF NOT EXISTS equipos (
        id SERIAL PRIMARY KEY,
        club_id INT REFERENCES clubes(id) ON DELETE CASCADE,
        categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(club_id, categoria_id)
      );
    `);

    // 4. Tabla de JUGADORES (RUT como PK y vinculado al Club)
    await db.query(`
      CREATE TABLE IF NOT EXISTS jugadores (
        rut VARCHAR(12) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        numero INT NOT NULL,
        club_id INT REFERENCES clubes(id) ON DELETE CASCADE,
        foto_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabla de PARTIDOS
    await db.query(`
      CREATE TABLE IF NOT EXISTS partidos (
        id SERIAL PRIMARY KEY,
        categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
        equipo_local_id INT REFERENCES equipos(id) ON DELETE CASCADE,
        equipo_visitante_id INT REFERENCES equipos(id) ON DELETE CASCADE,
        fecha TIMESTAMP NOT NULL,
        estado partido_estado DEFAULT 'pendiente',
        goles_local INT DEFAULT 0,
        goles_visitante INT DEFAULT 0,
        minuto_actual INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Tabla de EVENTOS (Referencia al RUT del jugador)
    await db.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        partido_id INT REFERENCES partidos(id) ON DELETE CASCADE,
        jugador_rut VARCHAR(12) REFERENCES jugadores(rut) ON DELETE CASCADE,
        tipo evento_tipo NOT NULL,
        minuto INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Usuarios Admin
    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Estructura jerárquica creada correctamente');

    // Insertar Admin por defecto
    const adminCheck = await db.query('SELECT * FROM usuarios WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await db.query(
        'INSERT INTO usuarios (username, password, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Usuario admin creado (admin / admin123)');
    }

    // Insertar categorías iniciales si no existen
    const catCheck = await db.query('SELECT COUNT(*) FROM categorias');
    if (parseInt(catCheck.rows[0].count) === 0) {
      const categorias = [
        ['Primera Adultos', 'División de honor', 1],
        ['Segunda Adultos', 'Segunda división', 2],
        ['Sub-35', 'Sénior 35 años', 3],
        ['Viejos Cracks', 'Sénior 45 años', 4],
        ['Femenino', 'Liga femenina local', 5],
        ['Juvenil', 'Sub-17 y Sub-19', 6]
      ];
      for (const cat of categorias) {
        await db.query('INSERT INTO categorias (nombre, descripcion, orden) VALUES ($1, $2, $3)', cat);
      }
      console.log('✅ Categorías iniciales creadas');
    }
    
    console.log('✅ Base de datos lista.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error inicializando la base de datos:', err);
    process.exit(1);
  }
};

initDB();
