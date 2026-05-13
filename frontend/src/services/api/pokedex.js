// =============================================================================
//  pokedex.js — Gestión de la Pokédex (pokémon capturados)
// =============================================================================
//  RESPONSABILIDAD: Consultar y registrar pokémon capturados en la BD.
//
//  ENDPOINTS:
//    · GET  /api/users/:id/pokedex?slot_id=X
//    · POST /api/users/:id/pokedex
// =============================================================================

import { API_BASE, getUserId, authFetch } from './http.js';

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
