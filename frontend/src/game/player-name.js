// =============================================================================
//  player-name.js — Gestión del nombre del explorador
// =============================================================================
//  RESPONSABILIDAD: Solicitar el nombre del jugador la primera vez que juega
//  (o tras borrar sus datos), guardarlo en localStorage, y recuperarlo
//  automáticamente en partidas posteriores sin volver a preguntar.
//  IMPORTANTE: desactiva gameState.isIntro al terminar, para que el bloqueo
//  de movimiento cubra también el tiempo del prompt del navegador y los
//  primeros frames tras la transición a la game-screen.
//
//  FUNCIONES EXPORTADAS:
//    · askPlayerName() — solicita o recupera el nombre del explorador
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ localStorage          → guarda y recupera el nombre en pokesector_global
//    ✅ Guardar preferencias  → el nombre persiste entre sesiones y partidas
//    ✅ Manipulación del DOM  → actualiza todos los elementos con el nombre en pantalla
// =============================================================================

import { gameState, saveGame, saveGlobalData, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';

export function askPlayerName() {

    // Comprobamos si ya hay un nombre guardado en los datos globales persistentes
    const globalRaw = localStorage.getItem('pokesector_global');
    if (globalRaw) {
        const global = JSON.parse(globalRaw);
        const sanitized = sanitizeExplorerName(global.playerName);
        // Solo usamos el nombre guardado si pasa la sanitización (no es username)
        if (global.playerName && global.playerName.trim() !== '' &&
            sanitized.toLowerCase() === global.playerName.trim().toLowerCase()) {
            // Nombre encontrado y válido: lo recuperamos sin mostrar el prompt
            gameState.playerName = sanitized;
            updateExplorerHUD();
            saveGame();

            // Desactivamos el bloqueo de movimiento ahora que el nombre está listo
            // y el jugador puede empezar a jugar de forma segura
            gameState.isIntro = false;
            return;
        }
    }

    // Primera vez o tras borrar datos: mostramos el prompt con "Ash" por defecto.
    // Durante el prompt el hilo JS está congelado pero isIntro sigue siendo true,
    // así que cualquier tecla pulsada durante el prompt será ignorada al reanudarse.
    let name = prompt("¿Cómo te llamas, explorador? (Máx. 12 caracteres)", "Ash");

    if (name === null || name.trim() === "") {
        name = "Ash";
    }

    // Sanitizar: si el jugador escribe su propio username, lo cambiamos a 'Ash'
    gameState.playerName = sanitizeExplorerName(name);

    updateExplorerHUD();

    saveGame();
    saveGlobalData();

    // Desactivamos el bloqueo de movimiento solo aquí, cuando todo está listo.
    // Este es el único punto donde isIntro pasa a false tras la intro.
    gameState.isIntro = false;
}