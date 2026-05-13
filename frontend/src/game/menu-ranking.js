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
            'El ranking es exclusivo para exploradores registrados.\n¿Quieres crear una cuenta?',
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

    // Etiqueta de la dificultad activa
    if (label) {
        label.textContent = `[ ◀  ${diff.toUpperCase()}  ▶ ]`;
    }

    // Reset scroll al cambiar dificultad
    rankingScroll = 0;
    list.style.transform = 'translateY(0)';

    list.innerHTML = '';

    if (entries.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Sin entradas para esta dificultad.';
        list.appendChild(p);
        return;
    }

    entries.forEach((entry, i) => {
        const name = (entry.explorer_name || entry.User?.username || '???').substring(0, 12).padEnd(12);
        const cap  = String(entry.captured_count).padStart(3);
        const esc  = String(entry.escaped_count).padStart(3);
        const p    = document.createElement('p');
        p.textContent = `${String(i + 1).padStart(2)}. ${name} ${cap}  ${esc}`;
        list.appendChild(p);
    });
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
