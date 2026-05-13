// =============================================================================
//  auth.js — Autenticación y gestión de sesión
// =============================================================================
//  RESPONSABILIDAD: Registro, login, logout y consultas de estado de sesión.
//
//  ENDPOINTS:
//    · POST /api/auth/register
//    · POST /api/auth/login-game
// =============================================================================

import { API_BASE, getToken, getUserId, getUsername, saveSession, clearSession } from './http.js';

// ─── Register ────────────────────────────────────────────────────────────────

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

// ─── Login ───────────────────────────────────────────────────────────────────

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

// ─── Logout ──────────────────────────────────────────────────────────────────

export function logout() {
  clearSession();
}

// ─── Session queries ─────────────────────────────────────────────────────────

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
