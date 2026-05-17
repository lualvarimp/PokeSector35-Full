# Documentación PokéSector 35

Bienvenido a la documentación técnica de **PokéSector 35**, un proyecto fullstack que combina React, Express y PostgreSQL.

## Contenido

### Inicio Rápido
- **[SETUP.md](./SETUP.md)** - Instrucciones de instalación y configuración del entorno
- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Visión general de la arquitectura fullstack

### API y Backend
- **[API.md](./API.md)** - Referencia completa de endpoints (también disponible en Swagger)
- **[BACKEND.md](./BACKEND.md)** - Estructura y funcionamiento del backend
- **[MODELOS.md](./MODELOS.md)** - Descripción de los modelos de base de datos

### Frontend
- **[FRONTEND.md](./FRONTEND.md)** - Estructura y componentes del frontend React
- **[JUEGO.md](./JUEGO.md)** - Lógica de juego y mecánicas principales

### Seguridad y Autenticación
- **[AUTENTICACION.md](./AUTENTICACION.md)** - Sistema de autenticación JWT y rate limiting

### Panel de Administración
- **[ADMIN.md](./ADMIN.md)** - Documentación del panel administrativo

### Desarrollo
- **[CHANGELOG.md](../CHANGELOG.md)** - Historial de cambios del proyecto
- **[CONTRIBUIR.md](./CONTRIBUIR.md)** - Guías para desarrolladores

---

## Estructura del Proyecto

```
pokesector/
├── backend/                    # Servidor Express + API REST
│   ├── src/
│   │   ├── config/            # Configuración (DB, Swagger)
│   │   ├── controllers/       # Lógica de controladores
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Definición de rutas
│   │   ├── services/          # Lógica de negocio
│   │   ├── validations/       # Validaciones de entrada
│   │   ├── middlewares/       # Middlewares (auth, errores)
│   │   └── views/             # Plantillas Pug (admin)
│   ├── public/                # Archivos estáticos
│   └── package.json
│
├── frontend/                   # Aplicación React + Vite
│   ├── src/
│   │   ├── game/              # Lógica del juego
│   │   ├── components/        # Componentes React
│   │   ├── services/          # Llamadas a API
│   │   └── hooks/             # Custom hooks
│   └── package.json
│
├── docs/                       # Documentación técnica
│   └── *.md                    # Archivos markdown
│
└── README.md                   # Presentación del proyecto
```

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|---|
| **Backend** | Node.js, Express.js, Sequelize ORM |
| **Frontend** | React 18.2, Vite, Vanilla JS |
| **Base de datos** | PostgreSQL 15 |
| **API Docs** | Swagger/OpenAPI 3.0 |
| **Contenedores** | Docker, Docker Compose |

---

## Iniciando

1. Consulta [SETUP.md](./SETUP.md) para instalación
2. Lee [ARQUITECTURA.md](./ARQUITECTURA.md) para entender el flujo completo
3. Revisa [API.md](./API.md) para ver qué endpoints disponibles
4. Explora el código comentado en `src/` del backend y frontend

---

## Notas Importantes

- **API Docs en vivo**: Una vez levantado el servidor, accede a `http://localhost:3000/api-docs`
- **Panel Admin**: `http://localhost:3000/login`
- **Frontend del juego**: `http://localhost:5173` (desarrollo Vite) o compilado en `frontend/dist`

---

**Última actualización**: Mayo 2026
