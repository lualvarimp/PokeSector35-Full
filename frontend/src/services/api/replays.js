// =============================================================================
//  replays.js — Gestión de replays de partida
// =============================================================================
//  RESPONSABILIDAD: Guardar y recuperar los movimientos grabados de
//  una partida para poder reproducirla después.
//
//  ENDPOINTS:
//    · POST /api/users/:id/slots/:slotId/replay
//    · GET  /api/users/:id/slots/:slotId/replay
// =============================================================================

import { API_BASE, getUserId, authFetch } from './http.js';

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
