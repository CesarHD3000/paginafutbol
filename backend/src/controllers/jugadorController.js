const db = require('../config/db');
const { validarRUT, formatRUT } = require('../utils/rutValidator');

// Obtener todos los jugadores
const getJugadores = async (req, res) => {
  const { club_id } = req.query;
  try {
    let query = `
      SELECT j.*, c.nombre as club_nombre 
      FROM jugadores j 
      JOIN clubes c ON j.club_id = c.id
    `;
    const params = [];

    if (club_id) {
      query += ' WHERE j.club_id = $1';
      params.push(club_id);
    }

    query += ' ORDER BY c.nombre ASC, j.numero ASC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener jugadores' });
  }
};

// Crear un jugador
const createJugador = async (req, res) => {
  const { rut, nombre, numero, club_id } = req.body;
  const foto_path = req.file ? `/uploads/${req.file.filename}` : null;

  // 1. Validar RUT
  if (!validarRUT(rut)) {
    return res.status(400).json({ message: 'El RUT ingresado no es válido' });
  }
  const rutFormateado = formatRUT(rut);

  try {
    // 2. Validar si el RUT ya existe
    const existeRUT = await db.query('SELECT * FROM jugadores WHERE rut = $1', [rutFormateado]);
    if (existeRUT.rows.length > 0) {
      return res.status(400).json({ message: 'Este jugador ya está registrado (RUT duplicado)' });
    }

    // 3. Validar número duplicado en el mismo club
    const existeNumero = await db.query('SELECT * FROM jugadores WHERE club_id = $1 AND numero = $2', [club_id, numero]);
    if (existeNumero.rows.length > 0) {
      return res.status(400).json({ message: `El número ${numero} ya está asignado en este club` });
    }

    const result = await db.query(
      'INSERT INTO jugadores (rut, nombre, numero, club_id, foto_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rutFormateado, nombre, numero, club_id, foto_path]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el jugador' });
  }
};

// Actualizar un jugador
const updateJugador = async (req, res) => {
  const { rut } = req.params; // El RUT es la PK
  const { nombre, numero, club_id } = req.body;
  let foto_path = req.body.foto_path; // Mantener la actual si no se sube una nueva

  if (req.file) {
    foto_path = `/uploads/${req.file.filename}`;
  }

  try {
    // Validar número duplicado (excluyendo al jugador actual por su RUT)
    const existe = await db.query('SELECT * FROM jugadores WHERE club_id = $1 AND numero = $2 AND rut != $3', [club_id, numero, rut]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: `El número ${numero} ya está asignado en este club` });
    }

    const result = await db.query(
      'UPDATE jugadores SET nombre = $1, numero = $2, club_id = $3, foto_path = $4 WHERE rut = $5 RETURNING *',
      [nombre, numero, club_id, foto_path, rut]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Jugador no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar el jugador' });
  }
};

// Eliminar un jugador
const deleteJugador = async (req, res) => {
  const { rut } = req.params;
  try {
    await db.query('DELETE FROM jugadores WHERE rut = $1', [rut]);
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el jugador' });
  }
};

module.exports = {
  getJugadores,
  createJugador,
  updateJugador,
  deleteJugador
};
