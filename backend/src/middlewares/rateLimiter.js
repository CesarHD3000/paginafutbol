const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Límite de 5 intentos por ventana
  message: {
    message: 'Demasiados intentos de inicio de sesión, por favor intente nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
