const db = require('../config/db');

// Agregar un evento (gol, asistencia, tarjeta)
const addEvento = async (req, res) => {
  const { partido_id, jugador_rut, tipo, minuto } = req.body;

  try {
    // 1. Obtener datos del partido y del jugador para validar y actualizar marcador
    const partidoResult = await db.query('SELECT * FROM partidos WHERE id = $1', [partido_id]);
    const jugadorResult = await db.query('SELECT * FROM jugadores WHERE rut = $1', [jugador_rut]);

    if (partidoResult.rows.length === 0 || jugadorResult.rows.length === 0) {
      return res.status(404).json({ message: 'Partido o Jugador no encontrado' });
    }

    const partido = partidoResult.rows[0];
    const jugador = jugadorResult.rows[0];

    // 2. Insertar el evento
    const newEvento = await db.query(
      'INSERT INTO eventos (partido_id, jugador_rut, tipo, minuto) VALUES ($1, $2, $3, $4) RETURNING *',
      [partido_id, jugador_rut, tipo, minuto]
    );

    // 3. Si es un GOL, actualizar marcador en la tabla partidos
    // Buscamos a qué EQUIPO (inscripción) pertenece el club del jugador en esta categoría
    if (tipo === 'gol') {
      const equipoJugador = await db.query(
        'SELECT id FROM equipos WHERE club_id = $1 AND categoria_id = $2', 
        [jugador.club_id, partido.categoria_id]
      );

      if (equipoJugador.rows.length > 0) {
        const eid = equipoJugador.rows[0].id;
        if (eid === partido.equipo_local_id) {
          await db.query('UPDATE partidos SET goles_local = goles_local + 1 WHERE id = $1', [partido_id]);
        } else if (eid === partido.equipo_visitante_id) {
          await db.query('UPDATE partidos SET goles_visitante = goles_visitante + 1 WHERE id = $1', [partido_id]);
        }
      }
    }

    res.status(201).json(newEvento.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar el evento' });
  }
};

// Eliminar un evento
const deleteEvento = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Obtener datos del evento antes de borrarlo
    const eventoResult = await db.query('SELECT * FROM eventos WHERE id = $1', [id]);
    if (eventoResult.rows.length === 0) return res.status(404).json({ message: 'Evento no encontrado' });

    const evento = eventoResult.rows[0];
    const partidoResult = await db.query('SELECT * FROM partidos WHERE id = $1', [evento.partido_id]);
    const partido = partidoResult.rows[0];

    // 2. Si era un GOL, restar del marcador
    if (evento.tipo === 'gol') {
      const jugadorResult = await db.query('SELECT club_id FROM jugadores WHERE rut = $1', [evento.jugador_rut]);
      if (jugadorResult.rows.length > 0) {
        const club_id = jugadorResult.rows[0].club_id;
        const equipoJugador = await db.query(
          'SELECT id FROM equipos WHERE club_id = $1 AND categoria_id = $2', 
          [club_id, partido.categoria_id]
        );

        if (equipoJugador.rows.length > 0) {
          const eid = equipoJugador.rows[0].id;
          if (eid === partido.equipo_local_id) {
            await db.query('UPDATE partidos SET goles_local = GREATEST(0, goles_local - 1) WHERE id = $1', [evento.partido_id]);
          } else if (eid === partido.equipo_visitante_id) {
            await db.query('UPDATE partidos SET goles_visitante = GREATEST(0, goles_visitante - 1) WHERE id = $1', [evento.partido_id]);
          }
        }
      }
    }

    // 3. Eliminar el evento
    await db.query('DELETE FROM eventos WHERE id = $1', [id]);

    res.json({ message: 'Evento eliminado y marcador actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el evento' });
  }
};

module.exports = {
  addEvento,
  deleteEvento
};
