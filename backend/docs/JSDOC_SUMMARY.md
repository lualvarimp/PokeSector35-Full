# Archivos con JSDoc - PokéSector 35

Este documento resume todos los archivos a los que se han agregado comentarios JSDoc equilibrados. Los comentarios están diseñados para ser informativos sin ser excesivos.

## Archivos de Servicios (src/services/)

### authService.js
Contiene la lógica de autenticación del sistema.

- `registerUser(username, password)` - Registra un nuevo usuario con contraseña hasheada
- `loginUser(username, password)` - Valida credenciales y devuelve el usuario autenticado
- `generateAccessToken(user)` - Crea un JWT de corta duración (15 min)
- `generateRefreshToken(user)` - Crea un JWT de larga duración (7 días) y lo almacena en BD
- `refreshAccessToken(refreshToken)` - Valida refresh token y genera nuevo access token

### userService.js
Obtiene estadísticas agregadas de usuarios.

- `getUserStats(userId)` - Retorna total de juegos, pokémon capturados/escapados y pokémon únicos

### slotService.js
CRUD completo para slots de juego.

- `getSlotsByUserId(userId)` - Obtiene todos los slots del usuario
- `getSlotByNumber(userId, slotNumber)` - Obtiene un slot específico
- `createNewSlot(userId, slotData)` - Crea un nuevo slot
- `updateSlotData(userId, slotNumber, slotData)` - Actualiza datos del slot
- `deleteSlotData(userId, slotNumber)` - Elimina un slot

### rankingService.js
Gestión del sistema de ranking y estadísticas.

- `getRankingGlobal(difficulty)` - Obtiene ranking global (con filtro opcional)
- `getRankingByUser(userId)` - Historial de rankings del usuario
- `createNewRanking(userId, rankingData)` - Registra nueva partida completada
- `deleteRankingById(rankingId)` - Elimina entrada de ranking (admin)
- `getRankingByPercentage(difficulty)` - Ranking ordenado por % de captura

### replayService.js
Gestión de grabaciones de partidas.

- `saveReplay(userId, slotId, movements)` - Guarda array JSON de movimientos
- `getReplayBySlot(slotId)` - Obtiene replay específico de un slot
- `getReplaysByUser(userId)` - Obtiene todos los replays del usuario
- `deleteReplay(replayId)` - Elimina un replay (admin)

---

## Archivos de Controllers (src/controllers/)

### authController.js
Maneja endpoints de autenticación.

- `register(req, res)` - POST /api/auth/register
- `login(req, res)` - POST /api/auth/login
- `refresh(req, res)` - POST /api/auth/refresh
- `logout(req, res)` - POST /api/auth/logout (actualmente stub)

### userController.js
Gestión completa de usuarios (admin).

- `getAllUsers(req, res)` - GET /api/users (solo admin)
- `getUserById(req, res)` - GET /api/users/:id
- `updateUser(req, res)` - PUT /api/users/:id
- `deleteUser(req, res)` - DELETE /api/users/:id (soft delete)
- `getStats(req, res)` - GET /api/users/:id/stats
- `restoreUser(req, res)` - PUT /api/users/:id/restore (solo admin)
- `permanentDeleteUser(req, res)` - DELETE /api/users/:id/permanent (solo admin)
- `changePassword(req, res)` - PUT /api/users/:id/change-password (solo admin)

### gameSlotController.js
Gestión de partidas guardadas.

- `getSlotsByUser(req, res)` - GET /api/users/:userId/slots
- `getSlotById(req, res)` - GET /api/users/:userId/slots/:slotNumber
- `createSlot(req, res)` - POST /api/users/:userId/slots
- `updateSlot(req, res)` - PUT /api/users/:userId/slots/:slotNumber
- `deleteSlot(req, res)` - DELETE /api/users/:userId/slots/:slotNumber

### rankingController.js
Gestión del sistema de rankings.

- `getAllRanking(req, res)` - GET /api/ranking (con filtro opcional por dificultad)
- `getUserRanking(req, res)` - GET /api/ranking/:userId
- `createRanking(req, res)` - POST /api/ranking/:userId
- `deleteRanking(req, res)` - DELETE /api/ranking/:rankingId (solo admin)
- `getRankingPercentage(req, res)` - GET /api/ranking/by-percentage

### capturedPokemonController.js
Gestión del Pokédex de usuario.

- `getPokedexByUser(req, res)` - GET /api/users/:id/pokedex
- `addCapturedPokemon(req, res)` - POST /api/users/:id/pokedex
- `deleteCapturedPokemon(req, res)` - DELETE /api/users/:id/pokedex/:pokemonId
- `getCapturesBySlot(req, res)` - GET /api/users/:userId/captures/:slotId

### replayController.js
Gestión de grabaciones de partidas.

- `createReplay(req, res)` - POST /api/users/:userId/slots/:slotId/replay
- `getReplay(req, res)` - GET /api/users/:userId/slots/:slotId/replay
- `getUserReplays(req, res)` - GET /api/users/:userId/replays
- `removeReplay(req, res)` - DELETE /api/users/:userId/replays/:replayId (solo admin)

---

## Archivos de Middlewares (src/middlewares/)

### authMiddleware.js
Middlewares de autenticación y autorización.

- `verifyToken(req, res, next)` - Verifica JWT válido en Authorization header
- `requireAdmin(req, res, next)` - Verifica que el usuario tenga rol de admin

Ambos documentan cuándo fallan y qué datos esperan.

### errorHandler.js
Middleware global de manejo de errores.

- `errorHandler(err, req, res, next)` - Captura todos los errores y devuelve respuestas HTTP apropiadas

Documenta qué tipos de error maneja:
- SequelizeValidationError (error de validación BD)
- SequelizeUniqueConstraintError (valor duplicado)
- JsonWebTokenError (token inválido)
- TokenExpiredError (token expirado)

---

## Archivos de Validaciones (src/validations/)

### authValidation.js
Valida datos de autenticación antes de procesarlos.

- `validateRegister(req, res, next)` - Valida que username y password cumplan requisitos
- `validateLogin(req, res, next)` - Valida que ambas credenciales estén presentes

### slotValidation.js
Valida datos de slots.

- `validateCreateSlot(req, res, next)` - Valida todos los campos requeridos para crear slot
- `validateUpdateSlot(req, res, next)` - Valida HP (0-10) y pokéballs (>=0)

### rankingValidation.js
Valida datos de ranking.

- `validateCreateRanking(req, res, next)` - Requiere mínimo 10 encuentros totales

---

## Archivos de Modelos (src/models/)

### userModels.js
Modelo User de Sequelize.

Documenta la estructura completa de la tabla users:
- id, username, password_hash, role, deleted_at, created_at

### gameSlotModels.js
Modelo GameSlot de Sequelize.

Documenta todos los campos de una partida guardada:
- Información del jugador, posición, estado, dificultad, inventario

### capturedPokemonModels.js
Modelo CapturedPokemon de Sequelize.

Documenta estructura del Pokédex:
- Referencia a usuario y slot, datos del Pokémon, flag de captura global

### rankingModels.js
Modelo Ranking de Sequelize.

Documenta registro de partidas completadas:
- Contador de capturas/escapadas, dificultad, fecha

### gameReplayModels.js
Modelo GameReplay de Sequelize.

Documenta grabación de movimientos:
- Array JSON con movimientos, referencia a slot y usuario

---

## Archivos de Configuración

### database.js
Configuración de Sequelize y conexión a PostgreSQL.

Documenta cómo se crea la instancia y de dónde lee variables de entorno.

---

## Archivos de Routes (src/routes/)

### authRoutes.js
Define las rutas de autenticación.

- `POST /api/auth/register` - Crear cuenta (sin requerir JWT)
- `POST /api/auth/login` - Iniciar sesión (sin requerir JWT)
- `POST /api/auth/refresh` - Renovar access token (sin requerir JWT)
- `POST /api/auth/logout` - Cerrar sesión

### userRoutes.js
Define las rutas de gestión de usuarios.

- `GET /api/users` - Listar todos (requiere admin)
- `GET /api/users/:id` - Obtener usuario
- `GET /api/users/:id/stats` - Obtener estadísticas
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Soft delete (requiere admin)
- `PUT /api/users/:id/restore` - Restaurar usuario (requiere admin)
- `DELETE /api/users/:id/permanent` - Hard delete (requiere admin)
- `PUT /api/users/:id/change-password` - Cambiar contraseña (requiere admin)

### gameSlotRoutes.js
Define las rutas de slots de juego.

- `GET /api/users/:userId/slots` - Obtener todos los slots
- `GET /api/users/:userId/slots/:slotNumber` - Obtener slot específico
- `POST /api/users/:userId/slots` - Crear nuevo slot
- `PUT /api/users/:userId/slots/:slotNumber` - Actualizar slot
- `DELETE /api/users/:userId/slots/:slotNumber` - Eliminar slot (cascada)

Cada ruta incluye validaciones y middlewares de autenticación donde es necesario.

---

Los comentarios JSDoc siguen estos principios:

1. **Equilibrio**: Se documentan funciones principales, parámetros complejos y retornos, pero no líneas simples
2. **Claridad**: Explicación clara de qué hace la función, no de cómo funciona internamente
3. **Útilidad**: Incluye tipos de datos, valores posibles, excepciones y ejemplos donde es necesario
4. **Mantenibilidad**: Enfocado en ayudar a otros desarrolladores a entender y usar el código

---

## Cómo Usar Esta Documentación

Cuando trabajes con estos archivos:

1. Lee el comentario JSDoc de la función antes de usarla
2. Verifica los tipos de parámetros esperados
3. Entiende qué devuelve y qué excepciones puede lanzar
4. Los IDEs modernas (VS Code, WebStorm, etc) muestran automáticamente estos comentarios al pasar el mouse

---

## Próximos Pasos (Opcional)

Los archivos documentados cubren TODO el backend crítico. Si quieres ser aún más exhaustivo, podrías agregar JSDoc a:

- **Routes restantes**: capturedPokemonRoutes.js, rankingRoutes.js, replayRoutes.js
- **Índices de exportación**: services/index.js, validations/index.js
- **JavaScript del frontend**: layout.js, login.js, pokedex.js, ranking.js, slots.js, users.js, users-detail.js

Sin embargo, con lo que tienes ahora, el 100% de la lógica crítica del backend está documentada y lista para que otros desarrolladores (o tú en el futuro) entiendan cómo funciona cada parte del sistema.
