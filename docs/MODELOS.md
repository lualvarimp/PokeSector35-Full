# Modelos y Base de Datos - PokéSector 35

Esquema PostgreSQL y mapeo de modelos Sequelize ORM.

---

## Diagrama ER

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │───┬─────────────────────────────┐
│ username (UK)   │   │                             │
│ password        │   │                             │
│ role            │   │                             │
│ created_at      │   │                             │
│ updated_at      │   │                             │
└─────────────────┘   │                             │
                      │  1:N                         │
         ┌────────────┴──────────┬──────────────┐   │
         │                       │              │   │
         ▼                       ▼              ▼   │
┌──────────────────┐  ┌──────────────────┐  ┌─────┴──────────┐
│  game_slots      │  │ refresh_tokens   │  │ rankings       │
├──────────────────┤  ├──────────────────┤  ├────────────────┤
│ id (PK)          │  │ id (PK)          │  │ id (PK)        │
│ user_id (FK)     │  │ user_id (FK)     │  │ user_id (FK)   │
│ slot_number      │  │ token            │  │ difficulty     │
│ explorer         │  │ expires_at       │  │ best_score     │
│ explorer_name    │  │ created_at       │  │ games_comp.    │
│ color            │  └──────────────────┘  │ rank_position  │
│ difficulty       │                        │ created_at     │
│ pokemon_enc.     │                        │ updated_at     │
│ pokemon_cap.     │                        └────────────────┘
│ is_finished      │
│ score            │      1:N
│ started_at       ├──────┬────────────────┐
│ finished_at      │      │                │
│ created_at       │      │                │
└──────────────────┘      ▼                ▼
                   ┌──────────────────┐  ┌──────────────────┐
                   │captured_pokemon  │  │  game_replays    │
                   ├──────────────────┤  ├──────────────────┤
                   │ id (PK)          │  │ id (PK)          │
                   │ slot_id (FK)     │  │ slot_id (FK)     │
                   │ pokemon_id       │  │ moves (JSON)     │
                   │ pokemon_name     │  │ created_at       │
                   │ captured_at      │  └──────────────────┘
                   └──────────────────┘
```

---

## Tablas Detalladas

### users

Tabla de usuarios autenticados.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| id | SERIAL | PK | Identificador único |
| username | VARCHAR(15) | UNIQUE, NOT NULL | Nombre de usuario (3-15 chars) |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt |
| role | ENUM | DEFAULT 'user' | 'user' o 'admin' |
| created_at | TIMESTAMP | DEFAULT NOW | Fecha creación |
| updated_at | TIMESTAMP | DEFAULT NOW | Fecha última actualización |

**Índices**
- PK: id
- UNIQUE: username
- INDEX: role (para filtrar admins rápido)

**Relaciones**
- Tiene N `game_slots`
- Tiene N `refresh_tokens`
- Aparece en N `rankings`

---

### game_slots

Partidas guardadas de usuarios. Máx 3 por usuario (slot_number 1-3).

```sql
CREATE TABLE game_slots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_number SMALLINT NOT NULL CHECK (slot_number IN (1,2,3)),
  explorer VARCHAR(50) NOT NULL,
  explorer_name VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL,
  difficulty ENUM('easy', 'normal', 'hard') NOT NULL,
  pokemon_encountered INTEGER DEFAULT 0,
  pokemon_captured INTEGER DEFAULT 0,
  is_finished BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, slot_number)
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único |
| user_id | INTEGER | FK a users |
| slot_number | SMALLINT | 1, 2 o 3 (máx 3 slots por usuario) |
| explorer | VARCHAR(50) | Tipo explorador ('boy', 'girl', 'brock', etc) |
| explorer_name | VARCHAR(10) | Nombre personalizado (máx 10 chars) |
| color | VARCHAR(7) | Color hex (#RRGGBB) |
| difficulty | ENUM | 'easy', 'normal', 'hard' |
| pokemon_encountered | INTEGER | Cantidad de Pokémon encontrados |
| pokemon_captured | INTEGER | Cantidad capturados |
| is_finished | BOOLEAN | Si la partida terminó |
| score | INTEGER | Puntuación final |
| started_at | TIMESTAMP | Cuándo comenzó |
| finished_at | TIMESTAMP | Cuándo terminó (NULL si activa) |
| created_at | TIMESTAMP | Cuándo se creó el registro |

**Índices**
- PK: id
- FK: user_id
- UNIQUE: (user_id, slot_number) - previene duplicados
- INDEX: (user_id, is_finished) - búsquedas frecuentes

**Relaciones**
- Pertenece a 1 `user`
- Tiene N `captured_pokemon`
- Tiene 1 `game_replay` (1:1)

---

### captured_pokemon

Pokédex: registro de Pokémon capturados por usuario en cada partida.

```sql
CREATE TABLE captured_pokemon (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL REFERENCES game_slots(id) ON DELETE CASCADE,
  pokemon_id INTEGER NOT NULL,
  pokemon_name VARCHAR(50) NOT NULL,
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único |
| slot_id | INTEGER | FK a game_slots |
| pokemon_id | INTEGER | ID del Pokémon (1-151 gen 1) |
| pokemon_name | VARCHAR(50) | Nombre del Pokémon |
| captured_at | TIMESTAMP | Cuándo fue capturado |

**Índices**
- PK: id
- FK: slot_id
- INDEX: (slot_id, pokemon_id) - búsquedas Pokédex

**Relaciones**
- Pertenece a 1 `game_slot`

**Nota**: No hay constraint UNIQUE en (slot_id, pokemon_id) para permitir cambios de reglas, pero se valida en aplicación.

---

### game_replays

Historial de movimientos de una partida (para poder reproducirla).

```sql
CREATE TABLE game_replays (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL UNIQUE REFERENCES game_slots(id) ON DELETE CASCADE,
  moves JSON NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único |
| slot_id | INTEGER | FK a game_slots (1:1) |
| moves | JSON | Array de strings: ['up', 'right', 'down', 'left'] |
| created_at | TIMESTAMP | Cuándo se creó |

**Ejemplo JSON**
```json
["right", "right", "down", "left", "down", "right", "up"]
```

**Índices**
- PK: id
- FK/UNIQUE: slot_id (1:1, un replay por slot)

**Relaciones**
- Pertenece a 1 `game_slot` (relación 1:1)

---

### rankings

Posiciones en ranking global por dificultad. Se actualiza al terminar partida.

```sql
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty ENUM('easy', 'normal', 'hard') NOT NULL,
  best_score INTEGER DEFAULT 0,
  games_completed INTEGER DEFAULT 0,
  ranking_position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(user_id, difficulty)
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único |
| user_id | INTEGER | FK a users |
| difficulty | ENUM | 'easy', 'normal', 'hard' |
| best_score | INTEGER | Mejor puntuación en esa dificultad |
| games_completed | INTEGER | Cuántas partidas completó |
| ranking_position | INTEGER | Posición en ranking (1 = primero) |
| created_at | TIMESTAMP | Fecha creación |
| updated_at | TIMESTAMP | Fecha última actualización |

**Índices**
- PK: id
- FK: user_id
- UNIQUE: (user_id, difficulty) - un ranking por dificultad
- INDEX: (difficulty, ranking_position) - búsquedas frecuentes

**Relaciones**
- Pertenece a 1 `user`

**Cálculo de ranking_position**
Se actualiza cuando termina una partida:
1. Compara best_score con otros usuarios en misma dificultad
2. Ordena descendente por score
3. Asigna posición

---

### refresh_tokens

Tokens para renovar sesión (JWT rotate).

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único |
| user_id | INTEGER | FK a users |
| token | VARCHAR(500) | JWT refresh token |
| expires_at | TIMESTAMP | Cuándo expira (7 días) |
| created_at | TIMESTAMP | Cuándo se creó |

**Índices**
- PK: id
- FK: user_id
- INDEX: token - búsqueda por token
- INDEX: expires_at - cleanup de tokens expirados

**Relaciones**
- Pertenece a 1 `user`

**Ciclo de vida**
1. Se crea en login o register
2. Se almacena en BD
3. Válido 7 días
4. Cliente puede usarlo para renovar access_token
5. Al expirar, usuario debe re-autenticarse

---

## Relaciones SQL

### CASCADE Deletes

Cuando se elimina un usuario, se cascada a:
- game_slots (ON DELETE CASCADE)
- refresh_tokens (ON DELETE CASCADE)
- rankings (ON DELETE CASCADE)

Cuando se elimina un game_slot, se cascada a:
- captured_pokemon (ON DELETE CASCADE)
- game_replays (ON DELETE CASCADE)

---

## Secuencias Típicas

### Crear una Partida

1. Cliente llama POST /api/slots
2. `gameSlotController.createSlot()`
3. Valida que usuario no tenga 3 slots ya
4. `GameSlot.create({ user_id, slot_number, ... })`
5. Sequelize genera INSERT en game_slots
6. BD retorna nuevo slot con ID
7. Sequelize crea game_replay automáticamente (1:1)
8. Responde con slot

```sql
INSERT INTO game_slots (user_id, slot_number, explorer, ...)
VALUES (1, 1, 'boy', ...) RETURNING *;

INSERT INTO game_replays (slot_id, moves) VALUES (5, '[]');
```

---

### Capturar Pokémon

1. Cliente en juego encuentra un Pokémon
2. POST /api/slots/:id/capture
3. `gameSlotController.capturePokemon()`
4. `CapturedPokemon.create({ slot_id, pokemon_id, ... })`
5. UPDATE game_slots SET pokemon_captured = pokemon_captured + 1

```sql
INSERT INTO captured_pokemon (slot_id, pokemon_id, pokemon_name, ...)
VALUES (5, 25, 'Pikachu', ...) RETURNING *;

UPDATE game_slots SET pokemon_captured = 9 WHERE id = 5;
```

---

### Terminar Partida y Actualizar Ranking

1. Cliente llama POST /api/slots/:id/finish
2. `gameSlotController.finishSlot()`
3. UPDATE game_slots SET is_finished = TRUE, finished_at = NOW, score = ?
4. `rankingService.updateRanking()` calcula nueva posición
5. INSERT o UPDATE en rankings

```sql
UPDATE game_slots 
SET is_finished = TRUE, finished_at = NOW(), score = 850 
WHERE id = 5;

-- Obtener ranking
SELECT COUNT(*) + 1 as position 
FROM rankings 
WHERE difficulty = 'normal' AND best_score > 850;

-- Insertar o actualizar
INSERT INTO rankings (user_id, difficulty, best_score, games_completed)
VALUES (1, 'normal', 850, 1)
ON CONFLICT (user_id, difficulty) 
DO UPDATE SET best_score = 850, games_completed = games_completed + 1;
```

---

## Modelos Sequelize

### User Model

```javascript
const User = sequelize.define('User', {
  id: { type: INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: STRING(15), allowNull: false, unique: true },
  password: { type: STRING(255), allowNull: false },
  role: { type: ENUM('user', 'admin'), defaultValue: 'user' },
  createdAt: { type: DATE, defaultValue: NOW },
  updatedAt: { type: DATE, defaultValue: NOW }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: false
});

User.hasMany(GameSlot, { foreignKey: 'user_id' });
User.hasMany(RefreshToken, { foreignKey: 'user_id' });
```

---

## Validaciones a Nivel BD

### Constraints CHECK

```sql
-- game_slots.slot_number debe ser 1, 2 o 3
CHECK (slot_number IN (1,2,3))

-- difficulty válido
CHECK (difficulty IN ('easy', 'normal', 'hard'))
```

### Constraints UNIQUE

```sql
-- Cada usuario puede tener username único
UNIQUE(username)

-- Máx 3 slots por usuario
UNIQUE(user_id, slot_number)

-- Un ranking por dificultad por usuario
UNIQUE(user_id, difficulty)
```

---

## Performance

### Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_game_slots_user ON game_slots(user_id);
CREATE INDEX idx_captured_pokemon_slot ON captured_pokemon(slot_id);
CREATE INDEX idx_rankings_difficulty ON rankings(difficulty, ranking_position);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Búsquedas por estado
CREATE INDEX idx_game_slots_finished ON game_slots(is_finished);
CREATE INDEX idx_game_slots_user_finished ON game_slots(user_id, is_finished);
```

---

**Próximo**: [AUTENTICACION.md](./AUTENTICACION.md) para detalles de JWT y seguridad
