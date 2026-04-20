const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { auth, checkRole } = require('../middlewares/auth');

// Todas las rutas de eventos requieren autenticación de administrador
router.post('/', auth, checkRole(['admin']), eventoController.addEvento);
router.delete('/:id', auth, checkRole(['admin']), eventoController.deleteEvento);

module.exports = router;
