// =============================================================================
//  end-menu.js — Menú de fin de partida (game-over y meta)
// =============================================================================
//  RESPONSABILIDAD: Gestionar el estado, cursor y acciones del menú que
//  aparece tanto al perder (game-over) como al ganar (goal). Ambos menús
//  comparten la misma lógica de cursor y las mismas acciones base.
//
//  FUNCIONES EXPORTADAS:
//    · isEndMenuOpen()             — true si algún menú de fin está activo
//    · resetEndMenu()              — resetea estado + DOM del menú
//    · openGameOverMenu()          — activa el menú de game-over
//    · openGoalMenu()              — activa el menú de meta
//    · handleEndMenuNav(action)    — navega/ejecuta opciones del menú activo
// =============================================================================

import { gameState }               from './game-state.js';
import { clickSound }              from './sounds.js';
import { restartFromEndScreen, showMenu } from './menu.js';
import * as api                    from '../services/apiService.js';

// ─── Estado interno ──────────────────────────────────────────────────────────
let endMenuActive  = false;   // true cuando el menú está visible
let endMenuIndex   = 0;       // opción resaltada actualmente
let endMenuContext = null;    // 'gameover' | 'goal'

export function isEndMenuOpen() { return endMenuActive; }

export function resetEndMenu() {
    endMenuActive  = false;
    endMenuIndex   = 0;
    endMenuContext = null;
    const menu   = document.getElementById('gameover-menu');
    const prompt = document.querySelector('.game-over-prompt');
    const img    = document.querySelector('.game-over-screen img');
    if (menu)   menu.classList.add('hidden');
    if (prompt) prompt.classList.remove('hidden');
    if (img)    img.classList.remove('hidden');
}

// ─── Cursor compartido ──────────────────────────────────────────────────────
function setEndMenuCursor(menuId, index) {
    endMenuIndex = index;
    const options = [...document.querySelectorAll(`#${menuId} [data-option]`)]
        .filter(el => el.style.display !== 'none');
    options.forEach(el => {
        const cursor = el.querySelector('.end-cursor');
        if (cursor) cursor.style.visibility = 'hidden';
    });
    const active = options[index];
    if (active) {
        const cursor = active.querySelector('.end-cursor');
        if (cursor) cursor.style.visibility = 'visible';
    }
}

// ─── Acciones de las opciones ───────────────────────────────────────────────
function doRestart() {
    restartFromEndScreen();
    endMenuActive = false;
}

function doGoToMenu() {
    localStorage.removeItem('pokesector_save');
    gameState.isGoal     = false;
    gameState.isGameOver = false;
    resetEndMenu();
    ['.game-over-screen', '.goal-screen', '.results-screen'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('hidden');
    });
    showMenu();
}

function doLogout() {
    localStorage.removeItem('pokesector_save');
    gameState.isGoal        = false;
    gameState.isGameOver    = false;
    gameState.isResultsOpen = false;
    resetEndMenu();
    api.logout();
    ['.game-over-screen', '.goal-screen', '.results-screen', '.menu-screen'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('hidden');
    });
    const homeStart     = document.querySelector('.home-start');
    const animationHome = document.querySelector('.animation-home');
    const homeScreen    = document.querySelector('.home-screen');
    if (animationHome) { animationHome.classList.add('hidden'); animationHome.style.animation = ''; animationHome.style.transform = ''; }
    if (homeStart)  homeStart.classList.remove('hidden');
    if (homeScreen) homeScreen.classList.remove('hidden');
    gameState.isIntro = false;
}

// ─── Abrir menús ─────────────────────────────────────────────────────────────
export function openGameOverMenu() {
    const menu   = document.getElementById('gameover-menu');
    const prompt = document.querySelector('.game-over-prompt');
    const img    = document.querySelector('.game-over-screen img');

    if (!menu) return;

    if (prompt) prompt.classList.add('hidden');
    if (img)    img.classList.add('hidden');
    menu.classList.remove('hidden');

    // Ocultar "Cerrar sesión" si el usuario no está logueado
    const logoutOptionGO = menu.querySelector('[data-option="2"]');
    if (logoutOptionGO) logoutOptionGO.style.display = api.isLoggedIn() ? '' : 'none';

    endMenuActive  = true;
    endMenuContext = 'gameover';
    setEndMenuCursor('gameover-menu', 0);
}

export function openGoalMenu() {
    // Ocultar "Cerrar sesión" si el usuario no está logueado
    const logoutOptionGoal = document.querySelector('#goal-menu [data-option="3"]');
    if (logoutOptionGoal) logoutOptionGoal.style.display = api.isLoggedIn() ? '' : 'none';

    endMenuActive  = true;
    endMenuContext = 'goal';
    setEndMenuCursor('goal-menu', 0);
}

// ─── Navegación del menú activo ─────────────────────────────────────────────
export function handleEndMenuNav(action) {
    if (!endMenuActive) return;

    const menuId      = endMenuContext === 'gameover' ? 'gameover-menu' : 'goal-menu';
    const optionCount = [...document.querySelectorAll(`#${menuId} [data-option]`)]
        .filter(el => el.style.display !== 'none').length;

    if (action === 'pressUp') {
        clickSound.currentTime = 0;
        clickSound.play();
        setEndMenuCursor(menuId, (endMenuIndex - 1 + optionCount) % optionCount);
        return;
    }

    if (action === 'pressDown') {
        clickSound.currentTime = 0;
        clickSound.play();
        setEndMenuCursor(menuId, (endMenuIndex + 1) % optionCount);
        return;
    }

    if (action === 'pressA' || action === 'pressStart') {
        clickSound.currentTime = 0;
        clickSound.play();

        // Obtenemos solo las opciones visibles y resolvemos la acción por data-option
        const visibleOptions = [...document.querySelectorAll(`#${menuId} [data-option]`)]
            .filter(el => el.style.display !== 'none');
        const selectedOption = visibleOptions[endMenuIndex];
        const optionKey = selectedOption ? selectedOption.dataset.option : null;

        if (endMenuContext === 'gameover') {
            // data-option: 0=Jugar de nuevo, 1=Volver al menú, 2=Cerrar sesión
            if (optionKey === '0') doRestart();
            if (optionKey === '1') doGoToMenu();
            if (optionKey === '2') doLogout();
        } else {
            // data-option: 0=Jugar de nuevo, 1=Ver resultados, 2=Volver al menú, 3=Cerrar sesión
            if (optionKey === '0') doRestart();
            if (optionKey === '1') {
                endMenuActive = false;
                import('./results-screen.js').then(m => m.showResultsScreen());
            }
            if (optionKey === '2') doGoToMenu();
            if (optionKey === '3') doLogout();
        }
    }
}