const db = require('./src/config/db');

const testQuery = async () => {
  const categoria_id = 1;
  console.log(`🔍 Probando consulta de tabla para categoria_id: ${categoria_id}`);
  
  try {
    const query = `
      SELECT 
        e.id as equipo_id,
        cl.nombre,
        cl.logo_url
      FROM equipos e
      JOIN clubes cl ON e.club_id = cl.id
      WHERE e.categoria_id = $1
    `;
    
    console.log('Step 1: Probando JOIN básico entre equipos y clubes...');
    const res1 = await db.query(query, [categoria_id]);
    console.log(`✅ Step 1 exitoso. Encontrados ${res1.rows.length} equipos.`);

    console.log('Step 2: Probando consulta completa de estadísticas...');
    const fullQuery = `
      WITH stats AS (
        SELECT 
          e.id as equipo_id,
          cl.nombre,
          SUM(CASE WHEN p.estado = 'finalizado' THEN 1 ELSE 0 END) as pj
        FROM equipos e
        JOIN clubes cl ON e.club_id = cl.id
        LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id) AND p.categoria_id = $1
        WHERE e.categoria_id = $1
        GROUP BY e.id, cl.nombre
      )
      SELECT * FROM stats;
    `;
    const res2 = await db.query(fullQuery, [categoria_id]);
    console.log('✅ Step 2 exitoso.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR DETECTADO:', err.message);
    console.error('Detalles:', err);
    process.exit(1);
  }
};

testQuery();
