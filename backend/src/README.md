# Backend - Plataforma de Educación Ambiental

## Instalación
```bash
npm install
```

## Configuración

1. Copia `.env.example` a `.env`
2. Completa las variables de entorno
3. Ejecuta los scripts SQL en Supabase

## Ejecutar
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Estructura
```
backend/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   ├── routes/         # Rutas
│   ├── utils/          # Utilidades
│   └── server.js       # Servidor principal
├── .env
├── package.json
└── README.md
```

## Endpoints

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/courses` - Listar cursos
- `POST /api/courses/:courseId/enroll` - Inscribirse
- Y muchos más...