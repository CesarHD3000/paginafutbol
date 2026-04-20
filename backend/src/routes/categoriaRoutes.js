const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { auth, checkRole } = require('../middlewares/auth');

router.get('/', categoriaController.getCategorias);

// Rutas protegidas (Solo Admin)
router.post('/', auth, checkRole(['admin']), categoriaController.createCategoria);
router.put('/:id', auth, checkRole(['admin']), categoriaController.updateCategoria);
router.delete('/:id', auth, checkRole(['admin']), categoriaController.deleteCategoria);

module.exports = router;
