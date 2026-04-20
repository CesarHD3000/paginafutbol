const { body, validationResult } = require('express-validator');

const loginValidation = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .trim().escape(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { loginValidation };
