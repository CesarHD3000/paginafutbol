const express = require('express');
const router = express.Router();
const partidoController = require('../controllers/partidoController');
const { auth, checkRole } = require('../middlewares/auth');

router.get('/recientes', partidoController.getRecientes);
router.get('/proximos', partidoController.getProximos);
router.get('/:id', partidoController.getDetalle);

// Rutas protegidas (Solo Admin)
router.post('/', auth, checkRole(['admin']), partidoController.createPartido);
router.put('/:id', auth, checkRole(['admin']), partidoController.updatePartido);
router.delete('/:id', auth, checkRole(['admin']), partidoController.deletePartido);
router.put('/:id/estado', auth, checkRole(['admin']), partidoController.updateEstado);
router.put('/:id/minuto', auth, checkRole(['admin']), partidoController.updateMinuto);


module.exports = router;
