// =============================================================================
//  game-over.js — Gestión de la derrota + fachada de fin de partida
// =============================================================================
//  RESPONSABILIDAD: Activar la pantalla de Game Over cuando el jugador
//  pierde, gestionar la primera pulsación de START en pantallas de fin,
//  y re-exportar las funciones que los consumidores esperan.
//
//  MÓDULOS RELACIONADOS:
//    · end-menu.js        — Estado, cursor y navegación del menú de fin
//    · results-screen.js  — Pantalla de resultados (capturados/escapados)
//
//  FUNCIONES EXPORTADAS:
//    · triggerGameOver()          — activa la pantalla de derrota
//    · handleGameOverStart()      — START en game-over/goal: abre/navega menú
//
//  RE-EXPORTS (compatibilidad):
//    · isEndMenuOpen()            — desde end-menu.js
//    · handleEndMenuNav(action)   — desde end-menu.js
//    · openGoalMenu()             — desde end-menu.js
//    · isResultsScreenOpen()      — desde results-screen.js
//    · closeResultsScreen()       — desde results-screen.js
// =============================================================================

import { gameState, saveGame, saveGlobalData } from './game-state.js';
import { gameOverSound }          from './sounds.js';
import {
    isEndMenuOpen, openGameOverMenu, openGoalMenu,
    handleEndMenuNav, resetEndMenu,
} from './end-menu.js';

// ── Re-exports para compatibilidad ──────────────────────────────────────────
export { isEndMenuOpen, handleEndMenuNav, openGoalMenu, resetEndMenu } from './end-menu.js';
export { isResultsScreenOpen, closeResultsScreen, handleResultsScroll } from './results-screen.js';

// =============================================================================
//  TRIGGER GAME OVER — Activa la pantalla de derrota
// =============================================================================
export function triggerGameOver() {
    // PAUSAR MÚSICA PRIMERO (antes de cambiar pantallas)
    if (gameState.currentMelody) {
        gameState.currentMelody.pause();
        gameState.currentMelody.currentTime = 0;
    }

    const gameScreen     = document.querySelector('.game-screen');
    const battleScreen   = document.querySelector('.battle-screen');
    const gameOverScreen = document.querySelector('.game-over-screen');

    if (gameScreen)     gameScreen.classList.add('hidden');
    if (battleScreen)   battleScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden');

    saveGlobalData();
    gameState.isGameOver = true;
    saveGame();

    gameOverSound.play();
}

// =============================================================================
//  HANDLE GAME OVER START — Primera pulsación de START/Enter
// =============================================================================
// Se llama desde controls.js. Cubre tanto game-over como goal-screen.
export function handleGameOverStart() {
    const gameOverScreen = document.querySelector('.game-over-screen');
    const goalScreen     = document.querySelector('.goal-screen');

    const inGameOver = gameOverScreen && !gameOverScreen.classList.contains('hidden');
    const inGoal     = goalScreen     && !goalScreen.classList.contains('hidden');

    if (!inGameOver && !inGoal) return false;

    if (!isEndMenuOpen()) {
        // Primera pulsación: abrir el menú correspondiente
        if (inGameOver) openGameOverMenu();
        // En goal, el menú ya está abierto desde openGoalMenu() — START actúa como A
        if (inGoal) handleEndMenuNav('pressA');
    } else {
        handleEndMenuNav('pressStart');
    }
    return true;
}