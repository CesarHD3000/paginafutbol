const db = require('../config/db');

// --- GESTIÓN DE CLUBES ---

// Obtener todos los clubes (instituciones)
const getClubes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clubes ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener clubes' });
  }
};

// Crear un club
const createClub = async (req, res) => {
  const { nombre, color_principal } = req.body;
  const logo_path = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const result = await db.query(
      'INSERT INTO clubes (nombre, logo_path, color_principal) VALUES ($1, $2, $3) RETURNING *',
      [nombre, logo_path, color_principal || '#ff3d3d']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el club' });
  }
};

// Actualizar un club
const updateClub = async (req, res) => {
  const { id } = req.params;
  const { nombre, color_principal } = req.body;
  let logo_path = req.body.logo_path;

  if (req.file) {
    logo_path = `/uploads/${req.file.filename}`;
  }

  try {
    const result = await db.query(
      'UPDATE clubes SET nombre = $1, logo_path = $2, color_principal = $3 WHERE id = $4 RETURNING *',
      [nombre, logo_path, color_principal, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Club no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el club' });
  }
};

// Eliminar un club
const deleteClub = async (req, res) => {
  const { id } = req.params;
  try {
    // Nota: La base de datos debería tener ON DELETE CASCADE o manejaremos el error si hay equipos asociados
    await db.query('DELETE FROM clubes WHERE id = $1', [id]);
    res.json({ message: 'Club eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el club. Asegúrese de que no tenga equipos o jugadores asociados.' });
  }
};

// --- GESTIÓN DE EQUIPOS (CLUB + CATEGORÍA) ---

// Inscribir un club en una categoría (Crea un "Equipo")
const createEquipo = async (req, res) => {
  const { club_id, categoria_id } = req.body;
  try {
    // Validar si ya existe la inscripción
    const existe = await db.query('SELECT * FROM equipos WHERE club_id = $1 AND categoria_id = $2', [club_id, categoria_id]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El club ya está inscrito en esta categoría' });
    }

    const result = await db.query(
      'INSERT INTO equipos (club_id, categoria_id) VALUES ($1, $2) RETURNING *',
      [club_id, categoria_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al inscribir club en categoría' });
  }
};

// Eliminar inscripción de un club en una categoría
const deleteEquipo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM equipos WHERE id = $1', [id]);
    res.json({ message: 'Inscripción eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la inscripción. Verifique que el equipo no tenga partidos registrados.' });
  }
};

// Obtener equipos por categoría (Para tablas de posiciones)
const getEquiposPorCategoria = async (req, res) => {
  const { categoria_id } = req.params;
  try {
    const result = await db.query(`
      SELECT e.id as equipo_id, c.nombre, c.logo_url, c.color_principal
      FROM equipos e
      JOIN clubes c ON e.club_id = c.id
      WHERE e.categoria_id = $1
      ORDER BY c.nombre ASC
    `, [categoria_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener equipos de la categoría' });
  }
};

// Obtener tabla de posiciones por categoría (Lógica principal del producto)
const getTablaPosiciones = async (req, res) => {
  const { categoria_id } = req.params;
  
  if (!categoria_id) {
    return res.status(400).json({ message: 'El ID de categoría es obligatorio' });
  }

  try {
    const query = `
      WITH stats AS (
        SELECT 
          e.id as equipo_id,
          cl.nombre,
          cl.logo_url,
          SUM(CASE WHEN p.estado = 'finalizado' THEN 1 ELSE 0 END) as pj,
          SUM(CASE 
            WHEN p.estado = 'finalizado' AND (
              (p.equipo_local_id = e.id AND p.goles_local > p.goles_visitante) OR 
              (p.equipo_visitante_id = e.id AND p.goles_visitante > p.goles_local)
            ) THEN 1 ELSE 0 
          END) as pg,
          SUM(CASE 
            WHEN p.estado = 'finalizado' AND p.goles_local = p.goles_visitante THEN 1 ELSE 0 
          END) as pe,
          SUM(CASE 
            WHEN p.estado = 'finalizado' AND (
              (p.equipo_local_id = e.id AND p.goles_local < p.goles_visitante) OR 
              (p.equipo_visitante_id = e.id AND p.goles_visitante < p.goles_local)
            ) THEN 1 ELSE 0 
          END) as pp,
          SUM(CASE 
            WHEN p.estado = 'finalizado' AND p.equipo_local_id = e.id THEN p.goles_local
            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = e.id THEN p.goles_visitante
            ELSE 0 
          END) as gf,
          SUM(CASE 
            WHEN p.estado = 'finalizado' AND p.equipo_local_id = e.id THEN p.goles_visitante
            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = e.id THEN p.goles_local
            ELSE 0 
          END) as gc
        FROM equipos e
        JOIN clubes cl ON e.club_id = cl.id
        LEFT JOIN partidos p ON (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id) AND p.categoria_id = $1
        WHERE e.categoria_id = $1
        GROUP BY e.id, cl.nombre, cl.logo_url
      )
      SELECT 
        *,
        (COALESCE(gf, 0) - COALESCE(gc, 0)) as dg,
        (COALESCE(pg, 0) * 3 + COALESCE(pe, 0)) as pts
      FROM stats
      ORDER BY pts DESC, dg DESC, gf DESC;
    `;
    
    const result = await db.query(query, [categoria_id]);
    
    // Aseguramos que todos los campos numéricos sean devueltos como Number
    const formattedTable = result.rows.map(row => ({
      ...row,
      pj: parseInt(row.pj || 0),
      pg: parseInt(row.pg || 0),
      pe: parseInt(row.pe || 0),
      pp: parseInt(row.pp || 0),
      gf: parseInt(row.gf || 0),
      gc: parseInt(row.gc || 0),
      dg: parseInt(row.dg || 0),
      pts: parseInt(row.pts || 0)
    }));

    res.json(formattedTable);
  } catch (err) {
    console.error('❌ Error crítico en getTablaPosiciones:', err.message);
    res.status(500).json({ 
      message: 'Error interno al generar la tabla de posiciones',
      error: err.message 
    });
  }
};

// Obtener información pública detallada de un CLUB (Antiguo getEquipoPublico)
const getClubPublico = async (req, res) => {
  const { id } = req.params;
  try {
    const clubResult = await db.query('SELECT * FROM clubes WHERE id = $1', [id]);
    if (clubResult.rows.length === 0) return res.status(404).json({ message: 'Club no encontrado' });

    const jugadoresResult = await db.query('SELECT * FROM jugadores WHERE club_id = $1 ORDER BY numero ASC', [id]);
    
    // Partidos de TODAS las categorías donde participe el club
    const partidosResult = await db.query(`
      SELECT p.*, 
             c1.nombre as local, c2.nombre as visitante, 
             c1.logo_url as local_logo, c2.logo_url as visitante_logo,
             cat.nombre as categoria_nombre
      FROM partidos p
      JOIN equipos e1 ON p.equipo_local_id = e1.id
      JOIN equipos e2 ON p.equipo_visitante_id = e2.id
      JOIN clubes c1 ON e1.club_id = c1.id
      JOIN clubes c2 ON e2.club_id = c2.id
      JOIN categorias cat ON p.categoria_id = cat.id
      WHERE c1.id = $1 OR c2.id = $1
      ORDER BY p.fecha DESC
    `, [id]);

    res.json({
      club: clubResult.rows[0],
      jugadores: jugadoresResult.rows,
      partidos: partidosResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener información del club' });
  }
};

module.exports = {
  getClubes,
  createClub,
  updateClub,
  deleteClub,
  createEquipo,
  deleteEquipo,
  getEquiposPorCategoria,
  getTablaPosiciones,
  getClubPublico
};
