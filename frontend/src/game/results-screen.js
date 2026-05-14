// =============================================================================
//  results-screen.js — Pantalla de resultados de partida
// =============================================================================
//  RESPONSABILIDAD: Mostrar, cerrar y gestionar el scroll de la pantalla
//  de resultados que aparece tras alcanzar la meta, con la lista de
//  pokémon capturados y escapados.
//
//  FUNCIONES EXPORTADAS:
//    · showResultsScreen()          — muestra la pantalla con los resultados
//    · closeResultsScreen()         — cierra y vuelve a la goal-screen
//    · isResultsScreenOpen()        — true si la pantalla está visible
//    · handleResultsScroll(action)  — scroll con D-Pad y cierre con B
// =============================================================================

import { gameState }     from './game-state.js';
import { clickSound }    from './sounds.js';
import { openGoalMenu }  from './end-menu.js';

export function isResultsScreenOpen() {
    return gameState.isResultsOpen || false;
}

export function showResultsScreen() {
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
            <p>Capturados: ${captured.length}
            <br>
            Escapados: ${escaped.length}</p>
            <h3>CAPTURADOS</h3>
            ${fmt(captured)}
            <h3>ESCAPADOS</h3>
            ${fmt(escaped)}
        `;
    }

    gameState.statsScroll = 0;
    const resultsList = document.querySelector('.results-list');
    if (resultsList) resultsList.style.transform = 'translateY(0)';

    gameState.isResultsOpen = true;
}

export function closeResultsScreen() {
    const goalScreen    = document.querySelector('.goal-screen');
    const resultsScreen = document.querySelector('.results-screen');
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (goalScreen)    goalScreen.classList.remove('hidden');
    gameState.isResultsOpen = false;
    openGoalMenu();
}

// =============================================================================
//  SCROLL Y CIERRE — Gestiona D-Pad y B dentro de results-screen
// =============================================================================
export function handleResultsScroll(action) {
    if (!gameState.isResultsOpen) return false;

    const scrollStep = 60;

    if (action === 'pressB') {
        closeResultsScreen();
        return true;
    }

    const resultsList    = document.querySelector('.results-list');
    const resultsViewport = document.querySelector('.results-viewport');
    if (!resultsList || !resultsViewport) return true;

    const maxScroll = resultsList.scrollHeight - resultsViewport.clientHeight;

    if (action === 'pressDown' && gameState.statsScroll < maxScroll) {
        clickSound.currentTime = 0;
        clickSound.play();
        gameState.statsScroll += scrollStep;
        resultsList.style.transform = `translateY(-${gameState.statsScroll}px)`;
    } else if (action === 'pressUp' && gameState.statsScroll > 0) {
        clickSound.currentTime = 0;
        clickSound.play();
        gameState.statsScroll -= scrollStep;
        resultsList.style.transform = `translateY(-${gameState.statsScroll}px)`;
    }

    return true;
}