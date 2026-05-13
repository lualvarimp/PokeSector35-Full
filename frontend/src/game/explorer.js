// =============================================================================
//  explorer.js — Nombre del explorador: sanitización y HUD
// =============================================================================
//  RESPONSABILIDAD: Garantizar que el username (credencial de login) NUNCA
//  aparece en pantalla. Proporciona sanitizeExplorerName() para filtrar
//  nombres inválidos y updateExplorerHUD() para reflejarlos en el DOM.
//
//  REGLAS DE SANITIZACIÓN:
//    - Si el nombre coincide con el username del usuario logueado → 'Ash'
//    - Si el nombre está vacío, es null o undefined → 'Ash'
//    - En cualquier otro caso, se devuelve el nombre tal cual (max 12 chars)
//
//  FUNCIONES EXPORTADAS:
//    · sanitizeExplorerName(name)  — devuelve un nombre seguro para mostrar
//    · updateExplorerHUD()         — sincroniza el DOM con gameState.playerName
// =============================================================================

import { gameState } from './game-state.js';
import * as api      from '../services/apiService.js';

export function sanitizeExplorerName(name) {
    // Caso 1: nombre vacío, null o undefined
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return 'Ash';
    }

    const trimmed = name.trim();

    // Caso 2: el nombre coincide con el username privado del usuario logueado
    const currentUsername = api.getCurrentUsername();
    if (currentUsername && trimmed.toLowerCase() === currentUsername.toLowerCase()) {
        return 'Ash';
    }

    // Caso 3: nombre válido
    return trimmed.substring(0, 12);
}

// Actualiza el nombre del explorador en TODOS los lugares de la pantalla.
// Sanitiza el nombre antes de mostrarlo para garantizar que nunca aparece el username.
export function updateExplorerHUD() {
    gameState.playerName = sanitizeExplorerName(gameState.playerName);
    const explorerNames = document.querySelectorAll('.full-top h2 span');
    explorerNames.forEach(el => {
        el.textContent = `EXPLORER: ${gameState.playerName}`;
    });
}
