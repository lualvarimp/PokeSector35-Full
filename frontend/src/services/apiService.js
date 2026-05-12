// =============================================================================
//  apiService.js — Comunicación con el backend
// =============================================================================
//  Centraliza todas las llamadas HTTP al backend.
//  Gestiona tokens JWT en localStorage y los inyecta automáticamente.
// =============================================================================

const API_BASE = '/api';

// ─── Token management ────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('pokesector_token');
}

function getRefreshToken() {
  return localStorage.getItem('pokesector_refresh_token');
}

function getUserId() {
  return localStorage.getItem('pokesector_user_id');
}

// Decodifica el payload del JWT sin verificar firma (solo para leer username del token)
// El JWT tiene formato header.payload.signature, base64-url encoded.
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    return JSON.parse(atob(padded));
  } catch (e) {
    return null;
  }
}

// Devuelve el username del usuario logueado (privado, solo uso interno)
// Se usa para filtrarlo y evitar que aparezca como nombre de explorador.
// Si no está en localStorage (sesión antigua), lo extrae del JWT.
function getUsername() {
  let stored = localStorage.getItem('pokesector_username');
  if (stored && stored.trim() !== '') return stored;

  // Fallback: extraer del JWT si la sesión es antigua (anterior al fix)
  const token = getToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && payload.username) {
      localStorage.setItem('pokesector_username', payload.username);
      return payload.username;
    }
  }
  return '';
}

function saveSession(data) {
  localStorage.setItem('pokesector_token', data.access_token);
  localStorage.setItem('pokesector_refresh_token', data.refresh_token);
  localStorage.setItem('pokesector_user_id', String(data.user_id));
  localStorage.setItem('pokesector_role', data.role || 'user');
  if (data.username) {
    localStorage.setItem('pokesector_username', data.username);
  }
}

function clearSession() {
  localStorage.removeItem('pokesector_token');
  localStorage.removeItem('pokesector_refresh_token');
  localStorage.removeItem('pokesector_user_id');
  localStorage.removeItem('pokesector_role');
  localStorage.removeItem('pokesector_username');
}

// ─── Fetch wrapper with auth & auto-refresh ──────────────────────────────────
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // If 401, try to refresh the token once
  if (response.status === 401 && getRefreshToken()) {
    const refreshResp = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });

    if (refreshResp.ok) {
      const refreshData = await refreshResp.json();
      localStorage.setItem('pokesector_token', refreshData.access_token);
      headers['Authorization'] = `Bearer ${refreshData.access_token}`;
      response = await fetch(url, { ...options, headers });
    } else {
      clearSession();
      throw new Error('Sesión expirada. Inicia sesión de nuevo.');
    }
  }

  return response;
}

// =============================================================================
//  AUTH
// =============================================================================
export async function register(username, password) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  let data;
  try {
    const text = await resp.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error('El servidor no devolvió una respuesta válida');
  }
  if (!resp.ok) throw new Error(data.error || 'Error al registrar');
  saveSession(data);
  return data;
}

export async function login(username, password) {
  const resp = await fetch(`${API_BASE}/auth/login-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  let data;
  try {
    const text = await resp.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    throw new Error('El servidor no devolvió una respuesta válida');
  }
  if (!resp.ok) throw new Error(data.error || 'Error al iniciar sesión');
  saveSession(data);
  return data;
}

export function logout() {
  clearSession();
}

export function isLoggedIn() {
  return !!getToken();
}

export function getCurrentUserId() {
  return getUserId();
}

// Devuelve el username del usuario logueado. Uso EXCLUSIVO para filtrarlo
// y garantizar que NUNCA aparece como nombre de explorador en pantalla.
export function getCurrentUsername() {
  return getUsername();
}

// =============================================================================
//  SLOTS
// =============================================================================
export async function getSlots() {
  const userId = getUserId();
  if (!userId) return [];
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots`);
  if (!resp.ok) return [];
  return await resp.json();
}

export async function getSlot(slotNumber) {
  const userId = getUserId();
  if (!userId) return null;
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots/${slotNumber}`);
  if (!resp.ok) return null;
  return await resp.json();
}

export async function createSlot(slotData) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots`, {
    method: 'POST',
    body: JSON.stringify(slotData),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al crear slot');
  return data;
}

export async function updateSlot(slotNumber, slotData) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots/${slotNumber}`, {
    method: 'PUT',
    body: JSON.stringify(slotData),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al actualizar slot');
  return data;
}

export async function deleteSlot(slotNumber) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots/${slotNumber}`, {
    method: 'DELETE',
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al eliminar slot');
  return data;
}

export async function deleteAccount() {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/me`, {
    method: 'DELETE',
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al borrar cuenta');
  return data;
}

// =============================================================================
//  CAPTURED POKEMON / POKEDEX
// =============================================================================
export async function getPokedex(slotId = null) {
  const userId = getUserId();
  if (!userId) return [];
  const url = slotId
    ? `${API_BASE}/users/${userId}/pokedex?slot_id=${slotId}`
    : `${API_BASE}/users/${userId}/pokedex`;
  const resp = await authFetch(url);
  if (!resp.ok) return [];
  return await resp.json();
}

export async function addCapturedPokemon(pokemonData) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/pokedex`, {
    method: 'POST',
    body: JSON.stringify(pokemonData),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al guardar pokémon');
  return data;
}

// =============================================================================
//  RANKING
// =============================================================================
export async function getRanking(difficulty = null) {
  const url = difficulty
    ? `${API_BASE}/ranking?difficulty=${difficulty}`
    : `${API_BASE}/ranking`;
  const resp = await authFetch(url);
  if (!resp.ok) return [];
  return await resp.json();
}

export async function getRankingByPercentage(difficulty = null) {
  const url = difficulty
    ? `${API_BASE}/ranking/by-percentage?difficulty=${difficulty}`
    : `${API_BASE}/ranking/by-percentage`;
  const resp = await authFetch(url);
  if (!resp.ok) return [];
  return await resp.json();
}

export async function createRanking(rankingData) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/ranking/${userId}`, {
    method: 'POST',
    body: JSON.stringify(rankingData),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al guardar ranking');
  return data;
}

// =============================================================================
//  REPLAYS
// =============================================================================
export async function createReplay(slotId, movements) {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots/${slotId}/replay`, {
    method: 'POST',
    body: JSON.stringify({ movements }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al guardar replay');
  return data;
}

export async function getReplay(slotId) {
  const userId = getUserId();
  if (!userId) return null;
  const resp = await authFetch(`${API_BASE}/users/${userId}/slots/${slotId}/replay`);
  if (!resp.ok) return null;
  return await resp.json();
}

// =============================================================================
//  SAVE GAME DATA TO BACKEND (end of game)
// =============================================================================
// Called when the player reaches the goal (success) and is logged in.
// Sends all game data to the backend in one flow.
export async function saveGameToBackend(gameState, slotNumber) {
  const userId = getUserId();
  if (!userId) return;

  try {
    // 1. Update slot with final state
    await updateSlot(slotNumber, {
      hp: gameState.hp,
      pokeball: gameState.pokeball,
      position_r: gameState.currentPosition.r,
      position_c: gameState.currentPosition.c,
      is_goal: gameState.isGoal,
      is_game_over: gameState.isGameOver,
    });

    // 2. Save captured pokemon to pokedex (global)
    for (const pokemon of gameState.pokemonCaptured) {
      try {
        await addCapturedPokemon({
          pokemon_id: pokemon.id,
          pokemon_name: pokemon.name,
          slot_id: gameState.slotDbId || null,
          is_global: true,
        });
      } catch (e) {
        // Pokemon might already exist in pokedex, ignore
        console.warn('Pokemon already in pokedex or error:', e.message);
      }
    }

    // 3. Save ranking entry
    const totalEncounters = gameState.pokemonCaptured.length + gameState.pokemonEscaped.length;
    if (totalEncounters >= 10) {
      try {
        await createRanking({
          captured_count: gameState.pokemonCaptured.length,
          escaped_count: gameState.pokemonEscaped.length,
          difficulty_id: gameState.difficultyId || 'normal',
        });
      } catch (e) {
        console.warn('Error saving ranking:', e.message);
      }
    }

    // 4. Save replay from localStorage and clear it
    const replayRaw = localStorage.getItem('pokesector_replay');
    if (replayRaw) {
      try {
        const movements = JSON.parse(replayRaw);
        // We need the slot DB id, not the slot number
        // For simplicity we'll use the slot number as slotId
        // The backend will need to resolve this
        const slot = await getSlot(slotNumber);
        if (slot && slot.id) {
          await createReplay(slot.id, movements);
        }
        localStorage.removeItem('pokesector_replay');
      } catch (e) {
        console.warn('Error saving replay:', e.message);
      }
    }

    console.log('✅ Game data saved to backend successfully');
  } catch (error) {
    console.error('❌ Error saving game to backend:', error);
  }
}