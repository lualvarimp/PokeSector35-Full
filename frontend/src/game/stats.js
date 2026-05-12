// =============================================================================
//  stats.js — Controlador de la pantalla de estadísticas
// =============================================================================
//  RESPONSABILIDAD: Actuar como controlador central de la pantalla de stats.
//  Recibe las acciones del jugador desde controls.js, decide qué vista mostrar
//  (resumen o Pokédex), gestiona el scroll de ambas pantallas (stats y meta),
//  y controla el diálogo de confirmación de borrado de datos.
//
//  FUNCIONES EXPORTADAS:
//    · pokemonList()          — inicializa la pantalla de stats (abre vista resumen)
//    · updateStatsScreen(action) — procesa cada acción del jugador en stats/meta
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM    → cambia vistas, scroll, muestra/oculta diálogos
//    ✅ Filtrado de información  → delega en Pokedex.nextFilter()/prevFilter()
//    ✅ localStorage             → eraseAllData() borra todos los datos persistidos
//    ✅ Visualización de datos   → coordina las dos vistas de estadísticas
// =============================================================================

import { gameState, eraseAllData }         from './game-state.js';
import { clickSound, eraseSound }          from './sounds.js';
import { renderSummaryView }               from './stats-summary.js';
import { renderPokedexView, initPokedex, pokedex } from './stats-pokedex.js';

let statsView = 'summary'; // estado interno: vista activa ('summary' | 'pokedex')

// ─── Inicialización ────────────────────────────────────────────────────────
// Se llama al abrir la pantalla de stats desde la meta (SELECT).
// Reconstruye la Pokédex con los datos actuales y muestra la vista resumen.
export async function pokemonList() {
    await initPokedex();    // reconstruimos la instancia Pokedex (BD si logueado, localStorage si no)
    statsView = 'summary';  // siempre empezamos por el resumen
    renderSummaryView();
}

// ─── Diálogo de confirmación de borrado ───────────────────────────────────
// Crea el diálogo la primera vez (lazy creation) y lo muestra u oculta.
// Mientras está visible, solo A (confirmar) y B (cancelar) tienen efecto.
function showEraseConfirm(visible) {
    let dialog = document.getElementById('erase-confirm');

    if (!dialog) {
        // Creamos el diálogo la primera vez que se necesita
        dialog = document.createElement('div');
        dialog.id = 'erase-confirm';
        dialog.innerHTML = `
            <p>¿Borrar todos los datos?<br>
            <strong>A/SPACE:</strong> Sí<br>
            <strong>B/ESC:</strong> No</p>
        `;
        document.querySelector('.stats-screen').appendChild(dialog);
    }

    gameState.isConfirmingErase = visible;                     // actualizamos el flag global
    dialog.classList.toggle('hidden', !visible);               // mostramos u ocultamos
}

// ─── Controlador principal ─────────────────────────────────────────────────
// Recibe una acción ('pressA', 'pressB', 'pressUp', etc.) y ejecuta la lógica
// correspondiente según el contexto: diálogo activo, vista Pokédex, resumen,
// scroll en stats o en meta, apertura de stats, o nueva partida.
export function updateStatsScreen(action) {
    const scrollStep = 60; // píxeles de desplazamiento por pulsación de arriba/abajo

    const goalList    = document.querySelector('.goal-list');   // inner div de goal-screen
    const goalScreen  = document.querySelector('.goal-screen');
    const statsList   = document.querySelector('.stats-list');  // inner div de stats-screen
    const statsScreen = document.querySelector('.stats-screen');

    // ── Prioridad 1: diálogo de confirmación activo ────────────────────────
    // Mientras el diálogo está visible bloqueamos todas las acciones excepto A y B
    if (gameState.isConfirmingErase) {
        if (action === 'pressA') {
            eraseAllData();               // borra pokesector_save y pokesector_global
            eraseSound.currentTime = 0;
            eraseSound.play();
            showEraseConfirm(false);      // cerramos el diálogo
            statsView = 'summary';
            renderSummaryView();          // volvemos al resumen (ahora vacío)
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
        } else if (action === 'pressB') {
            showEraseConfirm(false);      // cancelamos sin borrar
        }
        return; // bloqueamos el resto de acciones mientras el diálogo está activo
    }

    // ── Prioridad 2: vista Pokédex ─────────────────────────────────────────
    if (gameState.isStatsOpen && statsView === 'pokedex') {

        // ◀ ▶ cambian el filtro de letra inicial en la Pokédex
        if (action === 'pressLeft' || action === 'pressRight') {
            clickSound.currentTime = 0;
            clickSound.play();
            if (action === 'pressLeft') pokedex.prevFilter(); // letra anterior
            else                        pokedex.nextFilter(); // letra siguiente
            renderPokedexView();  // redibujamos con el nuevo filtro
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)'; // reseteamos scroll
            return;
        }

        // B vuelve a la vista resumen desde la Pokédex
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

    // ── Prioridad 3: vista resumen ─────────────────────────────────────────
    if (gameState.isStatsOpen && statsView === 'summary') {

        // A abre la Pokédex desde el resumen
        if (action === 'pressA') {
            clickSound.currentTime = 0;
            clickSound.play();
            statsView = 'pokedex';
            pokedex.filterByLetter(null); // reseteamos el filtro al entrar
            renderPokedexView();
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            return;
        }

        // B en el resumen abre el diálogo de confirmación de borrado
        if (action === 'pressB') {
            showEraseConfirm(true);
            return;
        }
    }

    // ── Scroll en goal-screen con el dPad ─────────────────────────────────
    // Permite leer el mensaje de enhorabuena si el contenido desborda la pantalla
    if (gameState.isGoal && !gameState.isStatsOpen && goalList && goalScreen) {
        const maxGoalScroll = goalList.scrollHeight - goalScreen.clientHeight;

        if (action === 'pressDown' && gameState.statsScroll < maxGoalScroll) {
            clickSound.currentTime = 0;
            clickSound.play();
            gameState.statsScroll += scrollStep;
            goalList.style.transform = `translateY(-${gameState.statsScroll}px)`;
        } else if (action === 'pressUp' && gameState.statsScroll > 0) {
            clickSound.currentTime = 0;
            clickSound.play();
            gameState.statsScroll -= scrollStep;
            goalList.style.transform = `translateY(-${gameState.statsScroll}px)`;
        }
    }

    // ── Scroll en stats-screen con el dPad ────────────────────────────────
    // Permite ver toda la lista de capturados/perdidos si desborda la pantalla
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

    // ── SELECT: abrir la pantalla de stats desde la meta ──────────────────
    if (action === 'pressSelect' && gameState.isGoal) {
        if (!gameState.isStatsOpen) {
            goalScreen.classList.add('hidden');    // ocultamos la pantalla de meta
            statsScreen.classList.remove('hidden'); // mostramos estadísticas
            gameState.statsScroll = 0;
            if (statsList) statsList.style.transform = 'translateY(0)';
            gameState.isStatsOpen = true;
            pokemonList(); // inicializamos la pantalla con los datos actuales
        }
    }

    // ── START: comenzar nueva partida desde la pantalla de meta/stats ──────
    if (action === 'pressStart' && gameState.isGoal) {
        localStorage.removeItem('pokesector_save'); // borramos la partida terminada
        location.reload();                          // recargamos para empezar de cero
    }
}