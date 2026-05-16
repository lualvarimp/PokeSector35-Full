// =============================================================================
//  game-persist.js — Persistencia del estado del juego
// =============================================================================
//  RESPONSABILIDAD: Gestionar todo lo relacionado con guardar, restaurar
//  y borrar datos de partida. Incluye localStorage y volcado al backend.
//
//  FUNCIONES EXPORTADAS:
//    · saveGame()        — persiste el estado actual en localStorage
//    · saveGlobalData()  — actualiza los datos globales (colección acumulada)
//    · saveToBackend()   — vuelca datos al backend al llegar a la meta
//    · resetGameData()   — limpia datos de partida (sin borrar colección global)
//    · eraseAllData()    — borra TODO (partida + colección + preferencias)
//
//  FUNCIÓN INTERNA:
//    · recordMovement()  — registra cada movimiento para el replay
// =============================================================================

import { gameState }            from './game-state.js';
import { sanitizeExplorerName } from './explorer.js';
import * as api                 from '../services/apiService.js';

// ─── Replay tracking ─────────────────────────────────────────────────────────
// Registra la posición y estado del jugador en cada movimiento.
// Solo se graba si hay sesión activa (los datos de replay se envían al backend).
function recordMovement() {
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

// ─── Guardar partida en curso ────────────────────────────────────────────────
// Persiste el estado completo en localStorage para sobrevivir a recargas (F5).
// Se llama desde movement.js, battle.js, menu.js, player-name.js, etc.
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

// ─── Guardar datos globales ──────────────────────────────────────────────────
// Actualiza la colección acumulada de pokémon capturados en todas las partidas.
// Se llama al llegar a la meta (movement.js) y al capturar un pokémon.
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

// ─── Volcado al backend ──────────────────────────────────────────────────────
// Se llama al llegar a la meta si el usuario está logueado.
export async function saveToBackend() {
    if (!api.isLoggedIn() || !gameState.slotNumber) return;
    try {
        await api.saveGameToBackend(gameState, gameState.slotNumber);
        console.log('✅ Datos volcados al backend');
    } catch (error) {
        console.error('❌ Error al volcar datos al backend:', error);
    }
}

// ─── Reset parcial (nueva partida) ──────────────────────────────────────────
// Limpia datos de la partida actual pero NO borra la colección global ni el color.
export function resetGameData() {
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_difficulty');
    localStorage.removeItem('pokesector_explorer');
    localStorage.removeItem('pokesector_sticker_pending');
    // NO borramos pokesector_color: el color elegido persiste entre partidas
    // NO borramos pokesector_sticker: el sticker elegido persiste entre partidas
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

// ─── Borrado total ───────────────────────────────────────────────────────────
// Elimina TODOS los datos persistidos: partida, colección y preferencias.
// Se llama desde la pantalla de estadísticas al confirmar el borrado.
export function eraseAllData() {
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_global');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_difficulty');
    localStorage.removeItem('pokesector_explorer');
    localStorage.removeItem('pokesector_color');
    localStorage.removeItem('pokesector_sticker');
    localStorage.removeItem('pokesector_sticker_pending');
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