// =============================================================================
//  game-over.js — Gestión de la derrota
// =============================================================================
//  RESPONSABILIDAD: Mostrar la pantalla de Game Over cuando el jugador se
//  queda sin HP, persistir ese estado en localStorage para sobrevivir a
//  recargas, y gestionar el reinicio de partida desde esa pantalla.
//
//  FUNCIONES EXPORTADAS:
//    · triggerGameOver()       — activa la pantalla de derrota
//    · handleGameOverRestart() — reinicia el juego si el jugador pulsa Start
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → muestra/oculta pantallas sin recargar la página
//    ✅ localStorage          → persiste isGameOver para sobrevivir a F5
// =============================================================================

import { gameState, saveGame, saveGlobalData } from './game-state.js';
import { gameOverSound } from './sounds.js';

export function triggerGameOver() {

    // Ocultamos el mapa y la pantalla de batalla
    const gameScreen   = document.querySelector('.game-screen');
    const battleScreen = document.querySelector('.battle-screen');
    const gameOverScreen = document.querySelector('.game-over-screen');

    if (gameScreen)   gameScreen.classList.add('hidden');
    if (battleScreen) battleScreen.classList.add('hidden');
    if (gameOverScreen) gameOverScreen.classList.remove('hidden'); // mostramos Game Over

    // Consolidamos en la colección global los Pokémon capturados en esta partida
    // para que no se pierdan aunque la partida haya terminado en derrota
    saveGlobalData();

    // Marcamos la partida como perdida y la persistimos en localStorage
    // Así, si el jugador recarga el navegador, volverá a ver Game Over en lugar
    // del mapa con HP 0 (que dejaba el juego bloqueado)
    gameState.isGameOver = true;
    saveGame();

    gameOverSound.play(); // sonido de derrota
}

export function handleGameOverRestart() {

    const gameOverScreen = document.querySelector('.game-over-screen');

    // Solo actuamos si la pantalla de Game Over está visible
    if (gameOverScreen && !gameOverScreen.classList.contains('hidden')) {
        localStorage.removeItem('pokesector_save'); // borramos la partida perdida
        location.reload();                          // recargamos para empezar de cero
        return true;  // indicamos al caller (controls.js) que el reinicio se ha producido
    }

    return false; // no estábamos en Game Over: no hacemos nada
}