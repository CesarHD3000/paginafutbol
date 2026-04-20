const express = require('express');
const router = express.Router();
const equipoController = require('../controllers/equipoController');
const { auth, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Clubes
router.get('/clubes', equipoController.getClubes);
router.post('/clubes', auth, checkRole(['admin']), upload.single('logo'), equipoController.createClub);
router.put('/clubes/:id', auth, checkRole(['admin']), upload.single('logo'), equipoController.updateClub);
router.delete('/clubes/:id', auth, checkRole(['admin']), equipoController.deleteClub);
router.get('/clubes/:id/public', equipoController.getClubPublico);

// Equipos (Inscripciones en categorías)
router.post('/', auth, checkRole(['admin']), equipoController.createEquipo);
router.delete('/:id', auth, checkRole(['admin']), equipoController.deleteEquipo);
router.get('/categoria/:categoria_id', equipoController.getEquiposPorCategoria);
router.get('/tabla/:categoria_id', equipoController.getTablaPosiciones);

module.exports = router;
