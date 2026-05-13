// =============================================================================
//  apiService.js — Fachada de la capa de servicios
// =============================================================================
//  RESPONSABILIDAD: Re-exportar todas las funciones de la API desde los
//  módulos especializados. Esto permite que los consumidores existentes
//  (game-state.js, menu.js, game-over.js, stats-pokedex.js) sigan usando
//  `import * as api from '../services/apiService.js'` sin cambios.
//
//  ESTRUCTURA INTERNA:
//    api/http.js      — Cliente HTTP base, tokens JWT, authFetch
//    api/auth.js      — Registro, login, logout, estado de sesión
//    api/slots.js     — CRUD de slots de partida
//    api/pokedex.js   — Pokédex (pokémon capturados)
//    api/ranking.js   — Ranking
//    api/replays.js   — Replays de partida
//    api/users.js     — Operaciones de usuario (borrar cuenta)
//    api/save.js      — Volcado completo de fin de partida al backend
// =============================================================================

// ── Auth & sesión ────────────────────────────────────────────────────────────
export { register, login, logout, isLoggedIn, getCurrentUserId, getCurrentUsername } from './api/auth.js';

// ── Slots ────────────────────────────────────────────────────────────────────
export { getSlots, getSlot, createSlot, updateSlot, deleteSlot } from './api/slots.js';

// ── Pokédex ──────────────────────────────────────────────────────────────────
export { getPokedex, addCapturedPokemon } from './api/pokedex.js';

// ── Ranking ──────────────────────────────────────────────────────────────────
export { getRanking, getRankingByPercentage, createRanking } from './api/ranking.js';

// ── Replays ──────────────────────────────────────────────────────────────────
export { createReplay, getReplay } from './api/replays.js';

// ── Usuario ──────────────────────────────────────────────────────────────────
export { deleteAccount } from './api/users.js';

// ── Volcado de fin de partida ────────────────────────────────────────────────
export { saveGameToBackend } from './api/save.js';
