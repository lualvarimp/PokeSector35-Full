# 📡 API REST - PokéSector 35

Referencia completa de todos los endpoints. Accede a `http://localhost:3000/api-docs` para interfaz interactiva.

---

## Autenticación

### POST /api/auth/register
Registra nuevo usuario.

**Request**
```json
{
  "username": "Ash",
  "password": "pikachu123"
}
```

**Response** (201 Created)
```json
{
  "message": "Usuario registrado",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": 1,
  "username": "Ash",
  "role": "user"
}
```

**Validaciones**
- username: 3-15 caracteres, sin SQL/XSS
- password: mín 6 caracteres
- No permite usernames duplicados

**Errores**
- 400: Username inválido o contraseña débil
- 429: Demasiados intentos (máx 5 en 15s)

---

### POST /api/auth/login
Autentica usuario existente.

**Request**
```json
{
  "username": "Ash",
  "password": "pikachu123"
}
```

**Response** (200 OK)
```json
{
  "message": "Login exitoso",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": 1,
  "username": "Ash",
  "role": "user"
}
```

**Errores**
- 400: Usuario o contraseña inválidos
- 429: Demasiados intentos (máx 5 en 15s)

---

### POST /api/auth/refresh
Renueva access_token usando refresh_token válido.

**Request**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

**Errores**
- 401: Refresh token inválido o expirado

---

## 👤 Usuarios

### GET /api/users/:id
Obtiene datos de un usuario específico.

**Headers**
```
Authorization: Bearer {access_token}
```

**Response** (200 OK)
```json
{
  "id": 1,
  "username": "Ash",
  "role": "user",
  "created_at": "2024-05-17T10:30:00Z",
  "updated_at": "2024-05-17T10:30:00Z"
}
```

**Errores**
- 401: No autenticado
- 404: Usuario no existe

---

### GET /api/users
Obtiene listado de todos los usuarios (solo admin).

**Headers**
```
Authorization: Bearer {access_token}
```

**Query Parameters**
- `limit=10` - Máx resultados (default 50)
- `offset=0` - Paginación

**Response** (200 OK)
```json
{
  "total": 42,
  "limit": 10,
  "offset": 0,
  "users": [
    {
      "id": 1,
      "username": "Ash",
      "role": "user",
      "created_at": "2024-05-17T10:30:00Z"
    }
  ]
}
```

**Permisos**: Solo admin

---

### PUT /api/users/:id
Actualiza datos del usuario (solo su propio perfil o admin).

**Request**
```json
{
  "username": "Ash_v2"
}
```

**Response** (200 OK)
```json
{
  "message": "Usuario actualizado",
  "user": {
    "id": 1,
    "username": "Ash_v2",
    "role": "user"
  }
}
```

**Permisos**: Usuario propio o admin

---

### DELETE /api/users/:id
Elimina usuario y todos sus datos asociados (solo admin).

**Response** (200 OK)
```json
{
  "message": "Usuario eliminado"
}
```

**Efectos secundarios**
- Elimina todos los slots del usuario
- Elimina toda su Pokédex
- Elimina sus replays
- Elimina su posición en ranking

**Permisos**: Solo admin

---

## Slots (Partidas)

### GET /api/slots/:userId
Obtiene todos los slots (partidas) de un usuario.

**Response** (200 OK)
```json
{
  "total": 2,
  "slots": [
    {
      "id": 5,
      "user_id": 1,
      "slot_number": 1,
      "explorer": "boy",
      "explorer_name": "ASH",
      "color": "#019273",
      "difficulty": "normal",
      "pokemon_encountered": 12,
      "pokemon_captured": 8,
      "is_finished": false,
      "score": 450,
      "started_at": "2024-05-17T15:00:00Z",
      "finished_at": null,
      "created_at": "2024-05-17T15:00:00Z"
    }
  ]
}
```

---

### GET /api/slots/:id
Obtiene detalles de un slot específico.

**Response** (200 OK)
```json
{
  "id": 5,
  "user_id": 1,
  "slot_number": 1,
  "explorer": "boy",
  "explorer_name": "ASH",
  "color": "#019273",
  "difficulty": "normal",
  "pokemon_encountered": 12,
  "pokemon_captured": 8,
  "is_finished": false,
  "score": 450,
  "started_at": "2024-05-17T15:00:00Z",
  "created_at": "2024-05-17T15:00:00Z",
  "captured_pokemon": [
    {
      "id": 1,
      "pokemon_id": 25,
      "pokemon_name": "Pikachu",
      "captured_at": "2024-05-17T15:05:00Z"
    }
  ]
}
```

---

### POST /api/slots
Crea nuevo slot de partida (máx 3 por usuario).

**Headers**
```
Authorization: Bearer {access_token}
```

**Request**
```json
{
  "user_id": 1,
  "slot_number": 1,
  "explorer": "boy",
  "explorer_name": "ASH",
  "color": "#019273",
  "difficulty": "normal"
}
```

**Response** (201 Created)
```json
{
  "message": "Slot creado",
  "slot": {
    "id": 5,
    "user_id": 1,
    "slot_number": 1,
    "explorer": "boy",
    "explorer_name": "ASH",
    "color": "#019273",
    "difficulty": "normal",
    "pokemon_encountered": 0,
    "pokemon_captured": 0,
    "is_finished": false,
    "score": 0,
    "started_at": "2024-05-17T15:00:00Z"
  }
}
```

**Validaciones**
- Máx 3 slots por usuario
- difficulty debe ser: 'easy', 'normal', 'hard'
- explorer_name máx 10 caracteres

**Errores**
- 400: Validación fallida
- 409: Slot número ya existe para este usuario

---

### PUT /api/slots/:id
Actualiza un slot (progreso, puntuación, etc).

**Request**
```json
{
  "pokemon_encountered": 15,
  "pokemon_captured": 10,
  "score": 600
}
```

**Response** (200 OK)
```json
{
  "message": "Slot actualizado",
  "slot": { ... }
}
```

---

### POST /api/slots/:id/capture
Captura Pokémon en el slot actual.

**Request**
```json
{
  "pokemon_id": 25,
  "pokemon_name": "Pikachu"
}
```

**Response** (201 Created)
```json
{
  "message": "Pokémon capturado",
  "captured": {
    "id": 1,
    "pokemon_id": 25,
    "pokemon_name": "Pikachu",
    "captured_at": "2024-05-17T15:05:00Z"
  }
}
```

**Validaciones**
- pokemon_id debe ser válido (1-151 para Pokémon gen 1)
- No se puede capturar el mismo Pokémon dos veces en el mismo slot

**Errores**
- 400: Pokémon inválido
- 409: Pokémon ya capturado en este slot

---

### POST /api/slots/:id/finish
Finaliza la partida y calcula ranking.

**Request**
```json
{
  "final_score": 850
}
```

**Response** (200 OK)
```json
{
  "message": "Partida finalizada",
  "slot": {
    "id": 5,
    "is_finished": true,
    "score": 850,
    "finished_at": "2024-05-17T16:00:00Z"
  },
  "ranking": {
    "difficulty": "normal",
    "best_score": 850,
    "games_completed": 1,
    "ranking_position": 42
  }
}
```

**Efectos secundarios**
- Marca slot como terminado
- Crea/actualiza posición en ranking
- Guarda replay automáticamente

---

### DELETE /api/slots/:id
Elimina un slot y toda su información (Pokédex, replay).

**Response** (200 OK)
```json
{
  "message": "Slot eliminado"
}
```

**Permisos**: Usuario propietario del slot o admin

---

## Pokédex

### GET /api/pokedex/:userId/:slot
Obtiene Pokédex del usuario en un slot específico.

**Response** (200 OK)
```json
{
  "slot_id": 5,
  "total_captured": 8,
  "pokemon": [
    {
      "id": 1,
      "pokemon_id": 25,
      "pokemon_name": "Pikachu",
      "captured_at": "2024-05-17T15:05:00Z"
    },
    {
      "id": 2,
      "pokemon_id": 1,
      "pokemon_name": "Bulbasaur",
      "captured_at": "2024-05-17T15:10:00Z"
    }
  ]
}
```

---

## Replay (Historial)

### GET /api/slots/:id/replay
Obtiene el historial de movimientos de una partida.

**Response** (200 OK)
```json
{
  "slot_id": 5,
  "moves": [
    "right", "right", "down", "left", "down",
    "right", "right", "up", "left"
  ],
  "total_moves": 9,
  "created_at": "2024-05-17T15:00:00Z"
}
```

**Notas**
- Los movimientos son: 'up', 'down', 'left', 'right'
- Se graba automáticamente durante el juego

---

### POST /api/slots/:id/replay
Actualiza el historial (agregar movimiento).

**Request**
```json
{
  "move": "right"
}
```

**Response** (200 OK)
```json
{
  "message": "Movimiento registrado",
  "total_moves": 10
}
```

---

## Clasificación (Ranking)

### GET /api/ranking
Obtiene ranking global por dificultad.

**Query Parameters**
- `difficulty=normal` - 'easy', 'normal', 'hard'
- `limit=10` - Máx resultados
- `offset=0` - Paginación

**Response** (200 OK)
```json
{
  "difficulty": "normal",
  "total_users": 42,
  "ranking": [
    {
      "ranking_position": 1,
      "user_id": 5,
      "username": "Misty",
      "best_score": 1200,
      "games_completed": 8
    },
    {
      "ranking_position": 2,
      "user_id": 3,
      "username": "Brock",
      "best_score": 1150,
      "games_completed": 6
    },
    {
      "ranking_position": 3,
      "user_id": 1,
      "username": "Ash",
      "best_score": 850,
      "games_completed": 1
    }
  ]
}
```

---

## Códigos de Error

| Código | Significado | Causa |
|--------|-----------|-------|
| 400 | Bad Request | Validación fallida, datos inválidos |
| 401 | Unauthorized | Sin JWT o JWT inválido/expirado |
| 403 | Forbidden | JWT válido pero permisos insuficientes |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado o conflicto de estado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Server Error | Error interno del servidor |

**Respuesta de error**
```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "timestamp": "2024-05-17T16:00:00Z"
}
```

---

## Seguridad

### Autenticación
- Todos los endpoints que modifican datos requieren `Authorization: Bearer {token}`
- Token caduca en 15 minutos
- Usar `/api/auth/refresh` para renovar

### Rate Limiting
- Login: máx 5 intentos en 15 segundos
- Register: máx 5 intentos en 15 segundos
- API general: no limitado (por el momento)

### Validación
- Input validado en servidor (no confiar en cliente)
- SQL injection prevenida con ORM
- XSS prevenido con validación de entrada

---

## Ejemplos con cURL

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Ash",
    "password": "pikachu123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Ash",
    "password": "pikachu123"
  }'
```

### Crear slot (requiere JWT)
```bash
curl -X POST http://localhost:3000/api/slots \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "user_id": 1,
    "slot_number": 1,
    "explorer": "boy",
    "explorer_name": "ASH",
    "color": "#019273",
    "difficulty": "normal"
  }'
```

### Obtener ranking
```bash
curl -X GET 'http://localhost:3000/api/ranking?difficulty=normal&limit=10' \
  -H "Content-Type: application/json"
```

---

**Notas adicionales**: Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para flujos de datos completos.
