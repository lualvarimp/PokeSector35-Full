// =============================================================================
//  menu-ranking.js — Ranking: carga, renderizado, scroll y filtro
// =============================================================================
//  RESPONSABILIDAD: Cargar el ranking desde la API, renderizarlo con
//  filtro por dificultad (◀ ▶), y gestionar el scroll con D-Pad.
//
//  FUNCIONES EXPORTADAS:
//    · onRanking() — inicia la carga y muestra la vista de ranking
//
//  REGISTRA HANDLERS PARA:
//    · 'ranking' — vista del ranking
// =============================================================================

import * as api from '../services/apiService.js';
import {
    showView, playClick, showInfoMessage, registerHandler,
} from './menu-nav.js';

const DIFFICULTIES     = ['facil', 'normal', 'dificil', 'infernal'];
let rankingData        = [];   // todos los datos cargados de la BD
let rankingDiffIndex   = 0;    // índice de la dificultad activa
let rankingScroll      = 0;    // píxeles de scroll actuales

// ── Registrar handler ────────────────────────────────────────────────────────
registerHandler('ranking', handleRanking);

// =============================================================================
//  ENTRY POINT
// =============================================================================
export function onRanking() {
    if (!api.isLoggedIn()) {
        showInfoMessage(
            'Entra en tu cuenta para acceder a la clasificación.',
            false
        );
        return;
    }
    renderRanking();
    showView('ranking');
}

// =============================================================================
//  RENDER RANKING
// =============================================================================
async function renderRanking() {
    const list  = document.querySelector('.ranking-list');
    const label = document.querySelector('.ranking-filter-label');
    if (!list) return;

    list.innerHTML = '<p>Cargando...</p>';
    rankingScroll  = 0;
    list.style.transform = 'translateY(0)';

    try {
        rankingData = await api.getRanking();
    } catch (e) {
        list.innerHTML = '<p>Error al cargar ranking.</p>';
        return;
    }

    renderRankingByDifficulty();
}

function renderRankingByDifficulty() {
    const list  = document.querySelector('.ranking-list');
    const label = document.querySelector('.ranking-filter-label');
    if (!list) return;

    const diff    = DIFFICULTIES[rankingDiffIndex];
    const entries = rankingData.filter(e => e.difficulty_id === diff);

    if (label) {
        label.innerHTML = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="width:0.7em;height:0.7em;vertical-align:middle;fill:currentColor"><polygon points="10,0 0,5 10,10"/></svg>  ${diff.toUpperCase()}  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="width:0.7em;height:0.7em;vertical-align:middle;fill:currentColor"><polygon points="0,0 10,5 0,10"/></svg>`;
    }

    rankingScroll = 0;
    list.style.transform = 'translateY(0)';
    list.innerHTML = '';

    if (entries.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Sin entradas para esta dificultad.';
        list.appendChild(p);
        return;
    }

    const ol = document.createElement('ol');

    entries.forEach(entry => {
        const efficiency = entry.efficiency != null
            ? `${parseFloat(entry.efficiency).toFixed(2)}%`
            : '0.00%';

        const li = document.createElement('li');

        const spanName = document.createElement('span');
        spanName.className = 'ranking-name';
        spanName.textContent = (entry.explorer_name || '???').substring(0, 12);

        const spanCap = document.createElement('span');
        spanCap.className = 'ranking-stat';
        spanCap.textContent = `CAPTURADOS: ${entry.captured_count}`;

        const spanEff = document.createElement('span');
        spanEff.className = 'ranking-stat';
        spanEff.textContent = `EFICACIA: ${efficiency}`;

        li.appendChild(spanName);
        li.appendChild(spanCap);
        li.appendChild(spanEff);
        ol.appendChild(li);
    });

    list.appendChild(ol);
}

// =============================================================================
//  HANDLE RANKING — navegación y scroll
// =============================================================================
function handleRanking(action) {
    const viewport   = document.querySelector('.ranking-viewport');
    const list       = document.querySelector('.ranking-list');
    const scrollStep = 40;

    // B — volver al menú principal
    if (action === 'pressB') {
        playClick();
        showView('main');
        return;
    }

    // ◀ ▶ — cambiar dificultad
    if (action === 'pressLeft') {
        playClick();
        rankingDiffIndex = (rankingDiffIndex - 1 + DIFFICULTIES.length) % DIFFICULTIES.length;
        renderRankingByDifficulty();
        return;
    }
    if (action === 'pressRight') {
        playClick();
        rankingDiffIndex = (rankingDiffIndex + 1) % DIFFICULTIES.length;
        renderRankingByDifficulty();
        return;
    }

    // ▲ ▼ — scroll dentro de la dificultad activa
    if (!list || !viewport) return;
    const maxScroll = list.scrollHeight - viewport.clientHeight;

    if (action === 'pressDown' && rankingScroll < maxScroll) {
        playClick();
        rankingScroll = Math.min(rankingScroll + scrollStep, maxScroll);
        list.style.transform = `translateY(-${rankingScroll}px)`;
    }
    if (action === 'pressUp' && rankingScroll > 0) {
        playClick();
        rankingScroll = Math.max(rankingScroll - scrollStep, 0);
        list.style.transform = `translateY(-${rankingScroll}px)`;
    }
}