# 🌱 Plataforma de Educación Ambiental
## Universidad Libre - Seccional Barranquilla

Plataforma web interactiva para educación ambiental dirigida a instituciones educativas, con cursos virtuales, evaluaciones automatizadas y certificación digital.

---

## 📋 Características Principales

✅ **Sistema de Roles Múltiples**
- Root/Super Admin: Gestión completa del sistema
- Director: Administración de estudiantes de su institución
- Profesor: Visualización y monitoreo de progreso
- Estudiante: Acceso a cursos y evaluaciones

✅ **Gestión de Cursos**
- 4 módulos de educación ambiental
- Contenidos multimedia (videos, documentos, lecturas)
- Seguimiento de progreso en tiempo real
- Evaluaciones automatizadas

✅ **Sistema de Evaluación**
- Preguntas de opción múltiple y verdadero/falso
- Calificación automatizada
- Múltiples intentos por evaluación
- Registro de historial de intentos

✅ **Certificación Digital**
- Generación automática de certificados en PDF
- Código de verificación único
- Validación pública de certificados
- Almacenamiento seguro en la nube

✅ **Reportes y Estadísticas**
- Progreso por institución
- Tasas de aprobación y deserción
- Filtros por curso, estudiante e institución
- Exportación de datos

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js + Express**: API REST
- **PostgreSQL**: Base de datos relacional (vía Supabase)
- **JWT**: Autenticación y autorización
- **Bcrypt**: Hash de contraseñas
- **jsPDF**: Generación de certificados

### Frontend
- **Vue 3**: Framework JavaScript progresivo
- **Vite**: Build tool ultrarrápido
- **Pinia**: State management
- **Tailwind CSS**: Framework de estilos
- **Axios**: Cliente HTTP
- **Chart.js**: Visualización de datos

### Infraestructura (Gratuita)
- **Supabase**: Base de datos y almacenamiento
- **Vercel**: Hosting del frontend
- **Railway/Render**: Hosting del backend

---

## 🚀 Instalación Local

### Requisitos Previos
- Node.js v18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/educacion-ambiental.git
cd educacion-ambiental
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de Supabase
nano .env
```

Configura las siguientes variables en `.env`:
```env
SUPABASE_URL=tu-url-de-supabase
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key
JWT_SECRET=genera-un-secreto-seguro
```

```bash
# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install

# Crear archivo .env
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 4. Configurar Base de Datos

1. Ve a tu proyecto de Supabase
2. Abre el SQL Editor
3. Ejecuta el contenido de `database/schema.sql`
4. Ejecuta el contenido de `database/seeds.sql` (datos de prueba)

---

## 🗂️ Estructura del Proyecto

```
educacion-ambiental/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración (DB, Supabase)
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middlewares/    # Autenticación, validación
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Servicios auxiliares
│   │   └── server.js       # Punto de entrada
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes Vue reutilizables
│   │   ├── views/          # Vistas principales
│   │   ├── router/         # Configuración de rutas
│   │   ├── store/          # Estado global (Pinia)
│   │   └── services/       # Servicios API
│   └── package.json
│
├── database/
│   ├── schema.sql          # Estructura de la BD
│   └── seeds.sql           # Datos de prueba
│
└── docs/
    ├── API.md              # Documentación de la API
    └── DEPLOYMENT.md       # Guía de despliegue
```

---

## 👥 Usuarios de Prueba

Todos usan la contraseña: `Admin123!`

| Rol        | Código            | Email                        |
|------------|-------------------|------------------------------|
| Root       | ROOT001           | admin@unilibre.edu.co        |
| Director   | COLEG001-DIR      | director@sanjose.edu.co      |
| Profesor   | COLEG001-PROF01   | profesor1@sanjose.edu.co     |
| Estudiante | COLEG001-EST0001  | est1@sanjose.edu.co          |

---

## 📚 API Endpoints Principales

### Autenticación
```
POST   /api/auth/login           # Iniciar sesión
POST   /api/auth/register        # Registrar estudiante
GET    /api/auth/validate        # Validar token
```

### Cursos
```
GET    /api/courses                      # Listar cursos activos
GET    /api/courses/:id/modules          # Módulos del curso
GET    /api/courses/modules/:id/content  # Contenido del módulo
POST   /api/courses/content/:id/complete # Marcar contenido completado
```

### Evaluaciones
```
GET    /api/evaluations/:id          # Obtener evaluación
POST   /api/evaluations/:id/submit   # Enviar respuestas
GET    /api/evaluations/:id/attempts # Historial de intentos
```

### Certificados
```
GET    /api/certificates/eligibility/:courseId  # Verificar elegibilidad
POST   /api/certificates/generate/:courseId     # Generar certificado
GET    /api/certificates/verify/:code           # Verificar certificado
```

### Instituciones (Root)
```
GET    /api/institutions          # Listar instituciones
POST   /api/institutions          # Crear institución
```

### Reportes (Root, Director, Profesor)
```
GET    /api/reports/stats                # Estadísticas generales
GET    /api/reports/institution-progress # Progreso por institución
GET    /api/reports/dropout-rate         # Tasa de deserción
```

---

## 🌐 Despliegue a Producción

Consulta la [Guía de Deployment](docs/DEPLOYMENT.md) para instrucciones detalladas.

### Resumen Rápido:

1. **Supabase**: Crear proyecto y ejecutar schema
2. **Railway/Render**: Desplegar backend
3. **Vercel**: Desplegar frontend
4. **Configurar variables de entorno** en cada servicio
5. **Crear usuario root** inicial

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de roles en cada endpoint
- ✅ Protección contra inyección SQL (queries parametrizadas)
- ✅ CORS configurado correctamente
- ✅ Variables de entorno para secretos

---

## 📊 Flujo del Estudiante

1. **Registro** con código de institución
2. **Inscripción automática** al curso activo
3. **Acceso a módulos** secuenciales
4. **Visualización de contenido** (videos, lecturas, documentos)
5. **Evaluaciones** al final de cada módulo (3 intentos)
6. **Generación de certificado** al completar el curso (75% mínimo)

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## 🤝 Contribución

Este proyecto es propiedad exclusiva de la Universidad Libre. Todos los derechos reservados.

---

## 📞 Soporte

**Universidad Libre - Seccional Barranquilla**
- Email: admin@unilibre.edu.co
- Teléfono: +57 300 123 4567

---

## 📄 Licencia

© 2024 Universidad Libre. Todos los derechos reservados.

Este software y todos sus componentes (código fuente, diseño, materiales educativos y elementos gráficos) son propiedad intelectual exclusiva de la Universidad Libre Seccional Barranquilla.

---

## 🎯 Roadmap Futuro

- [ ] Integración con sistemas LMS
- [ ] App móvil nativa
- [ ] Gamificación del aprendizaje
- [ ] Foros de discusión
- [ ] Videoconferencias en vivo
- [ ] Más cursos de sostenibilidad

---

**Desarrollado con 💚 por el equipo de la Universidad Libre Seccional Barranquilla**