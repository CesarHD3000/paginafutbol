const db = require('../config/db');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categorias ORDER BY orden ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Crear una categoría (Solo Admin)
const createCategoria = async (req, res) => {
  const { nombre, descripcion, orden } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO categorias (nombre, descripcion, orden) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, orden || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, orden } = req.body;
  try {
    const result = await db.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2, orden = $3 WHERE id = $4 RETURNING *',
      [nombre, descripcion, orden, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar la categoría. Verifique que no tenga equipos o partidos asociados.' });
  }
};

module.exports = {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
