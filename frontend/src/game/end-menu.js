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

// Resetea el estado del menú Y el DOM visual de game-over-screen.
// Se llama al iniciar nueva partida para que el próximo game over
// muestre siempre el prompt y la imagen, nunca el menú directamente.
export function resetEndMenu() {
    endMenuActive  = false;
    endMenuIndex   = 0;
    endMenuContext = null;
    // Restaurar DOM visual de game-over-screen al estado inicial
    const menu   = document.getElementById('gameover-menu');
    const prompt = document.querySelector('.game-over-prompt');
    const img    = document.querySelector('.game-over-screen img');
    if (menu)   menu.classList.add('hidden');
    if (prompt) prompt.classList.remove('hidden');
    if (img)    img.classList.remove('hidden');
}

// ─── Cursor compartido ──────────────────────────────────────────────────────
// Aplica el cursor ► a la opción activa del menú indicado por su id.
function setEndMenuCursor(menuId, index) {
    endMenuIndex = index;
    const options = document.querySelectorAll(`#${menuId} [data-option]`);
    options.forEach(el => {
        const cursor = el.querySelector('.end-cursor');
        if (cursor) cursor.style.visibility = 'hidden';
    });
    const active = document.querySelector(`#${menuId} [data-option="${index}"]`);
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

    endMenuActive  = true;
    endMenuContext = 'gameover';
    setEndMenuCursor('gameover-menu', 0);
}

export function openGoalMenu() {
    endMenuActive  = true;
    endMenuContext = 'goal';
    setEndMenuCursor('goal-menu', 0);
}

// ─── Navegación del menú activo ─────────────────────────────────────────────
// Recibe acciones de controls.js cuando isEndMenuOpen() es true.
export function handleEndMenuNav(action) {
    if (!endMenuActive) return;

    const menuId      = endMenuContext === 'gameover' ? 'gameover-menu' : 'goal-menu';
    const optionCount = document.querySelectorAll(`#${menuId} [data-option]`).length;

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

        if (endMenuContext === 'gameover') {
            // Opciones: 0=Jugar de nuevo, 1=Volver al menú, 2=Cerrar sesión
            if (endMenuIndex === 0) doRestart();
            if (endMenuIndex === 1) doGoToMenu();
            if (endMenuIndex === 2) doLogout();
        } else {
            // Opciones: 0=Jugar de nuevo, 1=Ver resultados, 2=Volver al menú, 3=Cerrar sesión
            if (endMenuIndex === 0) doRestart();
            if (endMenuIndex === 1) {
                endMenuActive = false;
                // Import dinámico para evitar circular con results-screen
                import('./results-screen.js').then(m => m.showResultsScreen());
            }
            if (endMenuIndex === 2) doGoToMenu();
            if (endMenuIndex === 3) doLogout();
        }
    }
}
