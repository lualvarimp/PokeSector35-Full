
// =============================================================================
//  stats-summary.js — Vista resumen de estadísticas
// =============================================================================
//  RESPONSABILIDAD: Renderizar la vista principal de la pantalla de
//  estadísticas, mostrando los Pokémon capturados y perdidos durante
//  la partida actual.
//
//  FUNCIONES EXPORTADAS:
//    · renderSummaryView() — dibuja la lista de capturados y perdidos en .game-list
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Visualización de datos  → lista de Pokémon capturados/perdidos en la partida
//    ✅ Manipulación del DOM    → crea y añade elementos <p> dinámicamente al DOM
// =============================================================================

import { gameState }              from './game-state.js';
import { formatName, setInfoStats } from './stats-ui.js';

export function renderSummaryView() {
    const gameList = document.querySelector('.game-list'); // contenedor de las listas
    if (!gameList) return;

    gameList.textContent = ''; // limpiamos el contenido anterior antes de redibujar

    setInfoStats('summary'); // mostramos las instrucciones estándar (START, A, B)

    // ── Lista de Pokémon capturados en esta partida ────────────────────────
    const hCaptured = document.createElement('p');
    hCaptured.innerHTML = '<strong>CAPTURADOS:</strong>'; // cabecera de sección
    gameList.appendChild(hCaptured);

    if (gameState.pokemonCaptured.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Ninguno'; // mensaje cuando no se capturó ninguno
        gameList.appendChild(p);
    } else {
        // Enumeramos cada Pokémon capturado con su posición en la lista
        gameState.pokemonCaptured.forEach((pokemon, i) => {
            const p = document.createElement('p');
            p.textContent = `${i + 1}. ${formatName(pokemon.name)}`; // "1. Pikachu"
            gameList.appendChild(p);
        });
    }

    // ── Lista de Pokémon perdidos (escapados o huidas) en esta partida ─────
    const hEscaped = document.createElement('p');
    hEscaped.innerHTML = '<strong>PERDIDOS:</strong>';
    gameList.appendChild(hEscaped);

    if (gameState.pokemonEscaped.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Ninguno';
        gameList.appendChild(p);
    } else {
        gameState.pokemonEscaped.forEach((pokemon, i) => {
            const p = document.createElement('p');
            p.textContent = `${i + 1}. ${formatName(pokemon.name)}`;
            gameList.appendChild(p);
        });
    }
}