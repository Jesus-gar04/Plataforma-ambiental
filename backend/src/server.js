import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import evaluationRoutes from './routes/evaluations.js';
import certificateRoutes from './routes/certificates.js';
import institutionRoutes from './routes/institutions.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ============================================================
// RUTAS
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Plataforma de Educación Ambiental - Universidad Libre',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      evaluations: '/api/evaluations',
      certificates: '/api/certificates',
      institutions: '/api/institutions',
      reports: '/api/reports'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/reports', reportRoutes);

// ============================================================
// MANEJO DE ERRORES
// ============================================================

app.use(notFound);
app.use(errorHandler);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('🌱 ================================================');
      console.log('🌱 PLATAFORMA DE EDUCACIÓN AMBIENTAL');
      console.log('🌱 Universidad Libre Seccional Barranquilla');
      console.log('🌱 ================================================');
      console.log('');
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔗 Frontend: ${process.env.FRONTEND_URL}`);
      console.log('');
      console.log('📚 Endpoints disponibles:');
      console.log('   - Auth: http://localhost:' + PORT + '/api/auth');
      console.log('   - Cursos: http://localhost:' + PORT + '/api/courses');
      console.log('   - Evaluaciones: http://localhost:' + PORT + '/api/evaluations');
      console.log('   - Certificados: http://localhost:' + PORT + '/api/certificates');
      console.log('   - Instituciones: http://localhost:' + PORT + '/api/institutions');
      console.log('   - Reportes: http://localhost:' + PORT + '/api/reports');
      console.log('');
      console.log('🌱 ================================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});
