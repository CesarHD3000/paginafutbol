const { body, param, query, validationResult } = require('express-validator');

// Función genérica para manejar errores de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Error de validación en los datos enviados',
      errors: errors.array() 
    });
  }
  next();
};

const loginValidation = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .trim().escape(),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
  validate
];

const jugadorValidation = [
  body('rut')
    .notEmpty().withMessage('El RUT es obligatorio')
    .trim(),
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim().escape(),
  body('numero')
    .notEmpty().withMessage('El número de camiseta es obligatorio')
    .isInt({ min: 1, max: 99 }).withMessage('El número debe ser entre 1 y 99'),
  body('club_id')
    .notEmpty().withMessage('El ID del club es obligatorio')
    .isInt().withMessage('El ID del club debe ser un número válido'),
  validate
];

const equipoValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre del equipo es obligatorio')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .trim().escape(),
  validate
];

module.exports = { 
  loginValidation, 
  jugadorValidation, 
  equipoValidation 
};
