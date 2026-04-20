const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');
const { loginValidation } = require('../middlewares/validator');
const { auth } = require('../middlewares/auth');

router.post('/login', authLimiter, loginValidation, authController.login);
router.get('/verify', auth, authController.verify);

module.exports = router;
