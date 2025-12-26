import multer from 'multer';
import path from 'path';

// Configuración de multer para memoria (temporal)
const storage = multer.memoryStorage();

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedExtensions = {
    video: ['mp4', 'webm', 'ogg', 'avi', 'mov'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    document: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']
  };

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const allAllowed = [...allowedExtensions.video, ...allowedExtensions.image, ...allowedExtensions.document];

  if (allAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Formato de archivo no permitido: ${ext}`), false);
  }
};

// Configuración principal de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 31457280 // 30MB default
  }
});

// Middleware para manejar errores de multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido (30MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error al subir archivo: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Exportar diferentes configuraciones
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);

export default upload;