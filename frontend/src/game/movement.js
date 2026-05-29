// =============================================================================
//  movement.js — Movimiento del jugador y lógica del mapa
// =============================================================================
//  MODIFICADO PARA FULLSTACK:
//  - Al llegar a la meta, si hay sesión activa, vuelca datos al backend
//  - FIX: isGoal se activa ANTES del await para evitar encuentros Pokémon
//    durante el tiempo de espera de la llamada al backend
// =============================================================================

import { gameState, saveGame, saveGlobalData, saveToBackend } from './game-state.js';
import { triggerPokemonEncounter }             from './api.js';
import { stepSound, crashSound, goalSound } from './sounds.js';
import { triggerGamepadRumble } from './gamepad-input.js';
import { updateHUD }                           from './hud.js';
import { openGoalMenu }                        from './game-over.js';

export function updatePosition(direction) {

    if (gameState.isIntro || gameState.isGoal || gameState.isBattle || gameState.isGameOver) {
        return;
    }

    const player = document.getElementById('player');

    let targetR = gameState.currentPosition.r;
    let targetC = gameState.currentPosition.c;

    switch (direction) {
        case 'pressUp':    targetR--; break;
        case 'pressDown':  targetR++; break;
        case 'pressRight': targetC++; break;
        case 'pressLeft':  targetC--; break;
        default: console.error(`The direction ${direction} is not recognized`); break;
    }

    const newPosition = document.querySelector(`div[data-r="${targetR}"][data-c="${targetC}"]`);

    if (newPosition && !newPosition.classList.contains('rock')) {

        stepSound.currentTime = 0;
        stepSound.play();

        gameState.currentPosition.r = targetR;
        gameState.currentPosition.c = targetC;

        newPosition.appendChild(player);

        saveGame();
        checkSquare(newPosition);

    } else {
        crashSound.currentTime = 0;
        triggerGamepadRumble(150, 0.6);
        crashSound.play();
    }
}

export async function checkSquare(square) {

    // ── CASO 1: meta ──────────────────────────────────────────────────────
    if (square.classList.contains('goal')) {

        // FIX: activamos isGoal INMEDIATAMENTE antes del await
        // Esto bloquea cualquier encuentro Pokémon que pudiera dispararse
        // durante el tiempo de espera de saveToBackend()
        gameState.isGoal = true;
        gameState.isBattle = false;

        goalSound.currentTime = 0;
        goalSound.play();

        saveGlobalData();
        saveGame();

        // Transición inmediata: ocultamos el mapa y mostramos la meta
        // a la vez, antes del await, para evitar el parpadeo de pantalla negra.
        const gameScreen = document.querySelector('.game-screen');
        if (gameScreen) gameScreen.classList.add('hidden');

        const goalScreen = document.querySelector('.goal-screen');
        if (goalScreen) goalScreen.classList.remove('hidden');

        requestAnimationFrame(() => {
            updateGoalScreen();
            openGoalMenu();
            updateHUD();
        });

        // ── FULLSTACK: volcado al backend si usuario registrado ───────────
        await saveToBackend();

        return;
    }

    // ── CASO 2: encuentro Pokémon ─────────────────────────────────────────
    // Doble comprobación: isGoal puede haberse activado durante el await anterior
    if (gameState.isGoal || gameState.isGameOver) return;

    const diff          = gameState.difficulty;
    const encounterRate = diff ? diff.encounterRate : 0.30;
    const wildRate      = diff ? diff.wildRate      : 0.70;

    const pokemonEncounterChance = square.classList.contains('wild')
        ? wildRate
        : encounterRate;

    if (Math.random() < pokemonEncounterChance) {
        await triggerPokemonEncounter();
        updateHUD();
    }
}

export function updateGoalScreen() {
    // El resumen de capturados/escapados ya no se muestra aquí:
    // está disponible en "Ver resultados" dentro del menú de meta.
    // Esta función se mantiene por si en el futuro se necesita
    // inyectar contenido adicional en la goal-screen.
}