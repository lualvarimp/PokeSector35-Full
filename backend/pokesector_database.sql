-- ============================================================================
-- POKÉSECTOR 35 — SCRIPT SQL PARA POSTGRESQL (VERSIÓN FINAL)
-- ============================================================================
-- Este archivo crea todas las tablas necesarias para el backend.
-- Incluye borrado lógico (soft delete) de usuarios.
-- ============================================================================

-- Eliminar tablas si existen (útil para limpiar la BD durante desarrollo)
DROP TABLE IF EXISTS captured_pokemon CASCADE;
DROP TABLE IF EXISTS ranking CASCADE;
DROP TABLE IF EXISTS game_slots CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- TABLA 1: USERS
-- ============================================================================
-- Almacena los jugadores registrados del sistema.
-- username es único porque actúa como identificador.
-- role: 'user' para jugadores normales, 'admin' para administradores.
-- deleted_at: NULL si usuario estáactivo. Fecha si esá eliminado (borrado lógico).

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA 2: GAME_SLOTS
-- ============================================================================
-- Almacena las partidas guardadas de cada usuario (máximo 3 slots por usuario).
-- Solo los usuarios REGISTRADOS pueden guardar partidas aquí.
-- Los anónimos guardan en localStorage (NO en BD).

CREATE TABLE game_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number IN (1, 2, 3)),
    explorer VARCHAR(50) NOT NULL,
    explorer_name VARCHAR(30),
    color VARCHAR(7) NOT NULL,
    difficulty_id VARCHAR(20) NOT NULL,
    hp INTEGER NOT NULL DEFAULT 10,
    pokeball INTEGER NOT NULL DEFAULT 20,
    position_r INTEGER NOT NULL DEFAULT 0,
    position_c INTEGER NOT NULL DEFAULT 0,
    is_game_over BOOLEAN NOT NULL DEFAULT FALSE,
    is_goal BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, slot_number)
);

-- ============================================================================
-- TABLA 3: CAPTURED_POKEMON
-- ============================================================================
-- Almacena cada captura individual realizada por el usuario registrado.


CREATE TABLE captured_pokemon (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES game_slots(id) ON DELETE CASCADE,
    pokemon_id INTEGER NOT NULL,
    pokemon_name VARCHAR(50) NOT NULL,
    captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA 4: RANKING
-- ============================================================================
-- Almacena UNA entrada por partida completada (al llegar a meta o perder).

CREATE TABLE ranking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    captured_count INTEGER NOT NULL,
    escaped_count INTEGER NOT NULL,
    difficulty_id VARCHAR(20) NOT NULL,
    explorer_name VARCHAR(12),
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA 5: REFRESH_TOKENS
-- ============================================================================
-- Almacena los refresh tokens para renovar access tokens.

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ============================================================================
-- TABLA 6: GAME_REPLAY
-- ============================================================================
-- Almacena el replay completo de una partida completada (array de movimientos).
-- Los movimientos se recopilan en localStorage mientras se juega.
-- Al terminar la partida, se guarda el array completo de movimientos aquí.
-- Útil para análisis de datos, mapas de calor y mejora de mapas.

CREATE TABLE game_replay (
    id SERIAL PRIMARY KEY,
    slot_id INTEGER REFERENCES game_slots(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movements JSON NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_replay_user_id ON game_replay(user_id);
CREATE INDEX idx_game_replay_slot_id ON game_replay(slot_id);

-- ============================================================================
-- VIEW: RANKING_VIEW
-- ============================================================================
-- Vista que combina datos de ranking + usuarios para mostrar el ranking.
-- Muestra: usuario, pokémon capturados, pokémon escapados, dificultad y fecha.
-- Se usa para mostrar el ranking en la pantalla del juego.
-- El porcentaje de captura se calcula en el backend (JavaScript), no aquí.

-- Para el proyecto con React: 
-- Más Pokémon capturados por dificultad
-- Mejor % captura/encuentros por dificultad (mínimo de 10 encuentro por partida)

CREATE VIEW ranking_view AS
SELECT 
    r.id,
    r.user_id,
    u.username,
    r.captured_count,
    r.escaped_count,
    r.difficulty_id,
    r.completed_at
FROM ranking r
JOIN users u ON r.user_id = u.id
WHERE u.deleted_at IS NULL
  AND (r.captured_count + r.escaped_count) >= 10
ORDER BY r.difficulty_id, r.captured_count DESC;