// =============================================================================
//  slots.js — Gestión de slots de partida
// =============================================================================
//  RESPONSABILIDAD: CRUD de los slots de guardado del usuario.
//
//  ENDPOINTS:
//    · GET    /api/users/:id/slots
//    · GET    /api/users/:id/slots/:number
//    · POST   /api/users/:id/slots
//    · PUT    /api/users/:id/slots/:number
//    · DELETE /api/users/:id/slots/:number
// =============================================================================

import { API_BASE, getUserId, authFetch } from './http.js';

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
