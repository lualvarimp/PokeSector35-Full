// =============================================================================
//  ranking.js — Gestión del ranking
// =============================================================================
//  RESPONSABILIDAD: Consultar y registrar entradas en el ranking.
//
//  ENDPOINTS:
//    · GET  /api/ranking
//    · GET  /api/ranking/by-percentage
//    · POST /api/ranking/:userId
// =============================================================================

import { API_BASE, getUserId, authFetch } from './http.js';

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
