const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// En Vercel (serverless), la única carpeta con permiso de escritura es /tmp
const uploadDir = process.env.VERCEL 
  ? path.join(os.tmpdir(), 'uploads') 
  : path.join(__dirname, '../../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ No se pudo crear el directorio de uploads:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único: timestamp + nombre original sanitizado
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Máximo 2MB por foto
  fileFilter: fileFilter
});

module.exports = upload;
