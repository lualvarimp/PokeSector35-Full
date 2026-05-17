# PokéSector 35

> Juego de exploración y captura de Pokémon™ estilo Game Boy, desarrollado como proyecto fullstack de clase con React, Express y PostgreSQL.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## Tabla de contenidos

- [¿Qué es PokéSector 35?](#-qué-es-pokésector-35)
- [Características principales](#-características-principales)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación paso a paso](#-instalación-paso-a-paso)
- [Levantar el proyecto](#-levantar-el-proyecto)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura de archivos](#-estructura-de-archivos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Cómo jugar](#-cómo-jugar)
- [Panel de administración](#-panel-de-administración)
- [Ramas de Git](#-ramas-de-git)
- [Solución de problemas](#-solución-de-problemas)
- [Decisiones técnicas destacadas](#-decisiones-técnicas-destacadas)
- [Requisitos de clase cumplidos](#-requisitos-de-clase-cumplidos)

---

## ¿Qué es PokéSector 35?

PokéSector 35 es un videojuego fullstack con estética retro de Game Boy. El jugador explora un mapa de 5×7 celdas (35 en total, de ahí el nombre), encuentra Pokémon salvajes al azar y trata de capturarlos antes de llegar a la casilla de meta.

El juego cuenta con dos modos:

- **Modo invitado** — cualquiera puede jugar directamente desde el navegador sin registrarse. Los datos no se guardan al cerrar.
- **Modo registrado** — los usuarios autenticados tienen hasta 3 slots de partida guardada, Pokédex acumulada por slot, historial de movimientos (replay) y posición en el ranking global por dificultad.

El backend expone una API REST completa documentada con Swagger. Un panel de administración SSR (Pug) permite gestionar usuarios, slots, Pokédex y ranking sin acceder directamente a la base de datos.

---

## Características principales

### Juego
- Mapa de 5×7 con 20 variantes generadas aleatoriamente (5 por dificultad)
- Mayor probabilidad de encuentros aleatorios con Pokémon en celdas *wild* (variable según dificultad)
- Sistema de captura con Pokéballs (tasa de éxito configurable)
- 4 niveles de dificultad: Fácil, Normal, Difícil, Infernal
- Indicador en pantalla cuando ya has capturado el Pokémon que aparece
- Pantalla de resultados navegable, con Pokémon capturados y escapados
- Pantallas de victoria (meta) y derrota (Game Over) con menú sin recarga de página

### Personalización
- 8 exploradores seleccionables (boy, girl, professor, nurse, brock, police, rocket-boy, rocket-girl)
- Color de consola personalizable con preview en tiempo real (persiste entre sesiones)
- 25 stickers de Pokémon para decorar la consola
- Opción de vibración del mando (ON/OFF)

### Sonido
- 10 pistas de música de fondo, aleatorias por partida (en loop, volumen suave)
- Efectos de sonido en acciones clave

### Controles
- Teclado (flechas, A/B/Space/Escape/Enter)
- D-Pad y botones táctiles en pantalla (click y touch)
- Gamepad/joystick con detección automática y vibración/rumble

### Usuarios y seguridad
- Registro y login con JWT (access token 15 min + refresh token 7 días)
- Rate limiting: 5 intentos de login en 15 min; 3 intentos de registro en 1 hora
- El `username` (credencial de login) **nunca aparece en pantalla**: siempre se sanitiza hacia el nombre de explorador
- Borrado de cuenta con doble confirmación (elimina todos los datos en cascada)

### Datos
- Hasta 3 slots de partida por usuario
- Pokédex acumulada por slot (sin duplicados dentro del mismo slot)
- Ranking global por dificultad (top 50 por nivel)
- Replay de movimientos guardado en base de datos al llegar a la meta
- Modo invitado: datos en localStorage, sin persistencia en BD

### Panel de administración
- Gestión completa de usuarios, slots y Pokédex
- Filtro de Pokédex por slot, con búsqueda combinada
- Edición del nombre de explorador y gestión de contraseña de cualquier usuario

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend (UI) | React | 18.2 |
| Frontend (bundler) | Vite | 6.0 |
| Frontend (lógica del juego) | Vanilla JS (módulos ES) | ES2022 |
| Backend | Express | 5.0 |
| Runtime | Node.js | 18+ |
| ORM | Sequelize | 6.37 |
| Base de datos | PostgreSQL | 15 |
| Panel admin | Pug (SSR) | — |
| Autenticación | JWT | — |
| Contenedores | Docker + Docker Compose | — |
| API externa | PokeAPI (v2) | — |
| Documentación API | Swagger / OpenAPI | — |

---

## Arquitectura del proyecto

```
pokesector-35/
├── frontend/          ← React + Vite + lógica de juego en Vanilla JS
└── backend/           ← Express API REST + panel admin Pug + PostgreSQL en Docker
```

### Frontend

El frontend combina React (para la estructura de componentes y el estado de navegación entre pantallas) con módulos de JavaScript puro (para toda la lógica interna del juego). Esta separación permite que el juego funcione sin recargas de página mientras React gestiona qué pantalla es visible en cada momento.

```
App.jsx  →  renderizado condicional de pantallas
         →  MenuScreen, GameScreen, BattleScreen,
            StatsScreen, GameOverScreen, GameControls

game/    →  lógica de juego en módulos ES puros
             controls.js       dispatcher centralizado de inputs
             movement.js       movimiento + detección de celdas
             battle.js         combate y captura
             menu-*.js         menú principal dividido por módulos
             end-menu.js       menús de fin de partida
             game-state.js     estado global del juego
             sounds.js         sistema de audio (10 pistas aleatorias)
             pokemon.js        clases POO de Pokémon y Pokédex

services/ → cliente HTTP hacia el backend
             apiService.js     fachada
             api/              módulos por dominio (auth, slots, pokedex, ranking…)
```

### Backend

```
backend/src/
  controllers/   lógica de negocio por recurso
  models/        modelos Sequelize
                   User, GameSlot, CapturedPokemon,
                   Ranking, GameReplay, RefreshToken
  routes/        endpoints agrupados por recurso
  services/      lógica reutilizable (rankingService, etc.)
  middlewares/   auth JWT, rate limiting, validaciones
  validations/   schemas de validación de entrada
  views/         plantillas Pug del panel admin
backend/public/
  js/            JavaScript del panel admin
  css/           estilos del panel admin
```

### Base de datos (esquema simplificado)

```
users
  └── game_slots      (max 3 por usuario)
        └── captured_pokemon   (ON DELETE CASCADE)
        └── game_replays
  └── refresh_tokens
  └── ranking
```

---

## Requisitos previos

Antes de empezar, necesitas tener instalado en tu máquina:

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Docker Desktop | Reciente | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| Git | Cualquiera | `git --version` |

> **Windows**: asegúrate de que Docker Desktop esté en ejecución antes de seguir los pasos. En Linux, si instalaste Docker sin Desktop, el demonio debe estar activo: `sudo systemctl start docker`.

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/PokeSector35-Full.git
cd PokeSector35-Full
```

### 2. Configurar las variables de entorno del backend

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

```bash
cd backend
cp .env.example .env
```

Abre `.env` con cualquier editor de texto y rellena los valores:

```env
# Puerto del servidor Express
PORT=3000 

# Conexión a PostgreSQL (debe coincidir con docker-compose.yml)
DB_HOST=db
DB_PORT=5432
DB_NAME=pokesector
DB_USER=pokesector_user
DB_PASSWORD=pokesector_pass

# JWT — cambia estos valores por cadenas largas y aleatorias en producción
JWT_SECRET=tu_secreto_muy_largo_aqui_cambio_en_produccion
JWT_REFRESH_SECRET=otro_secreto_diferente_cambio_en_produccion

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# Credenciales del panel de administración
ADMIN_USER=Jorge
ADMIN_PASSWORD=testpass123

# Entorno
NODE_ENV=development
```

### 3. Configurar las variables de entorno del frontend

```bash
cd ../frontend
cp .env.example .env
```

Contenido del `.env` del frontend:

```env
# URL del backend (Vite redirige /api a esta URL)
VITE_API_URL=http://localhost:3000
```

### 4. Levantar la base de datos con Docker

```bash
cd ../backend
docker compose up -d
```

Esto arranca dos contenedores:
- **PostgreSQL 15** en el puerto `5432`
- **pgAdmin 4** en el puerto `5050` (interfaz web para inspeccionar la BD)

Comprueba que están corriendo:

```bash
docker compose ps
```

Deberías ver:

```
NAME                STATUS
pokesector-db       running
pokesector-pgadmin  running
```

### 5. Instalar dependencias del backend

```bash
# Desde la carpeta backend/
npm install
```

### 6. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

---

## Levantar el proyecto

Necesitas **tres terminales** abiertas simultáneamente (o paneles de tu editor):

**Terminal 1 — Base de datos** (si no la levantaste en el paso 4):

```bash
cd backend
docker compose up -d
```

**Terminal 2 — Backend:**

```bash
cd backend
npm run dev
```

Deberías ver en consola:
```
🚀 Servidor corriendo en http://localhost:3000
📚 Swagger UI disponible en http://localhost:3000/api-docs
```

Las migraciones de Sequelize se ejecutan automáticamente al arrancar. La primera vez creará todas las tablas.

**Terminal 3 — Frontend:**

```bash
cd frontend
npm run dev
```

Deberías ver:
```
  VITE v6.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### URLs disponibles

| Servicio | URL |
|---|---|
| **Juego** | http://localhost:5173 |
| **API REST** | http://localhost:3000 |
| **Swagger (docs API)** | http://localhost:3000/api-docs |
| **Panel de administración** | http://localhost:3000/admin |
| **pgAdmin** | http://localhost:5050 |

### Detener el proyecto

```bash
# Detener frontend y backend: Ctrl+C en cada terminal

# Detener los contenedores Docker (conserva los datos):
cd backend
docker compose down

# Detener Y borrar todos los datos de la BD:
docker compose down -v
```

---

## Variables de entorno

### Backend (`backend/.env`)

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor Express | `3000` |
| `DB_HOST` | Host de PostgreSQL | `db` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `pokesector` |
| `DB_USER` | Usuario de PostgreSQL | `pokesector_user` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `pokesector_user` |
| `JWT_SECRET` | Clave para firmar access tokens | tu_secreto_muy_largo_aqui_cambio_en_produccion |
| `JWT_REFRESH_SECRET` | Clave para firmar refresh tokens | otro_secreto_diferente_cambio_en_produccion |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:5173` |
| `ADMIN_USER` | Usuario del panel admin | `Jorge` |
| `ADMIN_PASSWORD` | Contraseña del panel admin | testpass123 |
| `NODE_ENV` | Entorno (`development`/`production`) | `development` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:3000` |

---

## Estructura de archivos

```
pokesector-35/
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   ├── fonts/              tipografía retro (pokemonGB.ttf)
│   │   ├── img/                sprites de exploradores, items, UI
│   │   └── sounds/
│   │       └── soundtrack/     10 pistas de música de fondo (.mp3)
│   └── src/
│       ├── main.jsx            entry point de React
│       ├── App.jsx             orquestador de pantallas
│       ├── hooks/
│       │   └── useGameInit.js  hook personalizado de inicialización
│       ├── components/
│       │   ├── MenuScreen.jsx
│       │   ├── GameScreen.jsx
│       │   ├── BattleScreen.jsx
│       │   ├── StatsScreen.jsx
│       │   ├── GameOverScreen.jsx
│       │   └── GameControls.jsx
│       ├── game/               lógica del juego (Vanilla JS, módulos ES)
│       │   ├── main.js         arranque + restauración desde localStorage
│       │   ├── controls.js     dispatcher centralizado de inputs
│       │   ├── movement.js     movimiento + detección de celdas
│       │   ├── battle.js       combate y captura
│       │   ├── game-state.js   estado global
│       │   ├── explorer.js     sanitización del nombre + HUD explorador
│       │   ├── game-persist.js persistencia (localStorage + backend)
│       │   ├── menu.js         fachada del menú principal
│       │   ├── menu-nav.js     navegación y enrutamiento del menú
│       │   ├── menu-start.js   flujo inicio/continuar partida y slots
│       │   ├── menu-customize.js color, explorador, dificultad, sticker
│       │   ├── menu-account.js login, registro, logout, borrar cuenta
│       │   ├── menu-ranking.js ranking por dificultad con scroll
│       │   ├── menu-pokedex.js Pokédex accesible desde el menú principal
│       │   ├── menu-config.js  datos estáticos: exploradores, mapas, stickers
│       │   ├── end-menu.js     menús de fin de partida (meta / game over)
│       │   ├── results-screen.js pantalla de resultados con scroll
│       │   ├── game-over.js    trigger de game over + re-exports
│       │   ├── sounds.js       sistema de audio (10 pistas aleatorias)
│       │   ├── intro.js        animación de intro
│       │   ├── pokemon.js      clases POO Pokémon y Pokédex
│       │   ├── api.js          cliente PokeAPI externa
│       │   ├── hud.js          HUD del juego (HP, pokéballs, nombre)
│       │   ├── stats.js        controlador pantalla de estadísticas
│       │   ├── stats-pokedex.js Pokédex en pantalla de stats
│       │   ├── stats-summary.js resumen de estadísticas
│       │   ├── stats-ui.js     utilidades UI compartidas de stats
│       │   ├── gamepad-input.js soporte gamepad/joystick con rumble
│       │   └── gamepad-debug.js utilidades de debugging de gamepad
│       ├── services/
│       │   ├── apiService.js   fachada del cliente HTTP (39 líneas)
│       │   └── api/
│       │       ├── http.js     cliente base + gestión automática de tokens JWT
│       │       ├── auth.js     register, login, logout, isLoggedIn
│       │       ├── slots.js    CRUD completo de slots
│       │       ├── pokedex.js  Pokédex capturada
│       │       ├── ranking.js  ranking global
│       │       ├── replays.js  replays de partida
│       │       ├── users.js    stats y borrado de cuenta
│       │       └── save.js     orquestador del volcado de fin de partida
│       └── css/
│           ├── styles.css          estilos globales + consola GameBoy
│           ├── intro-screen.css
│           ├── menu-screen.css
│           ├── game-screen.css
│           ├── battle-screen.css
│           ├── goal-screen.css     pantalla de meta + results-screen
│           ├── stats-screen.css
│           └── game-over-screen.css
│
└── backend/
    ├── docker-compose.yml      PostgreSQL 15 + pgAdmin 4
    ├── package.json
    ├── .env.example
    └── src/
        ├── app.js              configuración Express (middleware, rutas, CORS)
        ├── server.js           arranque del servidor + Swagger
        ├── controllers/
        │   ├── authController.js         registro, login, refresh, logout
        │   ├── userController.js         stats, borrar cuenta, spam
        │   ├── slotController.js         CRUD de slots
        │   ├── capturedPokemonController.js Pokédex por slot
        │   ├── rankingController.js      ranking global y por porcentaje
        │   └── replayController.js       guardar y leer replays
        ├── models/
        │   ├── User.js
        │   ├── GameSlot.js
        │   ├── CapturedPokemon.js
        │   ├── Ranking.js
        │   ├── GameReplay.js
        │   └── RefreshToken.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── userRoutes.js
        │   ├── slotRoutes.js
        │   ├── pokemonRoutes.js
        │   ├── rankingRoutes.js
        │   └── replayRoutes.js
        ├── services/
        │   └── rankingService.js   queries de ranking (LIMIT 50 por dificultad)
        ├── middlewares/
        │   ├── authMiddleware.js       verificación de JWT
        │   └── rateLimitMiddleware.js  rate limiting por IP
        ├── validations/
        │   ├── slotValidation.js       validación de campos del slot
        │   └── usernameValidation.js   detección de patrones de bot
        └── views/                      panel admin (Pug SSR)
            ├── layout.pug
            ├── users.pug
            ├── slots.pug
            └── pokedex.pug
```

---

## Endpoints de la API

La documentación completa e interactiva está disponible en **http://localhost:3000/api-docs** (Swagger UI).

### Autenticación

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Crear cuenta nueva | No |
| POST | `/api/auth/login-game` | Login con JWT | No |
| POST | `/api/auth/refresh` | Renovar access token | No |

### Usuarios

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/users/:id/stats` | Estadísticas del usuario | Sí |
| DELETE | `/api/users/:id/me` | Borrar propia cuenta | Sí |
| GET | `/api/users/spam` | Listar cuentas spam (admin) | Admin |

### Slots

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/users/:id/slots` | Listar slots del usuario | Sí |
| POST | `/api/users/:id/slots` | Crear nuevo slot | Sí |
| PUT | `/api/users/:id/slots/:number` | Actualizar slot | Sí |
| DELETE | `/api/users/:id/slots/:number` | Borrar slot (CASCADE pokémon) | Sí |

### Pokédex

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/users/:id/pokedex?slot_id=X` | Pokédex filtrada por slot | Sí |
| POST | `/api/users/:id/pokedex` | Añadir Pokémon capturado | Sí |
| DELETE | `/api/users/:id/pokedex/:pokemonId` | Eliminar Pokémon | Sí |

### Ranking

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/ranking` | Ranking global (top 50 por dificultad) | No |
| GET | `/api/ranking/by-percentage` | Ranking por porcentaje capturado | No |
| POST | `/api/ranking/:userId` | Crear entrada de ranking | Sí |

### Replays

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/users/:id/slots/:slotId/replay` | Guardar replay de movimientos | Sí |
| GET | `/api/users/:id/slots/:slotId/replay` | Obtener replay | Sí |

---

## Cómo jugar

### Controles

| Acción | Teclado | Botones en pantalla | Gamepad |
|---|---|---|---|
| Mover | Flechas de cursor | D-Pad | Stick izquierdo / D-Pad |
| Confirmar / Acción A | Space / tecla A | Botón A | Botón A |
| Cancelar / Acción B | Escape / tecla B | Botón B | Botón B |
| Abrir menú / START | Enter | START | Botón Start |
| Saltar intro | Space / A | Botón A | Botón A |

### Flujo de juego

```
INTRO (animada — saltable con A/Space a partir de 5 segundos)
    ↓
MENÚ PRINCIPAL
    ├── INICIAR PARTIDA
    │     ├── CONTINUAR (solo si logueado) → seleccionar slot → jugar
    │     └── NUEVA PARTIDA → confirmar si slot ocupado → nombre → jugar
    ├── PERSONALIZAR → Dificultad / Explorador / Color / Sticker / Vibración
    ├── POKÉDEX → ver colección del slot activo
    ├── RANKING → top 50 por dificultad (◀▶ cambia dificultad, ▲▼ scroll)
    └── CUENTA → Login / Registro / Cerrar sesión / Borrar cuenta
    ↓
PARTIDA
    ├── Moverse por el mapa 5×7 (flechas / D-Pad / stick)
    ├── Celdas "wild" → probabilidad de encuentro según dificultad
    │     └── BATALLA
    │           ├── Lanzar Pokéball (consume 1) → captura o fallo
    │           └── Huir (pierde 1 HP)
    └── Llegar a la casilla de meta (esquina opuesta al inicio)
    ↓
META (¡Enhorabuena!) ✓
    ├── Si logueado: guarda slot, Pokédex, ranking y replay en BD
    └── Menú: JUGAR DE NUEVO / VER RESULTADOS / VOLVER AL MENÚ / CERRAR SESIÓN

GAME OVER ✗
    ├── Los Pokémon capturados en esta partida NO se guardan en BD
    ├── Pulsar START → aparece menú (sin recargar página)
    └── Menú: JUGAR DE NUEVO / VOLVER AL MENÚ / CERRAR SESIÓN
```

### Modo invitado vs. modo registrado

| Función | Invitado | Registrado |
|---|---|---|
| Jugar | ✅ | ✅ |
| Nombre de explorador | Ash (fijo) | Personalizable |
| Slots de partida | 1 (solo en localStorage) | Hasta 3 (persistido en BD) |
| Pokédex persistente entre sesiones | ❌ | ✅ |
| Ranking | ❌ | ✅ |
| Replay de movimientos | ❌ | ✅ |
| Opción "Continuar" en menú | ❌ | ✅ |

---

## Panel de administración

Accede en: **http://localhost:3000/admin**

Credenciales: las definidas en `ADMIN_USER` y `ADMIN_PASSWORD` del `.env` del backend.

Funcionalidades disponibles:

- **Usuarios** — listar todos los usuarios, editar nombre de explorador, filtrar posibles cuentas spam, eliminar usuarios
- **Slots** — ver los slots de cada usuario con recuento de Pokémon y fecha de actualización; crear, editar (incluyendo sticker asignado) y eliminar slots
- **Pokédex** — ver los Pokémon capturados con filtro combinado por usuario y slot, añadir o eliminar entradas

---

## Ramas de Git

```
main                    ← versión estable (Beta v1.0.0)
dev                     ← integración de features
feature/beta-v1.x.x     ← rama de desarrollo activo
```

Para contribuir:
1. Crea una rama desde `dev`: `git checkout -b feature/mi-feature dev`
2. Desarrolla y commitea tus cambios
3. Abre un Pull Request hacia `dev`
4. Usa *squash and merge* en el PR

No hagas commits directamente en `main` ni en `dev`.

---

## Solución de problemas

### "Cannot find module" o "vite no se reconoce como comando"

```bash
cd frontend && npm install
cd backend && npm install
```

### "Container name already in use"

```bash
cd backend
docker compose down
docker compose up -d
```

### La base de datos no conecta

Comprueba que Docker Desktop está en ejecución. Verifica que el puerto 5432 no esté ocupado por otra instalación de PostgreSQL:

```bash
# Mac / Linux
lsof -i :5432

# Windows
netstat -ano | findstr 5432
```

Si tienes PostgreSQL instalado localmente y usando ese puerto, detén el servicio local o cambia `DB_PORT` a `5433` en el `.env` y en el `docker-compose.yml`.

### El frontend no conecta al backend (error 404 o CORS)

1. Confirma que el backend está corriendo en `http://localhost:3000`
2. Comprueba que `VITE_API_URL=http://localhost:3000` en `frontend/.env`
3. Comprueba que `FRONTEND_URL=http://localhost:5173` en `backend/.env`
4. Reinicia ambos servidores tras cambiar el `.env`

### Las imágenes o sonidos no cargan

Los assets deben estar en `frontend/public/img/` y `frontend/public/sounds/`. A partir de Beta v1.1.0 se eliminó la subcarpeta `/assets/`. Si copiaste archivos manualmente, asegúrate de que las rutas no incluyen `/assets/` en el medio.

### El juego se queda en la pantalla de inicio

Pulsa `Space` o `Enter` en el teclado, o el botón `START` del D-Pad en pantalla. La animación de intro es saltable pulsando `A` o `Space` a partir de los 5 segundos.
Si el problema persiste, refresca el navegador con F5 o Ctrl +F5.

### La Pokédex del menú muestra "Error al cargar"

Puede ser un token JWT caducado. Cierra sesión desde el menú `CUENTA → CERRAR SESIÓN`, vuelve a entrar y prueba de nuevo. Si el error persiste, abre la consola del navegador (F12 → pestaña Network) y anota el código de error exacto.

### "Invalid Date" en las cards de slots del panel admin

Este bug fue corregido en Beta v1.0.0. Si lo ves, asegúrate de tener la rama `main` o más reciente.

---

## Decisiones técnicas destacadas

### React + Vanilla JS — ¿por qué coexisten?

React gestiona qué pantalla es visible (estado de navegación). La lógica del juego (movimiento, combate, controles, sonido) vive en módulos ES puros para tener control total del ciclo de vida sin las restricciones del modelo de renderizado de React. Esto evita re-renders innecesarios en el bucle del juego y simplifica el acceso al DOM de las pantallas activas.

### `useRef` para los event listeners

Los event listeners registrados dentro de `useEffect` crean un cierre sobre el estado inicial. Para que accedan siempre al estado más reciente, se almacena el estado en un `useRef` que se actualiza en cada render. Es el patrón estándar de React cuando se trabaja con listeners de larga vida.

### Fachadas para mantener compatibilidad tras la refactorización

Cuando los archivos monolíticos (`menu.js` de 1148 líneas, `apiService.js` de 383 líneas) se dividieron en módulos especializados, se mantuvieron los mismos nombres de exportación mediante archivos fachada. Esto permite que todos los consumidores existentes funcionen sin cambios.

### `findOrCreate` para evitar Pokémon duplicados

Al guardar la Pokédex en la BD se usa `findOrCreate` con la clave compuesta `(user_id, pokemon_id, slot_id)`. Esto garantiza que el mismo Pokémon no aparece duplicado en el mismo slot aunque el usuario lo encuentre en múltiples partidas. Sí puede existir en distintos slots.

### `mousedown` en lugar de `click` para los botones

`click` se dispara al soltar el botón. `mousedown` se dispara al pulsarlo. Para los controles de un juego, esta reducción de latencia es perceptible, especialmente en el D-Pad.

### Bandeja de cambios pendientes para la personalización

Los cambios de color, explorador y dificultad se acumulan en `localStorage` con una flag. Se aplican (y sincronizan con la BD) únicamente al iniciar o continuar partida. Esto reduce el número de peticiones a la API y evita estados intermedios inconsistentes en la BD.

### `ON DELETE CASCADE` en `captured_pokemon.slot_id`

Al borrar un slot se eliminan automáticamente todos sus Pokémon capturados en la BD, sin necesidad de peticiones adicionales desde el cliente. Más eficiente y evita registros huérfanos.

---

## Requisitos de clase cumplidos

| Requisito | Implementación |
|---|---|
| `useState` | `App.jsx`, `StatsScreen.jsx` |
| `useEffect` | `App.jsx`, `StatsScreen.jsx`, `useGameInit.js` |
| `useRef` | `useGameInit.js` (evitar doble inicialización en StrictMode) |
| Hook personalizado | `useGameInit` — combina useState + useEffect + useRef |
| Mínimo 5 componentes | 6 componentes: `MenuScreen`, `GameScreen`, `BattleScreen`, `StatsScreen`, `GameOverScreen`, `GameControls` |
| `localStorage` | Ampliamente usado: estado de partida, personalización, sticker, color, bandeja de cambios… |
| API externa | PokeAPI v2 — obtención de datos de Pokémon aleatorios en los encuentros |
| API interna | API REST propia con Express + PostgreSQL, completamente documentada con Swagger |

---

## Licencia

Este proyecto es un trabajo académico desarrollado con fines educativos. Los sprites, nombres e iconografía relacionada con Pokémon™ son propiedad de Nintendo / Game Freak. Las pistas de música de fondo son libres de derechos. El código fuente puede reutilizarse con fines educativos citando la fuente.
