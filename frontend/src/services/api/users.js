// =============================================================================
//  users.js — Operaciones de usuario
// =============================================================================
//  RESPONSABILIDAD: Operaciones sobre el perfil del usuario actual.
//
//  ENDPOINTS:
//    · GET    /api/users/:id/stats
//    · DELETE /api/users/:id/me
// =============================================================================

import { API_BASE, getUserId, authFetch } from './http.js';

export async function getUserStats() {
  const userId = getUserId();
  if (!userId) throw new Error('No hay sesión activa');
  const resp = await authFetch(`${API_BASE}/users/${userId}/stats`);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Error al obtener estadísticas');
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