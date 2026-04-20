const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const { auth, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { jugadorValidation } = require('../middlewares/validator');

router.get('/', jugadorController.getJugadores);

// Rutas protegidas (Solo Admin)
router.post('/', auth, checkRole(['admin']), upload.single('foto'), jugadorValidation, jugadorController.createJugador);
router.put('/:rut', auth, checkRole(['admin']), upload.single('foto'), jugadorValidation, jugadorController.updateJugador);
router.delete('/:rut', auth, checkRole(['admin']), jugadorController.deleteJugador);

module.exports = router;
