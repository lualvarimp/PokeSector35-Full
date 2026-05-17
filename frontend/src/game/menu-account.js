// =============================================================================
//  menu-account.js — Cuenta: registro, login, logout, borrar cuenta
// =============================================================================
//  RESPONSABILIDAD: Gestionar toda la lógica de cuenta del usuario:
//  registro, login, logout y borrado de cuenta.
//
//  REGISTRA HANDLERS PARA:
//    · 'account' — vista de gestión de cuenta
// =============================================================================

import { gameState, saveGame, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';
import * as api from '../services/apiService.js';
import {
    showView, moveCursorUp, moveCursorDown, playClick,
    getCursorIndex, syncMenuVisibility, registerHandler,
    showAlert, showConfirm,
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
    let explorer = prompt('NOMBRE DE EXPLORADOR\n(Máx. 12 caracteres. Aparecerá en el juego)', 'Ash');
    if (explorer === null) return;
    if (explorer.trim() === '') explorer = 'Ash';
    explorer = explorer.trim().substring(0, 12);

    let username = prompt('ID (NOMBRE) DE USUARIO\n(Único, 3-15 caracteres)', '');
    if (!username || username.trim() === '') return;
    username = username.trim().substring(0, 15);

    let password = prompt('CONTRASEÑA\n(Mínimo 6 caracteres)', '');
    if (!password || password.trim() === '') return;

    let password2 = prompt('REPITE LA CONTRASEÑA', '');
    if (password2 === null) return;
    if (password !== password2) {
        showAlert('Las contraseñas no coinciden.\nVuelve a intentarlo.', 'account');
        return;
    }

    try {
        await api.register(username, password);

        gameState.playerName = sanitizeExplorerName(explorer);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);
        updateExplorerHUD();
        saveGame();
        syncMenuVisibility();

        showAlert(
            '¡Bienvenido/a, ' + explorer + '!\n¡Gracias por registrarte!\nKanto te necesita...\n¡Buena suerte!',
            'main'
        );
    } catch (error) {
        showAlert('<strong>ERROR</strong><br>al registrar: ' + error.message, 'account');
    }
}

// =============================================================================
//  LOGIN
// =============================================================================
async function doLogin() {
    let username = prompt('ID (NOMBRE) DE USUARIO', '');
    if (!username || username.trim() === '') return;

    let password = prompt('CONTRASEÑA:', '');
    if (!password || password.trim() === '') return;

    try {
        await api.login(username, password);

        let explorerName = '';
        try {
            const slots = await api.getSlots();
            if (slots && slots.length > 0) {
                const sorted = slots.sort((a, b) => b.slot_number - a.slot_number);
                explorerName = sorted.find(s => s.explorer_name)?.explorer_name || '';
            }
        } catch (e) {}

        if (!explorerName) {
            explorerName = localStorage.getItem('pokesector_explorer_name') || '';
        }

        gameState.playerName = sanitizeExplorerName(explorerName);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);
        updateExplorerHUD();
        syncMenuVisibility();

        showAlert('¡Bienvenido/a de vuelta, ' + username + '!', 'main');
    } catch (error) {
        showAlert('<strong>ERROR</strong><br>' + error.message, 'account');
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
function askDeleteConfirm() {
    showConfirm(
        'BORRAR CUENTA\n\nSe eliminarán tu cuenta, slots, Pokédex y ranking.\n¿Quieres continuar?',
        () => askDeleteConfirm2()
    );
}

function askDeleteConfirm2() {
    showConfirm(
        'ÚLTIMA ADVERTENCIA\n\nTodos tus datos desaparecerán.\n¿Estás seguro/a?',
        () => doDeleteAccount()
    );
}

async function doDeleteAccount() {
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

    gameState.playerName = '';
    gameState.slotNumber = null;
    gameState.slotDbId   = null;

    syncMenuVisibility();
    showAlert('Tu cuenta y todos tus datos han sido eliminados.', 'main');
}