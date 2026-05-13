// =============================================================================
//  menu-account.js — Cuenta: registro, login, logout, borrar cuenta
// =============================================================================
//  RESPONSABILIDAD: Gestionar toda la lógica de cuenta del usuario:
//  registro, login, logout y borrado de cuenta. Incluye los prompts
//  y alerts de interacción con el usuario.
//
//  REGISTRA HANDLERS PARA:
//    · 'account' — vista de gestión de cuenta
// =============================================================================

import { gameState, saveGame, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';
import * as api from '../services/apiService.js';
import {
    showView, moveCursorUp, moveCursorDown, playClick,
    getCursorIndex, syncMenuVisibility, registerHandler,
} from './menu-nav.js';

// ── Registrar handler ────────────────────────────────────────────────────────
registerHandler('account', handleAccount);

// =============================================================================
//  VISTA: CUENTA
// =============================================================================
function handleAccount(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-account .menu-list');
        const items    = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[getCursorIndex()]?.dataset.account;

        switch (selected) {
            case 'login':    doLogin();           break;
            case 'logout':   onLogout();          break;
            case 'register': doRegister();        break;
            case 'delete':   askDeleteConfirm();  break;
            case 'back':     showView('main');    break;
        }
    }
}

// =============================================================================
//  REGISTRO
// =============================================================================
async function doRegister() {
    let explorer = prompt('TU NOMBRE DE EXPLORADOR\n(Máx. 12 caracteres. Aparecerá en el juego)', 'Ash');
    if (explorer === null) return;
    if (explorer.trim() === '') explorer = 'Ash';
    explorer = explorer.trim().substring(0, 12);

    let username = prompt('TU NOMBRE/ID DE USUARIO\n(Único, 3-15 caracteres)', '');
    if (!username || username.trim() === '') return;
    username = username.trim().substring(0, 15);

    let password = prompt('TU CONTRASEÑA DE USUARIO\n(Mínimo 6 caracteres)', '');
    if (!password || password.trim() === '') return;

    let password2 = prompt('REPITE LA CONTRASEÑA', '');
    if (password2 === null) return;
    if (password !== password2) {
        alert('Las contraseñas no coinciden.\nVuelve a intentarlo.');
        return;
    }

    try {
        await api.register(username, password);
        alert(`¡Bienvenido/a, ${explorer}!\n\n¡Gracias por registrarte en PokéSector 35!\nKanto te necesita...\n\n¡Buena suerte, explorador/a!`);

        gameState.playerName = sanitizeExplorerName(explorer);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);

        updateExplorerHUD();

        saveGame();
        syncMenuVisibility();
        showView('main');
    } catch (error) {
        alert('Error al registrar: ' + error.message);
    }
}

// =============================================================================
//  LOGIN
// =============================================================================
async function doLogin() {
    let username = prompt('Nombre de usuario:', '');
    if (!username || username.trim() === '') return;

    let password = prompt('Contraseña:', '');
    if (!password || password.trim() === '') return;

    try {
        await api.login(username, password);
        alert(`¡Bienvenido de vuelta, ${username}!`);

        // Cargar el explorer_name desde la BD (slot más reciente)
        let explorerName = '';
        try {
            const slots = await api.getSlots();
            if (slots && slots.length > 0) {
                const sorted = slots.sort((a, b) => b.slot_number - a.slot_number);
                explorerName = sorted.find(s => s.explorer_name)?.explorer_name || '';
            }
        } catch (e) {
            // Si falla la llamada, usar el localStorage como fallback
        }

        // Fallback: localStorage (por si no hay slots todavía)
        if (!explorerName) {
            explorerName = localStorage.getItem('pokesector_explorer_name') || '';
        }

        gameState.playerName = sanitizeExplorerName(explorerName);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);

        updateExplorerHUD();
        syncMenuVisibility();
        showView('main');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// =============================================================================
//  LOGOUT
// =============================================================================
export function onLogout() {
    api.logout();
    gameState.playerName = 'Ash';
    gameState.slotNumber = null;
    gameState.slotDbId   = null;
    localStorage.removeItem('pokesector_explorer_name');
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_global');
    updateExplorerHUD();
    syncMenuVisibility();
    showView('main');
}

// =============================================================================
//  BORRAR CUENTA
// =============================================================================
async function askDeleteConfirm() {
    const aviso1 = confirm(
        '⚠️ BORRAR CUENTA\n\n' +
        'Estás a punto de borrar tu cuenta permanentemente.\n\n' +
        'Se eliminarán:\n' +
        '  · Tu cuenta de usuario\n' +
        '  · Todos tus slots de partida\n' +
        '  · Tu Pokédex completa\n' +
        '  · Tu historial de ranking\n\n' +
        'Esta acción NO se puede deshacer.\n\n' +
        '¿Quieres continuar?'
    );
    if (!aviso1) return;

    const aviso2 = confirm(
        '🚨 ÚLTIMA ADVERTENCIA\n\n' +
        'Si confirmas, todos tus datos desaparecerán para siempre.\n' +
        'No habrá forma de recuperarlos.\n\n' +
        '¿Estás completamente seguro/a de que quieres borrar tu cuenta?'
    );
    if (!aviso2) return;

    try {
        await api.deleteAccount();
    } catch (e) {
        console.warn('Error al borrar cuenta en servidor:', e.message);
    }

    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_global');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_explorer_name');
    api.logout();

    gameState.playerName  = '';
    gameState.slotNumber  = null;
    gameState.slotDbId    = null;

    alert('Tu cuenta y todos tus datos han sido eliminados.');
    syncMenuVisibility();
    showView('main');
}
