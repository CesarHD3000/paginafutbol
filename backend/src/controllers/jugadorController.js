const db = require('../config/db');
const { validarRUT, formatRUT } = require('../utils/rutValidator');
const fs = require('fs');
const path = require('path');

// Función auxiliar para eliminar archivos de imagen física
const deleteFile = (filePath) => {
  if (filePath) {
    // filePath viene como /uploads/nombre.png, necesitamos la ruta absoluta
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) console.error(`Error al eliminar archivo: ${fullPath}`, err);
      });
    }
  }
};

// Obtener todos los jugadores
const getJugadores = async (req, res) => {
  const { club_id } = req.query;
  try {
    let query = `
      SELECT j.rut, j.nombre, j.numero, j.club_id, j.foto_path, c.nombre as club_nombre 
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
    if (req.file) deleteFile(`/uploads/${req.file.filename}`); // Borrar si el RUT es inválido
    return res.status(400).json({ message: 'El RUT ingresado no es válido' });
  }
  const rutFormateado = formatRUT(rut);

  try {
    // 2. Validar si el RUT ya existe
    const existeRUT = await db.query('SELECT * FROM jugadores WHERE rut = $1', [rutFormateado]);
    if (existeRUT.rows.length > 0) {
      if (req.file) deleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: 'Este jugador ya está registrado (RUT duplicado)' });
    }

    // 3. Validar número duplicado en el mismo club
    const existeNumero = await db.query('SELECT * FROM jugadores WHERE club_id = $1 AND numero = $2', [club_id, numero]);
    if (existeNumero.rows.length > 0) {
      if (req.file) deleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: `El número ${numero} ya está asignado en este club` });
    }

    const result = await db.query(
      'INSERT INTO jugadores (rut, nombre, numero, club_id, foto_path) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rutFormateado, nombre, numero, club_id, foto_path]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Error al crear el jugador' });
  }
};

// Actualizar un jugador
const updateJugador = async (req, res) => {
  const { rut } = req.params;
  const { nombre, numero, club_id } = req.body;
  
  try {
    // 1. Obtener datos actuales del jugador
    const actual = await db.query('SELECT foto_path FROM jugadores WHERE rut = $1', [rut]);
    if (actual.rows.length === 0) {
      if (req.file) deleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }

    let foto_path = actual.rows[0].foto_path;

    // 2. Si hay nueva foto, borrar la antigua y actualizar path
    if (req.file) {
      if (foto_path) {
        deleteFile(foto_path);
      }
      foto_path = `/uploads/${req.file.filename}`;
    }

    // 3. Validar número duplicado (excluyendo al jugador actual por su RUT)
    const existe = await db.query('SELECT * FROM jugadores WHERE club_id = $1 AND numero = $2 AND rut != $3', [club_id, numero, rut]);
    if (existe.rows.length > 0) {
      if (req.file) deleteFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ message: `El número ${numero} ya está asignado en este club` });
    }

    const result = await db.query(
      'UPDATE jugadores SET nombre = $1, numero = $2, club_id = $3, foto_path = $4 WHERE rut = $5 RETURNING *',
      [nombre, numero, club_id, foto_path, rut]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Error al actualizar el jugador' });
  }
};

// Eliminar un jugador
const deleteJugador = async (req, res) => {
  const { rut } = req.params;
  try {
    // 1. Buscar la foto antes de eliminar
    const result = await db.query('SELECT foto_path FROM jugadores WHERE rut = $1', [rut]);
    
    if (result.rows.length > 0 && result.rows[0].foto_path) {
      deleteFile(result.rows[0].foto_path);
    }

    // 2. Eliminar de la DB
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
