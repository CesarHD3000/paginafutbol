const db = require('./db');

const seedData = async () => {
  try {
    console.log('🌱 Insertando datos de prueba...');

    // 1. Equipos
    const equipos = [
      ['Los Galácticos', 'https://via.placeholder.com/100'],
      ['Rayo FC', 'https://via.placeholder.com/100'],
      ['Titanium SC', 'https://via.placeholder.com/100'],
      ['Halcones', 'https://via.placeholder.com/100'],
      ['Fuerza Unida', 'https://via.placeholder.com/100'],
      ['Deportivo Sur', 'https://via.placeholder.com/100']
    ];

    for (const [nombre, logo] of equipos) {
      await db.query(
        'INSERT INTO equipos (nombre, logo_url) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING',
        [nombre, logo]
      );
    }

    // Obtener IDs de equipos
    const res = await db.query('SELECT id, nombre FROM equipos');
    const eqMap = {};
    res.rows.forEach(r => eqMap[r.nombre] = r.id);

    // 2. Partidos Recientes (Finalizados)
    const recientes = [
      [eqMap['Los Galácticos'], eqMap['Rayo FC'], '2026-03-28 18:00:00', 'finalizado', 2, 1],
      [eqMap['Titanium SC'], eqMap['Halcones'], '2026-03-29 20:00:00', 'finalizado', 0, 0]
    ];

    for (const [local, visitante, fecha, estado, gl, gv] of recientes) {
      await db.query(
        'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, fecha, estado, goles_local, goles_visitante) VALUES ($1, $2, $3, $4, $5, $6)',
        [local, visitante, fecha, estado, gl, gv]
      );
    }

    // 3. Próximos Partidos (Pendientes)
    const proximos = [
      [eqMap['Fuerza Unida'], eqMap['Deportivo Sur'], '2026-04-05 18:00:00', 'pendiente'],
      [eqMap['Los Galácticos'], eqMap['Titanium SC'], '2026-04-06 20:30:00', 'pendiente']
    ];

    for (const [local, visitante, fecha, estado] of proximos) {
      await db.query(
        'INSERT INTO partidos (equipo_local_id, equipo_visitante_id, fecha, estado) VALUES ($1, $2, $3, $4)',
        [local, visitante, fecha, estado]
      );
    }

    console.log('✅ Datos de prueba insertados');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al insertar datos:', err);
    process.exit(1);
  }
};

seedData();
