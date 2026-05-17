# Backend - PokéSector 35

Servidor Express.js que expone una API REST completa para el juego, con autenticación JWT, panel administrativo SSR y persistencia en PostgreSQL.

## Estructura

```
backend/src/
├── config/               # Configuración
├── controllers/          # Lógica HTTP
├── models/               # ORM Sequelize
├── routes/               # Definición endpoints
├── services/             # Lógica de negocio
├── validations/          # Validaciones entrada
├── middlewares/          # Middleware global
├── views/                # Templates Pug (Admin)
└── index.js              # Punto entrada
```

## Flujo de una Solicitud

```
POST /api/slots/1/capture

    ⬇

authMiddleware
├─ Extrae JWT del header
├─ Verifica firma
└─ Asigna req.user

    ⬇

gameSlotRoutes (matching)
├─ Define la ruta
└─ Llama gameSlotController.capture()

    ⬇

gameSlotController.capture(req, res)
├─ Extrae datos (req.body, req.params)
├─ Valida entrada (slotValidation)
└─ Llama slotService.capturePokemon()

    ⬇

slotService.capturePokemon()
├─ Lógica de negocio
├─ Interactúa con modelos
└─ Retorna resultado

    ⬇

gameSlotController
├─ Prepara respuesta
└─ res.status(200).json(...)
```

## Controllers

Cada controlador es responsable de:
1. Extraer y validar entrada
2. Llamar servicios
3. Formatear respuesta

### authController
- `register(req, res)` - POST /api/auth/register
- `login(req, res)` - POST /api/auth/login
- `refreshToken(req, res)` - POST /api/auth/refresh

### userController
- `getUser(req, res)` - GET /api/users/:id
- `getAllUsers(req, res)` - GET /api/users
- `updateUser(req, res)` - PUT /api/users/:id
- `deleteUser(req, res)` - DELETE /api/users/:id

### gameSlotController
- `getSlots(req, res)` - GET /api/slots/:userId
- `getSlotById(req, res)` - GET /api/slots/:id
- `createSlot(req, res)` - POST /api/slots
- `updateSlot(req, res)` - PUT /api/slots/:id
- `capturePokemon(req, res)` - POST /api/slots/:id/capture
- `finishSlot(req, res)` - POST /api/slots/:id/finish
- `deleteSlot(req, res)` - DELETE /api/slots/:id

### rankingController
- `getRanking(req, res)` - GET /api/ranking?difficulty=normal

### replayController
- `getReplay(req, res)` - GET /api/slots/:id/replay
- `saveReplay(req, res)` - POST /api/slots/:id/replay

### capturedPokemonController
- `getPokedex(req, res)` - GET /api/pokedex/:userId/:slot

## Services

Contienen la lógica de negocio, separada de HTTP.

### authService
```javascript
// Registra usuario con bcrypt + genera JWT
registerUser(username, password)
// Busca usuario y verifica contraseña
loginUser(username, password)
// Genera access_token (1h)
generateAccessToken(user)
// Genera refresh_token (7d) y lo almacena en DB
generateRefreshToken(user)
// Renueva access_token usando refresh_token
refreshAccessToken(refreshToken)
```

### userService
```javascript
// Busca usuario por ID
getUserById(userId)
// Obtiene todos los usuarios
getAllUsers()
// Actualiza datos del usuario
updateUser(userId, data)
// Elimina usuario y todas sus relaciones
deleteUser(userId)
```

### slotService
```javascript
// Obtiene todos los slots de un usuario
getSlotsByUserId(userId)
// Obtiene un slot específico
getSlotById(slotId)
// Crea nuevo slot (máx 3 por usuario)
createSlot(userId, slotData)
// Actualiza slot
updateSlot(slotId, data)
// Captura Pokémon en el slot
capturePokemon(slotId, pokemonId)
// Finaliza la partida y calcula ranking
finishSlot(slotId)
// Elimina slot
deleteSlot(slotId)
```

### rankingService
```javascript
// Obtiene ranking global por dificultad
getRanking(difficulty)
// Calcula/actualiza ranking del usuario después de terminar partida
updateRanking(userId, slotId)
```

### replayService
```javascript
// Obtiene historial de movimientos
getReplay(slotId)
// Almacena movimiento en el historial
addMove(slotId, move)
// Limpia historial
clearReplay(slotId)
```

## Models (Sequelize ORM)

Mapeos automáticos entre tablas SQL y objetos JavaScript.

### User
```javascript
{
  id: Integer (PK),
  username: String,
  password: String (bcrypt),
  role: Enum('user', 'admin'),
  created_at: DateTime,
  updated_at: DateTime
}
```
**Relaciones**: hasMany(GameSlot), hasMany(RefreshToken)

### GameSlot
```javascript
{
  id: Integer (PK),
  user_id: Integer (FK),
  slot_number: Integer (1-3),
  explorer: String,
  explorer_name: String,
  color: String (hex),
  difficulty: Enum('easy', 'normal', 'hard'),
  pokemon_encountered: Integer,
  pokemon_captured: Integer,
  is_finished: Boolean,
  score: Integer,
  started_at: DateTime,
  finished_at: DateTime,
  created_at: DateTime
}
```
**Relaciones**: belongsTo(User), hasMany(CapturedPokemon), hasOne(GameReplay)

### CapturedPokemon
```javascript
{
  id: Integer (PK),
  slot_id: Integer (FK),
  pokemon_id: Integer,
  pokemon_name: String,
  captured_at: DateTime
}
```
**Relaciones**: belongsTo(GameSlot)

### GameReplay
```javascript
{
  id: Integer (PK),
  slot_id: Integer (FK),
  moves: Array (JSON),
  created_at: DateTime
}
```
**Relaciones**: belongsTo(GameSlot)

### Ranking
```javascript
{
  id: Integer (PK),
  user_id: Integer (FK),
  difficulty: Enum('easy', 'normal', 'hard'),
  best_score: Integer,
  games_completed: Integer,
  ranking_position: Integer,
  created_at: DateTime,
  updated_at: DateTime
}
```

### RefreshToken
```javascript
{
  id: Integer (PK),
  user_id: Integer (FK),
  token: String,
  expires_at: DateTime,
  created_at: DateTime
}
```
**Relaciones**: belongsTo(User)

## Middlewares

### authMiddleware
Verifica JWT en header `Authorization: Bearer {token}`. Si es válido, asigna `req.user`.

```javascript
import { authMiddleware } from './middlewares';

// Usar en rutas protegidas
router.get('/protected', authMiddleware, controller.action);
```

### errorHandler
Captura errores globales y devuelve JSON consistente.

```javascript
// Errores automáticos convertidos a JSON
throw new Error('Usuario no encontrado'); // 500
res.status(404).json({ error: 'Recurso no encontrado' }); // 404
```

### rateLimitMiddleware
Limita intentos de login/registro para prevenir fuerza bruta.

```javascript
// 5 intentos fallidos = bloqueo temporal
incrementLoginAttempts(req);
getLoginAttemptsRemaining(req); // { remaining: 3, resetTime: ... }
```

## Validaciones

Antes de procesar datos, se validan en `services` y `validations/`.

### Validaciones de Username
- No puede ser vacío
- Min 3 caracteres, máx 15
- No puede contener SQL injection
- No puede contener URLs
- No puede contener spam conocido

### Validaciones de Password
- Mín 6 caracteres
- No puede ser contraseña común ('123456', 'password', etc.)

### Validaciones de Movimiento
- Debe ser: 'up', 'down', 'left', 'right'
- Posición debe estar dentro del mapa (5x7)

---

## Documentación API

La especificación OpenAPI 3.0 se genera automáticamente en:
- **Interfaz interactiva**: http://localhost:3000/api-docs
- **JSON raw**: http://localhost:3000/api-docs/swagger.json

Los JSDoc en archivos de rutas se usan para generar la documentación.

---

## Variables de Entorno

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

```env
# Base de datos
DB_HOST=db
DB_PORT=5432
DB_NAME=pokesector
DB_USER=pokesector_user
DB_PASSWORD=pokesector_pass

# JWT
JWT_SECRET=tu_secreto_muy_largo_aqui_cambio_en_produccion
JWT_REFRESH_SECRET=otro_secreto_diferente_cambio_en_produccion
JWT_EXPIRY=1h
REFRESH_EXPIRY=7d

# Servidor
PORT=3000
NODE_ENV=development
```

---

## Desarrollo

### Agregar nuevo endpoint

1. Crear función en `controllers/`
2. Crear ruta en `routes/`
3. Agregar validación en `validations/` si es necesario
4. Agregar lógica de negocio en `services/`
5. Agregar JSDoc para Swagger
6. Probar con Postman o curl

### Ejemplo: POST /api/test

**1. testController.js**
```javascript
export async function testAction(req, res) {
  res.status(200).json({ message: 'OK' });
}
```

**2. testRoutes.js**
```javascript
/**
 * @swagger
 * /api/test:
 *   post:
 *     summary: Endpoint de prueba
 *     responses:
 *       200:
 *         description: Test exitoso
 */
router.post('/', testAction);
```

**3. Agregar en routes/index.js**
```javascript
import testRoutes from './testRoutes.js';
router.use('/test', testRoutes);
```

---

## Testing

Usar curl o Postman para probar endpoints:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Ash","password":"pikachu123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Ash","password":"pikachu123"}'

# Obtener usuario (requiere JWT)
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer {access_token}"
```

---

**Próximo**: [API.md](./API.md) - Referencia completa de endpoints
