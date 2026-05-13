// =============================================================================
//  stats.js — Controlador de la pantalla de estadísticas
// =============================================================================
//  RESPONSABILIDAD: Actuar como controlador central de la pantalla de stats.
//  Recibe las acciones del jugador desde controls.js, decide qué vista mostrar
//  (resumen o Pokédex), gestiona el scroll de la pantalla de stats, y controla
//  el diálogo de confirmación de borrado de datos.
//
//  FUNCIONES EXPORTADAS:
//    · pokemonList()              — inicializa la pantalla de stats
//    · updateStatsScreen(action)  — procesa cada acción del jugador en stats
//
//  NOTA: La lógica de scroll de results-screen se ha movido a
//  results-screen.js → handleResultsScroll(). controls.js debe llamarla
//  cuando isResultsScreenOpen() sea true.
// =============================================================================

import { gameState, eraseAllData }                        from './game-state.js';
import { clickSound, eraseSound }                         from './sounds.js';
import { renderSummaryView }                              from './stats-summary.js';
import { renderPokedexView, initPokedex, pokedex }        from './stats-pokedex.js';
import { handleResultsScroll }                            from './game-over.js';

let statsView = 'summary'; // vista activa: 'summary' | 'pokedex'

// ─── Inicialización ────────────────────────────────────────────────────────
// Se llama al abrir la pantalla de stats desde la meta (SELECT).
// Reconstruye la Pokédex con los datos actuales y muestra la vista resumen.
export async function pokemonList() {
    await initPokedex();
    statsView = 'summary';
    renderSummaryView();
}

// ─── Diálogo de confirmación de borrado ───────────────────────────────────
function showEraseConfirm(visible) {
    let dialog = document.getElementById('erase-confirm');

    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'erase-confirm';
        dialog.innerHTML = `
            <p>¿Borrar todos los datos?<br>
            <strong>A/SPACE:</strong> Sí<br>
            <strong>B/ESC:</strong> No</p>
        `;
        document.querySelector('.stats-screen').appendChild(dialog);
    }

    gameState.isConfirmingErase = visible;
    dialog.classList.toggle('hidden', !visible);
}

// ─── Controlador principal ─────────────────────────────────────────────────
export function updateStatsScreen(action) {
    const scrollStep = 60;

    const goalScreen  = document.querySelector('.goal-screen');
    const statsList   = document.querySelector('.stats-list');
    const statsScreen = document.querySelector('.stats-screen');

    // ── Prioridad 0: results-screen (delegado a results-screen.js) ────────
    if (handleResultsScroll(action)) return;

    // ── Prioridad 1: diálogo de confirmación activo ───────────────────────
    if (gameState.isConfirmingErase) {
        if (action === 'pressA') {
            eraseAllData();
            eraseSound.currentTime = 0;
            eraseSound.play();
            showEraseConfirm(false);
            statsView = 'summary';
            renderSummaryView();
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
        } else if (action === 'pressB') {
            showEraseConfirm(false);
        }
        return;
    }

    // ── Prioridad 2: vista Pokédex ────────────────────────────────────────
    if (gameState.isStatsOpen && statsView === 'pokedex') {

        if (action === 'pressLeft' || action === 'pressRight') {
            clickSound.currentTime = 0;
            clickSound.play();
            if (action === 'pressLeft') pokedex.prevFilter();
            else                        pokedex.nextFilter();
            renderPokedexView();
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            return;
        }

        if (action === 'pressB') {
            clickSound.currentTime = 0;
            clickSound.play();
            statsView = 'summary';
            renderSummaryView();
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            return;
        }
    }

    // ── Prioridad 3: vista resumen ────────────────────────────────────────
    if (gameState.isStatsOpen && statsView === 'summary') {

        if (action === 'pressA') {
            clickSound.currentTime = 0;
            clickSound.play();
            statsView = 'pokedex';
            pokedex.filterByLetter(null);
            renderPokedexView();
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            return;
        }

        if (action === 'pressB') {
            showEraseConfirm(true);
            return;
        }
    }

    // ── Scroll en stats-screen con el D-Pad ──────────────────────────────
    if (gameState.isStatsOpen && statsList && statsScreen) {
        const maxStatsScroll = statsList.scrollHeight - statsScreen.clientHeight;

        if (action === 'pressDown' && gameState.statsScroll < maxStatsScroll) {
            clickSound.currentTime = 0;
            clickSound.play();
            gameState.statsScroll += scrollStep;
            statsList.style.transform = `translateY(-${gameState.statsScroll}px)`;
        } else if (action === 'pressUp' && gameState.statsScroll > 0) {
            clickSound.currentTime = 0;
            clickSound.play();
            gameState.statsScroll -= scrollStep;
            statsList.style.transform = `translateY(-${gameState.statsScroll}px)`;
        }
    }

    // ── SELECT: abrir la pantalla de stats desde la meta ─────────────────
    if (action === 'pressSelect' && gameState.isGoal) {
        if (!gameState.isStatsOpen) {
            if (goalScreen)  goalScreen.classList.add('hidden');
            if (statsScreen) statsScreen.classList.remove('hidden');
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            gameState.isStatsOpen = true;
            pokemonList();
        }
    }
}
