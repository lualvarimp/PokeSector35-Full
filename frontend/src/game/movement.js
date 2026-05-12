
// =============================================================================
//  movement.js — Movimiento del jugador y lógica del mapa
// =============================================================================
//  MODIFICADO PARA FULLSTACK:
//  - Al llegar a la meta, si hay sesión activa, vuelca datos al backend
// =============================================================================

import { gameState, saveGame, saveGlobalData, saveToBackend } from './game-state.js';
import { triggerPokemonEncounter }             from './api.js';
import { stepSound, crashSound, goalSound }    from './sounds.js';
import { updateHUD }                           from './hud.js';

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
        crashSound.play();
    }
}

export async function checkSquare(square) {

    // ── CASO 1: meta ──────────────────────────────────────────────────────
    if (square.classList.contains('goal')) {
        gameState.isGoal = true;

        goalSound.currentTime = 0;
        goalSound.play();

        saveGlobalData();
        saveGame();

        // ── FULLSTACK: volcado al backend si usuario registrado ───────────
        await saveToBackend();

        document.querySelector('.game-screen').classList.add('hidden');
        const goalScreen = document.querySelector('.goal-screen');
        goalScreen.classList.remove('hidden');

        requestAnimationFrame(() => {
            updateGoalScreen();
            updateHUD();
        });

        return;
    }

    // ── CASO 2: encuentro Pokémon ─────────────────────────────────────────
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
    const capturedThisGame = gameState.pokemonCaptured.length;
    const escapedThisGame  = gameState.pokemonEscaped.length;

    const globalRaw   = localStorage.getItem('pokesector_global');
    const allCaptured = globalRaw ? (JSON.parse(globalRaw).allCaptured || []) : [];
    const totalUnique = allCaptured.length;

    const goalText = document.getElementById('goal-text');
    if (goalText) {
        goalText.innerHTML = `
            <p><strong>Has capturado:</strong><br>
            ${capturedThisGame} Pokémon</p>
            <p><strong>Han escapado:</strong><br>
            ${escapedThisGame} Pokémon</p>
            <p><strong>Total capturas:</strong><br>
            ${totalUnique} Pokémon</p>
            <p style="text-align: center;">------------</p>
        `;
    }
}
