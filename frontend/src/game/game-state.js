// =============================================================================
//  game-state.js — Estado global del juego
// =============================================================================
//  RESPONSABILIDAD: Definir y exportar el objeto de estado global del juego.
//  Este es el ÚNICO lugar donde vive el estado mutable compartido entre
//  todos los módulos del juego.
//
//  MÓDULOS RELACIONADOS:
//    · explorer.js     — sanitización del nombre y actualización del HUD
//    · game-persist.js — persistencia en localStorage y volcado al backend
//
//  COMPATIBILIDAD: Re-exporta las funciones de explorer.js y game-persist.js
//  para que los consumidores existentes no necesiten cambiar sus imports.
// =============================================================================

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

// ── Re-exports para compatibilidad ───────────────────────────────────────────
// Los consumidores existentes importan estas funciones desde game-state.js.
// Las re-exportamos desde sus nuevos módulos para no romper ningún import.
export { sanitizeExplorerName, updateExplorerHUD }                  from './explorer.js';
export { saveGame, saveGlobalData, saveToBackend, eraseAllData }    from './game-persist.js';
