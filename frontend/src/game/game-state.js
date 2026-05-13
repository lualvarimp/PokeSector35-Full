// =============================================================================
//  game-state.js — Estado global del juego y persistencia
// =============================================================================
//  MODIFICADO PARA FULLSTACK:
//  - localStorage sigue como almacén temporal durante la partida
//  - Al finalizar con éxito (meta), los datos se vuelcan al backend
//  - El replay se acumula en localStorage durante la partida
//  - Se añade slotNumber para saber en qué slot guarda el usuario registrado
// =============================================================================

import * as api from '../services/apiService.js';

export const gameState = {
    playerName: 'Ash',
    hp: 10,
    pokeball: 20,
    currentScreen: 'home-screen',
    currentPosition: { r: 0, c: 0 },
    isBattle: false,
    isGoal: false,
    isGameOver: false,
    isResultsOpen: false,
    isIntro: false,
    isStatsOpen: false,
    isConfirmingErase: false,
    statsScroll: 0,
    currentWildPokemon: null,
    pokemonCaptured: [],
    pokemonEscaped: [],
    difficultyId: null,
    difficulty:   null,
    explorer:     null,
    color:        null,
    // ── FullStack additions ──────────────────────────────────────────────
    slotNumber:   null,
    slotDbId:     null,
};

// =============================================================================
//  SANITIZACIÓN DE NOMBRE DE EXPLORADOR
// =============================================================================
//  El username (ID de login) es PRIVADO y NUNCA debe aparecer en pantalla.
//  sanitizeExplorerName() garantiza que el nombre mostrado al jugador es
//  siempre un nombre de explorador válido, jamás el username del usuario.
//
//  Reglas:
//  - Si el nombre coincide con el username del usuario logueado → 'Ash'
//  - Si el nombre está vacío, es null o undefined → 'Ash'
//  - En cualquier otro caso, se devuelve el nombre tal cual (recortado)
// =============================================================================
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

// ─── Replay tracking ─────────────────────────────────────────────────────────
export function recordMovement() {
    if (!api.isLoggedIn()) return;
    const entry = {
        hp:  gameState.hp,
        r:   gameState.currentPosition.r,
        c:   gameState.currentPosition.c,
        pok: gameState.pokeball,
    };
    const raw = localStorage.getItem('pokesector_replay');
    const movements = raw ? JSON.parse(raw) : [];
    movements.push(entry);
    localStorage.setItem('pokesector_replay', JSON.stringify(movements));
}

export function saveGame() {
    // Sanitizar antes de guardar para que NUNCA se persista un username
    gameState.playerName = sanitizeExplorerName(gameState.playerName);

    const dataToSave = {
        playerName:      gameState.playerName,
        hp:              gameState.hp,
        pokeball:        gameState.pokeball,
        currentPosition: gameState.currentPosition,
        isGoal:          gameState.isGoal,
        isGameOver:      gameState.isGameOver,
        pokemonCaptured: gameState.pokemonCaptured,
        pokemonEscaped:  gameState.pokemonEscaped,
        difficultyId:    gameState.difficultyId,
        difficulty:      gameState.difficulty,
        explorer:        gameState.explorer,
        color:           gameState.color,
        slotNumber:      gameState.slotNumber,
        slotDbId:        gameState.slotDbId,
    };
    localStorage.setItem('pokesector_save', JSON.stringify(dataToSave));
    recordMovement();
}

export function saveGlobalData() {
    const globalRaw = localStorage.getItem('pokesector_global');
    const global = globalRaw
        ? JSON.parse(globalRaw)
        : { playerName: 'Ash', allCaptured: [] };

    gameState.pokemonCaptured.forEach(pokemon => {
        const alreadyExists = global.allCaptured.some(p => p.id === pokemon.id);
        if (!alreadyExists) {
            global.allCaptured.push({ id: pokemon.id, name: pokemon.name });
        }
    });

    global.allCaptured.sort((a, b) => a.id - b.id);
    // Sanitizar antes de guardar para que NUNCA se persista un username
    global.playerName = sanitizeExplorerName(gameState.playerName);
    gameState.playerName = global.playerName;
    localStorage.setItem('pokesector_global', JSON.stringify(global));
}

export async function saveToBackend() {
    if (!api.isLoggedIn() || !gameState.slotNumber) return;
    try {
        await api.saveGameToBackend(gameState, gameState.slotNumber);
        console.log('✅ Datos volcados al backend');
    } catch (error) {
        console.error('❌ Error al volcar datos al backend:', error);
    }
}

export function resetGameData() {
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_difficulty');
    localStorage.removeItem('pokesector_explorer');
    // NO borramos pokesector_color: el color elegido persiste entre partidas
    gameState.pokemonCaptured = [];
    gameState.pokemonEscaped  = [];
    gameState.statsScroll     = 0;
    gameState.difficultyId    = null;
    gameState.difficulty      = null;
    gameState.explorer        = null;
    gameState.color           = null;
    gameState.slotNumber      = null;
    gameState.slotDbId        = null;
}

export function eraseAllData() {
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_global');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_difficulty');
    localStorage.removeItem('pokesector_explorer');
    localStorage.removeItem('pokesector_color');
    gameState.playerName      = 'Ash';
    gameState.pokemonCaptured = [];
    gameState.pokemonEscaped  = [];
    gameState.statsScroll     = 0;
    gameState.difficultyId    = null;
    gameState.difficulty      = null;
    gameState.explorer        = null;
    gameState.color           = null;
    gameState.slotNumber      = null;
    gameState.slotDbId        = null;
}