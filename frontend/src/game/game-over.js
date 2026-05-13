// =============================================================================
//  game-over.js — Gestión de la derrota
// =============================================================================
//  RESPONSABILIDAD: Mostrar la pantalla de Game Over cuando el jugador se
//  queda sin HP, gestionar el menú post-game-over (Jugar de nuevo / Volver
//  al menú / Cerrar sesión) y exponer la lógica compartida de menús de fin
//  de partida que también usa stats.js (meta).
//
//  FUNCIONES EXPORTADAS:
//    · triggerGameOver()          — activa la pantalla de derrota
//    · handleGameOverStart()      — START en game-over: muestra el menú
//    · handleEndMenuNav(action)   — navega el menú de fin (game-over o meta)
//    · isEndMenuOpen()            — true si algún menú de fin está activo
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → muestra/oculta pantallas sin recargar la página
//    ✅ localStorage          → persiste isGameOver para sobrevivir a F5
// =============================================================================

import { gameState, saveGame, saveGlobalData } from './game-state.js';
import { gameOverSound, melodySound, clickSound } from './sounds.js';
import { restartFromEndScreen, showMenu } from './menu.js';
import * as api from '../services/apiService.js';

// ─── Estado interno del menú de fin de partida ────────────────────────────
// Compartido entre game-over (3 opciones) y meta/stats (4 opciones).
let endMenuActive  = false;  // true cuando el menú está visible
let endMenuIndex   = 0;      // opción resaltada actualmente
let endMenuContext = null;   // 'gameover' | 'goal'

export function isEndMenuOpen() { return endMenuActive; }
export function isResultsScreenOpen() { return gameState.isResultsOpen || false; }

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

// ─── Cursor compartido ────────────────────────────────────────────────────
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

// ─── Acciones de las opciones ─────────────────────────────────────────────
function doRestart() {
    // Jugar de nuevo: mismo slot, mismas personalizaciones, directo al mapa
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

// ─── Activar menú game-over ───────────────────────────────────────────────
// Se llama desde handleGameOverStart() cuando el jugador pulsa START.
export function openGameOverMenu() {
    const menu   = document.getElementById('gameover-menu');
    const prompt = document.querySelector('.game-over-prompt');
    const img    = document.querySelector('.game-over-screen img');

    if (!menu) return;

    // Ocultar prompt e imagen, mostrar menú
    if (prompt) prompt.classList.add('hidden');
    if (img)    img.classList.add('hidden');
    menu.classList.remove('hidden');

    endMenuActive  = true;
    endMenuContext = 'gameover';
    setEndMenuCursor('gameover-menu', 0);
}

// ─── Activar menú meta ────────────────────────────────────────────────────
// Se llama desde stats.js al mostrar la goal-screen.
export function openGoalMenu() {
    endMenuActive  = true;
    endMenuContext = 'goal';
    setEndMenuCursor('goal-menu', 0);
}

// ─── Navegación del menú activo ───────────────────────────────────────────
// Recibe acciones de controls.js cuando isEndMenuOpen() es true.
export function handleEndMenuNav(action) {
    if (!endMenuActive) return;

    const menuId     = endMenuContext === 'gameover' ? 'gameover-menu' : 'goal-menu';
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
            if (endMenuIndex === 1) { endMenuActive = false; showResultsScreen(); }
            if (endMenuIndex === 2) doGoToMenu();
            if (endMenuIndex === 3) doLogout();
        }
    }
}

// ─── Pantalla de resultados ───────────────────────────────────────────────
function showResultsScreen() {
    const goalScreen    = document.querySelector('.goal-screen');
    const resultsScreen = document.querySelector('.results-screen');
    if (goalScreen)    goalScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.remove('hidden');

    const captured = gameState.pokemonCaptured || [];
    const escaped  = gameState.pokemonEscaped  || [];

    const fmt = (list) => list.length
        ? list.map((p, i) => `<p>${i + 1}. ${p.name || p}</p>`).join('')
        : '<p>Ninguno</p>';

    const container = document.getElementById('results-text');
    if (container) {
        container.innerHTML = `
            <p><strong>${captured.length} Pokémon capturados</strong></p>
            <p><strong>${escaped.length} Pokémon escapados</strong></p>
            <h2 class="results-subtitle">CAPTURADOS</h2>
            ${fmt(captured)}
            <h2 class="results-subtitle">ESCAPADOS</h2>
            ${fmt(escaped)}
            <p class="results-back">◄ B/ESC: volver</p>
        `;
    }

    // B vuelve a la goal-screen
    gameState.isResultsOpen = true;
}

export function closeResultsScreen() {
    const goalScreen    = document.querySelector('.goal-screen');
    const resultsScreen = document.querySelector('.results-screen');
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (goalScreen)    goalScreen.classList.remove('hidden');
    gameState.isResultsOpen = false;
    // Reabrir menú de meta
    openGoalMenu();
}

// ─── triggerGameOver ──────────────────────────────────────────────────────
export function triggerGameOver() {
    const gameScreen     = document.querySelector('.game-screen');
    const battleScreen   = document.querySelector('.battle-screen');
    const gameOverScreen = document.querySelector('.game-over-screen');

    if (gameScreen)     gameScreen.classList.add('hidden');
    if (battleScreen)   battleScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');

    saveGlobalData();
    gameState.isGameOver = true;
    saveGame();

    melodySound.pause();
    melodySound.currentTime = 0;
    gameOverSound.play();
}

// ─── handleGameOverStart ──────────────────────────────────────────────────
// Se llama desde controls.js cuando el jugador pulsa START/Enter.
// Cubre tanto game-over como goal-screen.
export function handleGameOverStart() {
    const gameOverScreen = document.querySelector('.game-over-screen');
    const goalScreen     = document.querySelector('.goal-screen');

    const inGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
    const inGoal     = goalScreen     && !goalScreen.classList.contains('hidden');

    if (!inGameOver && !inGoal) return false;

    if (!endMenuActive) {
        // Primera pulsación: abrir el menú correspondiente
        if (inGameOver) openGameOverMenu();
        // En goal, el menú ya está abierto desde openGoalMenu() — START actúa como A
        if (inGoal) handleEndMenuNav('pressA');
    } else {
        handleEndMenuNav('pressStart');
    }
    return true;
}