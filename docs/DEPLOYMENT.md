# Guía de Deployment - Plataforma Educación Ambiental

## 📋 Requisitos Previos

- Cuenta de GitHub
- Cuenta de Supabase (gratis)
- Cuenta de Vercel (gratis)
- Cuenta de Railway o Render (gratis)

---

## 1️⃣ Configurar Base de Datos (Supabase)

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva organización y proyecto
3. Espera a que el proyecto se inicialice (2-3 minutos)

### Paso 2: Ejecutar Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Crea un nuevo query
3. Copia y pega el contenido completo del archivo `database/schema.sql`
4. Ejecuta el query (Run)

### Paso 3: Crear Buckets de Storage

1. Ve a **Storage** en el menú lateral
2. Crea los siguientes buckets (todos públicos):
   - `course-videos`
   - `course-documents`
   - `certificates`

### Paso 4: Obtener Credenciales

1. Ve a **Settings** > **API**
2. Copia y guarda:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_KEY) ⚠️ Mantén esto secreto

---

## 2️⃣ Configurar Backend (Railway)

### Opción A: Railway (Recomendado)

1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Click en **New Project** > **Deploy from GitHub repo**
4. Selecciona tu repositorio
5. Agrega las siguientes variables de entorno:

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=tu-url-de-supabase
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_KEY=tu-service-key
JWT_SECRET=genera-un-secreto-seguro-aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-dominio-vercel.vercel.app
COURSE_START_DATE=2024-01-15
COURSE_END_DATE=2024-12-31
PASSING_SCORE=75
UNIVERSITY_NAME=Universidad Libre
UNIVERSITY_SECTION=Seccional Barranquilla
CERTIFICATE_COURSE_NAME=Educación Ambiental y Sostenibilidad
```

6. En **Settings** > **Root Directory**, establece: `backend`
7. En **Settings** > **Start Command**, establece: `npm start`
8. Despliega el proyecto

### Opción B: Render

1. Ve a [render.com](https://render.com)
2. New > Web Service
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: educacion-ambiental-api
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Agrega las mismas variables de entorno del paso anterior
6. Crear Web Service

**Importante**: Copia la URL del backend desplegado (la necesitarás para el frontend)

---

## 3️⃣ Configurar Frontend (Vercel)

### Paso 1: Preparar Variables de Entorno

Crea un archivo `.env` en la carpeta `frontend/`:

```env
VITE_API_URL=https://tu-backend-url.railway.app/api
```

### Paso 2: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. **Add New** > **Project**
3. Importa tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Agrega la variable de entorno:
   - `VITE_API_URL`: La URL de tu backend
6. Deploy

### Paso 3: Configurar Dominio Personalizado (Opcional)

1. En tu proyecto de Vercel, ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de configuración DNS

---

## 4️⃣ Configurar CORS en Backend

Asegúrate de que en el backend, el archivo `server.js` tenga:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tu-dominio-vercel.vercel.app'
  ],
  credentials: true
}));
```

**Redespliega el backend** después de este cambio.

---

## 5️⃣ Crear Usuario Root Inicial

### Opción 1: Desde Supabase SQL Editor

Ejecuta este query en Supabase SQL Editor:

```sql
-- Primero crear la institución principal (Universidad)
INSERT INTO institutions (code, name, city, email, is_active)
VALUES ('UNILIBRE', 'Universidad Libre - Administración', 'Barranquilla', 'admin@unilibre.edu.co', true)
RETURNING id;

-- Luego crear el usuario root (reemplaza el institution_id con el ID generado)
INSERT INTO users (
  institution_id, 
  code, 
  email, 
  password_hash, 
  role, 
  first_name, 
  last_name,
  document_type,
  document_number,
  is_active
) VALUES (
  'el-id-de-la-institucion-aqui',
  'ROOT001',
  'admin@unilibre.edu.co',
  '$2a$10$YourHashedPasswordHere', -- Ver abajo cómo generar esto
  'root',
  'Administrador',
  'Principal',
  'CC',
  '1234567890',
  true
);
```

### Generar Password Hash:

Puedes usar este script de Node.js:

```javascript
import bcrypt from 'bcryptjs';

const password = 'TuContraseñaSegura123!';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
console.log(hash);
```

### Opción 2: Crear Endpoint Temporal

Agrega temporalmente en `server.js`:

```javascript
app.post('/api/setup/root', async (req, res) => {
  // Solo permitir una vez
  const checkRoot = await query('SELECT id FROM users WHERE role = $1', ['root']);
  if (checkRoot.rows.length > 0) {
    return res.status(400).json({ message: 'Root ya existe' });
  }

  // Crear root... (código del paso anterior)
});
```

**⚠️ IMPORTANTE**: Elimina este endpoint después de crear el root.

---

## 6️⃣ Poblar Curso Inicial

Ejecuta este script SQL en Supabase para crear el curso de educación ambiental:

```sql
-- Insertar curso
INSERT INTO courses (title, description, duration_hours, passing_score, is_active, start_date, end_date)
VALUES (
  'Educación Ambiental y Sostenibilidad',
  'Curso integral sobre educación ambiental, gestión de residuos, conservación y cambio climático.',
  20,
  75,
  true,
  '2024-01-15',
  '2024-12-31'
) RETURNING id;

-- Insertar módulos (reemplaza course_id con el ID generado arriba)
INSERT INTO modules (course_id, title, description, order_index, duration_minutes) VALUES
('course-id-aqui', 'Introducción a la Sostenibilidad Ambiental', 'Conceptos básicos de sostenibilidad y medio ambiente', 1, 90),
('course-id-aqui', 'Gestión de Residuos y Reciclaje', 'Principios de gestión de residuos y economía circular', 2, 120),
('course-id-aqui', 'Conservación de Recursos Naturales', 'Biodiversidad, agua y recursos naturales', 3, 90),
('course-id-aqui', 'Cambio Climático y Acción Individual', 'Impacto del cambio climático y acciones personales', 4, 120);
```

---

## 7️⃣ Monitoreo y Mantenimiento

### Logs

- **Railway**: Ve a tu proyecto > Deployments > Ver logs
- **Render**: Ve a tu servicio > Logs
- **Vercel**: Ve a tu proyecto > Deployments > Function Logs

### Base de Datos

Monitorea en Supabase:
- **Database** > **Usage**: Verifica uso de recursos
- **Storage** > **Usage**: Verifica almacenamiento

### Backups

Supabase hace backups automáticos en planes gratuitos (7 días de retención).

Para backups adicionales:
1. Ve a **Database** > **Backups**
2. Descarga backup manual periódicamente

---

## 8️⃣ Checklist Final

- [ ] Base de datos creada en Supabase
- [ ] Schema SQL ejecutado correctamente
- [ ] Buckets de storage creados
- [ ] Backend desplegado en Railway/Render
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Usuario root creado
- [ ] Curso inicial poblado
- [ ] Prueba de login exitosa
- [ ] Prueba de flujo estudiante exitosa

---

## 🆘 Troubleshooting

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en backend coincida con tu URL de Vercel
- Redespliega el backend después de cambiar CORS

### Error: "Cannot connect to database"
- Verifica `SUPABASE_URL` en variables de entorno
- Verifica que el proyecto de Supabase esté activo

### Error: "JWT malformed"
- Verifica que `JWT_SECRET` esté configurado
- Debe ser el mismo en todas las instancias del backend

### Error 500 en endpoints
- Revisa logs del backend en Railway/Render
- Verifica que todas las variables de entorno estén configuradas

---

## 📞 Soporte

Para problemas técnicos:
- Revisa logs de Railway/Render/Vercel
- Consulta documentación de Supabase
- Verifica configuración de variables de entorno

**Nota**: Todos los servicios mencionados tienen planes gratuitos suficientes para al menos 50 usuarios concurrentes.