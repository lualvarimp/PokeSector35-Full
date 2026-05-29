// =============================================================================
//  http.js — Cliente HTTP base con autenticación JWT
// =============================================================================
//  RESPONSABILIDAD: Gestionar los tokens JWT en localStorage, proporcionar
//  el wrapper authFetch con auto-refresh de tokens, y exponer utilidades
//  de sesión (saveSession, clearSession, getUserId, getUsername).
//
//  Este módulo es INTERNO de la capa de servicios. Los módulos del juego
//  no lo importan directamente — usan las funciones exportadas por los
//  módulos de recurso (auth.js, slots.js, etc.) o por apiService.js.
// =============================================================================

export const API_BASE = '/pokesector35/api';

// ─── Token management ────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('pokesector_token');
}

export function getRefreshToken() {
  return localStorage.getItem('pokesector_refresh_token');
}

export function getUserId() {
  return localStorage.getItem('pokesector_user_id');
}

// Decodifica el payload del JWT sin verificar firma (solo para leer username)
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

// Devuelve el username del usuario logueado (privado, solo uso interno).
// Se usa para filtrarlo y evitar que aparezca como nombre de explorador.
// Si no está en localStorage (sesión antigua), lo extrae del JWT.
export function getUsername() {
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

// ─── Session management ──────────────────────────────────────────────────────

export function saveSession(data) {
  localStorage.setItem('pokesector_token', data.access_token);
  localStorage.setItem('pokesector_refresh_token', data.refresh_token);
  localStorage.setItem('pokesector_user_id', String(data.user_id));
  localStorage.setItem('pokesector_role', data.role || 'user');
  if (data.username) {
    localStorage.setItem('pokesector_username', data.username);
  }
}

export function clearSession() {
  localStorage.removeItem('pokesector_token');
  localStorage.removeItem('pokesector_refresh_token');
  localStorage.removeItem('pokesector_user_id');
  localStorage.removeItem('pokesector_role');
  localStorage.removeItem('pokesector_username');
}

// ─── Fetch wrapper with auth & auto-refresh ──────────────────────────────────

export async function authFetch(url, options = {}) {
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