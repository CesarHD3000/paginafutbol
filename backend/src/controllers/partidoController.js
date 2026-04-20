const db = require('../config/db');

// Obtener partidos finalizados (recientes)
const getRecientes = async (req, res) => {
  const { categoria_id } = req.query;
  try {
    let query = `
      SELECT p.*, 
             c1.nombre as local, 
             c2.nombre as visitante,
             c1.logo_path as local_logo,
             c2.logo_path as visitante_logo,
             cat.nombre as categoria_nombre
      FROM partidos p
      JOIN equipos e1 ON p.equipo_local_id = e1.id
      JOIN equipos e2 ON p.equipo_visitante_id = e2.id
      JOIN clubes c1 ON e1.club_id = c1.id
      JOIN clubes c2 ON e2.club_id = c2.id
      JOIN categorias cat ON p.categoria_id = cat.id
      WHERE p.estado = 'finalizado'
    `;
    const params = [];

    if (categoria_id) {
      query += ' AND p.categoria_id = $1';
      params.push(categoria_id);
    }

    query += ' ORDER BY p.fecha DESC LIMIT 6';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener partidos recientes' });
  }
};

// Obtener próximos partidos (pendientes)
const getProximos = async (req, res) => {
  const { categoria_id } = req.query;
  try {
    let query = `
      SELECT p.*, 
             c1.nombre as local, 
             c2.nombre as visitante,
             c1.logo_path as local_logo,
             c2.logo_path as visitante_logo,
             cat.nombre as categoria_nombre
      FROM partidos p
      JOIN equipos e1 ON p.equipo_local_id = e1.id
      JOIN equipos e2 ON p.equipo_visitante_id = e2.id
      JOIN clubes c1 ON e1.club_id = c1.id
      JOIN clubes c2 ON e2.club_id = c2.id
      JOIN categorias cat ON p.categoria_id = cat.id
      WHERE p.estado = 'pendiente'
    `;
    const params = [];

    if (categoria_id) {
      query += ' AND p.categoria_id = $1';
      params.push(categoria_id);
    }

    query += ' ORDER BY p.fecha ASC LIMIT 6';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener próximos partidos' });
  }
};

// Crear un partido
const createPartido = async (req, res) => {
  const { categoria_id, equipo_local_id, equipo_visitante_id, fecha } = req.body;

  if (equipo_local_id === equipo_visitante_id) {
    return res.status(400).json({ message: 'Un equipo no puede jugar contra sí mismo' });
  }

  try {
    // Validar que ambos equipos pertenezcan a la misma categoría
    const local = await db.query('SELECT categoria_id FROM equipos WHERE id = $1', [equipo_local_id]);
    const visitante = await db.query('SELECT categoria_id FROM equipos WHERE id = $1', [equipo_visitante_id]);

    if (local.rows[0].categoria_id != categoria_id || visitante.rows[0].categoria_id != categoria_id) {
      return res.status(400).json({ message: 'Los equipos deben pertenecer a la categoría seleccionada' });
    }

    const result = await db.query(
      'INSERT INTO partidos (categoria_id, equipo_local_id, equipo_visitante_id, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [categoria_id, equipo_local_id, equipo_visitante_id, fecha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el partido. Verifique que los equipos existan.' });
  }
};

// Actualizar un partido (Fecha o equipos)
const updatePartido = async (req, res) => {
  const { id } = req.params;
  const { fecha, equipo_local_id, equipo_visitante_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE partidos SET fecha = $1, equipo_local_id = $2, equipo_visitante_id = $3 WHERE id = $4 RETURNING *',
      [fecha, equipo_local_id, equipo_visitante_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Partido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el partido' });
  }
};

// Eliminar un partido
const deletePartido = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM partidos WHERE id = $1', [id]);
    res.json({ message: 'Partido eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el partido. Podría tener eventos (goles/tarjetas) asociados.' });
  }
};

// Obtener detalle completo de un partido
const getDetalle = async (req, res) => {
  const { id } = req.params;
  try {
    const partidoQuery = `
      SELECT p.*, 
             c1.nombre as local, 
             c2.nombre as visitante,
             c1.logo_path as local_logo,
             c2.logo_path as visitante_logo,
             cat.nombre as categoria_nombre,
             c1.id as local_club_id,
             c2.id as visitante_club_id
      FROM partidos p
      JOIN equipos e1 ON p.equipo_local_id = e1.id
      JOIN equipos e2 ON p.equipo_visitante_id = e2.id
      JOIN clubes c1 ON e1.club_id = c1.id
      JOIN clubes c2 ON e2.club_id = c2.id
      JOIN categorias cat ON p.categoria_id = cat.id
      WHERE p.id = $1
    `;
    const partido = await db.query(partidoQuery, [id]);
    
    if (partido.rows.length === 0) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }

    // Jugadores de ambos CLUBES
    const jugadoresQuery = `
      SELECT id, nombre, numero, club_id FROM jugadores 
      WHERE club_id IN ($1, $2)
      ORDER BY club_id, numero
    `;
    const jugadores = await db.query(jugadoresQuery, [partido.rows[0].local_club_id, partido.rows[0].visitante_club_id]);

    const eventosQuery = `
      SELECT ev.*, j.nombre as jugador_nombre 
      FROM eventos ev
      JOIN jugadores j ON ev.jugador_id = j.id
      WHERE ev.partido_id = $1
      ORDER BY ev.minuto ASC
    `;
    const eventos = await db.query(eventosQuery, [id]);

    res.json({
      partido: partido.rows[0],
      jugadores: jugadores.rows,
      eventos: eventos.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener detalle del partido' });
  }
};

// Actualizar estado del partido
const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, goles_local, goles_visitante } = req.body;
  try {
    const result = await db.query(
      'UPDATE partidos SET estado = $1, goles_local = $2, goles_visitante = $3 WHERE id = $4 RETURNING *',
      [estado, goles_local || 0, goles_visitante || 0, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
};

// Actualizar minuto actual
const updateMinuto = async (req, res) => {
  const { id } = req.params;
  const { minuto_actual } = req.body;
  try {
    await db.query('UPDATE partidos SET minuto_actual = $1 WHERE id = $2', [minuto_actual, id]);
    res.json({ message: 'Minuto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el minuto' });
  }
};

module.exports = {
  getRecientes,
  getProximos,
  createPartido,
  updatePartido,
  deletePartido,
  getDetalle,
  updateEstado,
  updateMinuto
};
