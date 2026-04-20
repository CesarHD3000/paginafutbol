const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');
const { loginValidation } = require('../middlewares/validator');

router.post('/login', authLimiter, loginValidation, authController.login);

module.exports = router;
