# Arquitectura - PokéSector 35

## Visión General

PokéSector 35 es una aplicación **fullstack monolítica** que combina:

- **Backend REST API** servido por Express.js
- **Frontend web** con React 18 + Vite
- **Base de datos** PostgreSQL con ORM Sequelize
- **Panel de administración** con servidor renderizado (Pug + jQuery)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  http://localhost:5173                                      │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │  React App (Juego fullscreen)                       │    │    │
│  │  │  - GameScreen, BattleScreen, MenuScreen            │    │    │
│  │  │  - Conexión WebSocket/XHR a API                    │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  http://localhost:3000 (Admin Panel)                        │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │  Pug Templates (Login, Dashboard, etc)              │    │    │
│  │  │  jQuery para interactividad                         │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         ⬇⬇⬇ HTTPS / CORS ⬇⬇⬇
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVIDOR EXPRESS                                  │
│                   (Node.js + Express)                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  RUTAS API (REST)                                           │    │
│  │  - POST   /api/auth/register          → register()         │    │
│  │  - POST   /api/auth/login             → login()            │    │
│  │  - POST   /api/auth/refresh           → refreshToken()     │    │
│  │  - GET    /api/users/:id              → getUser()          │    │
│  │  - GET    /api/slots/:userId          → getSlots()         │    │
│  │  - POST   /api/slots                  → createSlot()       │    │
│  │  - GET    /api/slots/:id/replay       → getReplay()        │    │
│  │  - GET    /api/pokedex/:userId/:slot  → getPokedex()       │    │
│  │  - GET    /api/ranking                → getRanking()       │    │
│  │  ... y más                                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  MIDDLEWARES                                                │    │
│  │  - CORS Handler       → permiten peticiones cross-origin     │    │
│  │  - JSON Parser        → parsea cuerpos JSON                │    │
│  │  - Auth Middleware    → valida JWT tokens                 │    │
│  │  - Rate Limiter       → limita intentos login/registro    │    │
│  │  - Error Handler      → gestiona errores globales          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  CONTROLADORES                                              │    │
│  │  - authController    → Registro, login, JWT refresh         │    │
│  │  - userController    → CRUD usuarios                        │    │
│  │  - gameSlotController → Gestión de slots (partidas)        │    │
│  │  - rankingController  → Cálculo rankings                   │    │
│  │  - replayController   → Historial de movimientos           │    │
│  │  - capturedPokemonController → Pokédex                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  SERVICIOS (Lógica de Negocio)                              │    │
│  │  - authService       → Registra usuarios, genera JWTs      │    │
│  │  - userService       → Consultas/actualizaciones usuario   │    │
│  │  - slotService       → Lógica de partidas guardadas        │    │
│  │  - rankingService    → Cálculo de rankings                 │    │
│  │  - replayService     → Almacena movimientos               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  VALIDACIONES                                               │    │
│  │  - authValidation     → username/password válidos           │    │
│  │  - slotValidation     → movimientos válidos                │    │
│  │  - rankingValidation  → scores válidos                     │    │
│  │  - usernameValidation → anti-spam/bots                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  SWAGGER/OPENAPI                                            │    │
│  │  Documentación interactiva en http://localhost:3000/api-docs│    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         ⬇⬇⬇ Query/Mutations ⬇⬇⬇
┌─────────────────────────────────────────────────────────────────────┐
│                  SEQUELIZE ORM                                       │
│              (Node.js PostgreSQL Adapter)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  MODELOS (mapeo SQL → JS)                                   │    │
│  │  - User              ↔ users                                │    │
│  │  - GameSlot          ↔ game_slots                           │    │
│  │  - CapturedPokemon   ↔ captured_pokemon                    │    │
│  │  - GameReplay        ↔ game_replays                         │    │
│  │  - Ranking           ↔ rankings                             │    │
│  │  - RefreshToken      ↔ refresh_tokens                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         ⬇⬇⬇ SQL ⬇⬇⬇
┌─────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL                                        │
│                  pokesector_db (15+)                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  TABLAS                                                     │    │
│  │  - users              → Cuentas y perfiles                 │    │
│  │  - game_slots         → Partidas guardadas                 │    │
│  │  - captured_pokemon   → Pokédex por usuario/slot           │    │
│  │  - game_replays       → Movimientos de partidas            │    │
│  │  - rankings           → Posiciones globales                │    │
│  │  - refresh_tokens     → Tokens para renovar sesión         │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flujos Principales

### 1. **Flujo de Autenticación**

```
Usuario quiere jugar registrado
         ⬇
  Introduce usuario/contraseña
         ⬇
  POST /api/auth/register
         ⬇
  authController.register()
         ⬇
  validateUsername() + validatePassword()
         ⬇
  authService.registerUser() → INSERT usuarios
         ⬇
  Genera access_token (JWT 1h) y refresh_token (7d)
         ⬇
  Responde con tokens
         ⬇
  Frontend almacena en localStorage
         ⬇
  Puede jugar registrado
```

### 2. **Flujo de Partida**

```
Usuario juega en React Frontend
         ⬇
  Explora mapa 5×7 (35 celdas)
         ⬇
  [Encuentro Pokémon]
    → GET /api/pokemon/:id (obtiene stats)
         ⬇
  [Batalla]
    → Intenta capturar
    → POST /api/slots/:id/capture
         ⬇
  gameSlotController.capturePokemon()
         ⬇
  slotService.savePokemonCapture()
         ⬇
  INSERT captured_pokemon
         ⬇
  [Llega a meta]
    → POST /api/slots/:id/finish
         ⬇
  Calcula ranking, almacena replay
    → INSERT game_replays, UPDATE rankings
         ⬇
  Partida guardada
```

### 3. **Flujo de Panel Admin**

```
Admin va a http://localhost:3000/login
         ⬇
  Se autentica contra API
    → POST /api/auth/login (obtiene JWT)
         ⬇
  Navega a /admin/users
    → GET /api/users (renderizado server-side con Pug)
         ⬇
  Puede editar/eliminar usuarios
    → PUT /api/users/:id o DELETE /api/users/:id
         ⬇
  Cambios reflejados en DB
```

---

## Estructura de Directorios Detallada

### Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js              # Configuración Sequelize
│   │   └── swaggerConfig.js         # Especificación OpenAPI 3.0
│   │
│   ├── controllers/                 # Lógica de endpoints HTTP
│   │   ├── authController.js        # POST /api/auth/* (register, login, refresh)
│   │   ├── userController.js        # GET/PUT/DELETE /api/users
│   │   ├── gameSlotController.js    # POST/GET /api/slots (partidas)
│   │   ├── capturedPokemonController.js  # GET /api/pokedex
│   │   ├── rankingController.js     # GET /api/ranking
│   │   └── replayController.js      # GET /api/slots/:id/replay
│   │
│   ├── models/                      # Mapeos Sequelize ↔ PostgreSQL
│   │   ├── userModels.js            # Tabla: users
│   │   ├── gameSlotModels.js        # Tabla: game_slots
│   │   ├── capturedPokemonModels.js # Tabla: captured_pokemon
│   │   ├── gameReplayModels.js      # Tabla: game_replays
│   │   ├── rankingModels.js         # Tabla: rankings
│   │   ├── refreshTokenModels.js    # Tabla: refresh_tokens
│   │   └── index.js                 # Exporta todos los modelos
│   │
│   ├── routes/                      # Definición de endpoints
│   │   ├── authRoutes.js            # Rutas /api/auth/*
│   │   ├── userRoutes.js            # Rutas /api/users
│   │   ├── gameSlotRoutes.js        # Rutas /api/slots
│   │   ├── rankingRoutes.js         # Rutas /api/ranking
│   │   ├── replayRoutes.js          # Rutas /api/slots/:id/replay
│   │   ├── capturedPokemonRoutes.js # Rutas /api/pokedex
│   │   └── index.js                 # Agrupa todas las rutas
│   │
│   ├── services/                    # Lógica de negocio
│   │   ├── authService.js           # Registra usuarios, genera JWTs
│   │   ├── userService.js           # Querys de usuarios
│   │   ├── slotService.js           # Lógica de partidas
│   │   ├── rankingService.js        # Cálculo de rankings
│   │   ├── replayService.js         # Gestión de replays
│   │   └── index.js                 # Exporta todos los servicios
│   │
│   ├── validations/                 # Validaciones de entrada
│   │   ├── authValidation.js        # Valida username/password
│   │   ├── slotValidation.js        # Valida movimientos
│   │   ├── rankingValidation.js     # Valida scores
│   │   ├── usernameValidation.js    # Anti-spam/bots
│   │   └── index.js
│   │
│   ├── middlewares/                 # Procesamiento HTTP global
│   │   ├── authMiddleware.js        # Verifica JWT tokens
│   │   ├── errorHandler.js          # Gestión centralizada de errores
│   │   ├── rateLimitMiddleware.js   # Límites de intentos login/registro
│   │   └── index.js
│   │
│   ├── views/                       # Templates Pug (Admin)
│   │   ├── layout.pug               # HTML base
│   │   ├── login.pug                # Formulario login
│   │   ├── dashboard.pug            # Dashboard principal
│   │   ├── users.pug                # Listado usuarios
│   │   ├── users-detail.pug         # Detalles usuario
│   │   ├── ranking.pug              # Ranking global
│   │   ├── pokedex.pug              # Pokédex
│   │   └── slots.pug                # Gestión slots
│   │
│   └── index.js                     # Punto de entrada (Express setup)
│
├── public/                          # Archivos estáticos (CSS, JS, imágenes)
│   ├── css/                         # Estilos admin
│   ├── js/                          # Scripts jQuery para admin
│   └── img/                         # Logos e iconos
│
├── .env.example                     # Variables de entorno (plantilla)
├── docker-compose.yml               # Orquestación containers
├── package.json                     # Dependencias npm
└── [SQLs]
    ├── pokesector_database.sql      # Creación tablas
    └── seed_data.sql                # Datos de ejemplo
```

### Frontend

```
frontend/
├── src/
│   ├── game/                        # Lógica núcleo del juego
│   │   ├── main.js                  # Loop de juego principal
│   │   ├── game-state.js            # Estado global del juego
│   │   ├── game-persist.js          # Persistencia localStorage
│   │   ├── gamepad-input.js         # Input de controles
│   │   ├── movement.js              # Movimiento del jugador
│   │   ├── explorer.js              # Lógica exploración
│   │   ├── battle.js                # Sistema de batalla
│   │   ├── pokemon.js               # Interacción Pokémon
│   │   ├── intro.js                 # Pantalla intro
│   │   ├── menu.js + menu-*.js      # Menús (start, account, config, etc)
│   │   ├── stats.js + stats-*.js    # Pantallas estadísticas
│   │   ├── sounds.js                # Gestión de audio
│   │   └── api.js                   # Llamadas al backend
│   │
│   ├── services/                    # Servicios HTTP
│   │   ├── api/
│   │   │   ├── http.js              # Cliente HTTP genérico
│   │   │   ├── auth.js              # Llamadas auth
│   │   │   ├── users.js             # Llamadas usuarios
│   │   │   ├── pokedex.js           # Llamadas Pokédex
│   │   │   ├── ranking.js           # Llamadas ranking
│   │   │   ├── slots.js             # Llamadas slots
│   │   │   └── replays.js           # Llamadas replays
│   │   └── apiService.js            # Orquestador servicios
│   │
│   ├── components/                  # Componentes React
│   │   ├── GameScreen.jsx           # Pantalla principal juego
│   │   ├── BattleScreen.jsx         # Batalla contra Pokémon
│   │   ├── GameOverScreen.jsx       # Pantalla game over
│   │   ├── MenuScreen.jsx           # Menus
│   │   ├── StatsScreen.jsx          # Estadísticas
│   │   └── GameControls.jsx         # Controles UI
│   │
│   ├── hooks/                       # Custom hooks
│   │   └── useGameInit.js           # Hook inicialización juego
│   │
│   ├── css/                         # Estilos globales + componentes
│   │   ├── styles.css               # Base estilos
│   │   ├── game-screen.css
│   │   ├── battle-screen.css
│   │   ├── menu-screen.css
│   │   ├── stats-screen.css
│   │   └── ... (más estilos)
│   │
│   ├── App.jsx                      # Componente raíz React
│   └── main.jsx                     # Entry point Vite
│
├── public/                          # Assets estáticos
│   ├── img/                         # Sprites, fondos, iconos
│   ├── sounds/                      # Efectos y música
│   └── fonts/                       # Fuentes (Game Boy retro)
│
├── index.html                       # HTML base
├── vite.config.js                   # Configuración Vite
├── package.json                     # Dependencias
└── .env.example                     # Variables entorno
```

---

## Flujos de Datos (Context)

### Autenticación

```
Login successful
        ⬇
localStorage.setItem('access_token', jwt)
localStorage.setItem('refresh_token', jwt)
        ⬇
Frontend incluye en headers:
  Authorization: Bearer {access_token}
        ⬇
Backend verifica en authMiddleware
  → Decodifica JWT
  → Si válido, req.user = payload
  → Si expirado pero refresh válido, genera nuevo access
        ⬇
Controller accede a req.user.id, req.user.role, etc.
```

### Persistencia de Partida

```
Usuario juega (no registrado)
        ⬇
JavaScript almacena en localStorage:
  - Posición jugador
  - Pokémon capturados
  - Estado inventario
  - Movimientos
        ⬇
Si se registra durante la partida:
  POST /api/slots (crea slot)
        ⬇
Partida sincroniza con servidor
  POST /api/slots/:id/save
        ⬇
PostgreSQL almacena:
  - game_slots (una row por partida)
  - captured_pokemon (muchas rows)
  - game_replays (movimientos)
```

---

## Seguridad

### Autenticación & Tokens

- **Access Token** (1 hora)
  - Usado en `Authorization: Bearer` header
  - Contiene: user_id, username, role
  - Se verifica en cada request a API protegida

- **Refresh Token** (7 días)
  - Almacenado en DB (refresh_tokens table)
  - Se usa para generar nuevo access_token
  - Endpoint: POST /api/auth/refresh

### Rate Limiting

- **Register**: 5 intentos / 15 segundos
- **Login**: 5 intentos / 15 segundos
- Almacena en memoria (puede mejorase con Redis)

### Validaciones

- **Username**: No puede contener SQL, XSS, URLs
- **Password**: Mín 6 caracteres, hash bcrypt
- **Input**: Se valida en cada endpoint

---

## Próximos Documentos

- [BACKEND.md](./BACKEND.md) - Detalles implementación backend
- [API.md](./API.md) - Referencia endpoints
- [MODELOS.md](./MODELOS.md) - Esquema base de datos
