// =============================================================================
//  menu-customize.js — Personalización: color, explorador, dificultad
// =============================================================================
//  RESPONSABILIDAD: Gestionar las tres vistas de personalización del menú:
//  selección de color de consola, selección de explorador y selección de
//  dificultad. Cada una con su propia lógica de navegación.
//
//  REGISTRA HANDLERS PARA:
//    · 'customize'  — vista raíz de personalización
//    · 'color'      — selector de color (◀ ▶)
//    · 'explorer'   — selector de explorador (◀ ▶)
//    · 'difficulty'  — selector de dificultad (cursor)
// =============================================================================

import { gameState }                         from './game-state.js';
import { EXPLORERS, COLORS, DIFFICULTY_CONFIG } from './menu-config.js';
import {
    showView, moveCursorUp, moveCursorDown, playClick,
    getCursorIndex, registerHandler,
} from './menu-nav.js';

let explorerIndex = 0;
let colorIndex    = 0;

// ── Registrar handlers ──────────────────────────────────────────────────────
registerHandler('customize',  handleCustomize);
registerHandler('color',      handleColor);
registerHandler('explorer',   handleExplorer);
registerHandler('difficulty', handleDifficulty);

// =============================================================================
//  VISTA: PERSONALIZAR (raíz)
// =============================================================================
function handleCustomize(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-customize .menu-list');
        const items    = list.querySelectorAll('.menu-item');
        const selected = items[getCursorIndex()].dataset.customize;

        switch (selected) {
            case 'color':      openColorSelector();    break;
            case 'explorer':   openExplorerSelector(); break;
            case 'difficulty': showView('difficulty'); break;
            case 'back':       showView('main');       break;
        }
    }
}

// =============================================================================
//  VISTA: COLOR DE CONSOLA
// =============================================================================
function openColorSelector() {
    const savedColor = localStorage.getItem('pokesector_color') || COLORS[0].value;
    colorIndex = COLORS.findIndex(c => c.value === savedColor);
    if (colorIndex < 0) colorIndex = 0;
    renderColorPreview();
    showView('color');
}

function renderColorPreview() {
    const preview = document.querySelector('.menu-preview-color');
    if (!preview) return;
    const color = COLORS[colorIndex];
    preview.innerHTML = `${color.label}`;
}

function handleColor(action) {
    if (action === 'pressB') {
        playClick();
        // Al volver atrás sin confirmar, restaurar el color anterior
        const previousColor = localStorage.getItem('pokesector_color') || COLORS[0].value;
        document.documentElement.style.setProperty('--gameboy', previousColor);
        showView('customize');
        return;
    }

    if (action === 'pressLeft') {
        playClick();
        colorIndex = (colorIndex - 1 + COLORS.length) % COLORS.length;
        renderColorPreview();
        // Previsualizar el color en tiempo real al navegar
        document.documentElement.style.setProperty('--gameboy', COLORS[colorIndex].value);
        return;
    }
    if (action === 'pressRight') {
        playClick();
        colorIndex = (colorIndex + 1) % COLORS.length;
        renderColorPreview();
        // Previsualizar el color en tiempo real al navegar
        document.documentElement.style.setProperty('--gameboy', COLORS[colorIndex].value);
        return;
    }

    if (action === 'pressA') {
        playClick();
        const chosen = COLORS[colorIndex];
        document.documentElement.style.setProperty('--gameboy', chosen.value);
        localStorage.setItem('pokesector_color', chosen.value);
        // Marcar que el usuario cambió el color conscientemente desde personalización.
        // Esta flag indica "este color tiene prioridad sobre la BD".
        localStorage.setItem('pokesector_color_pending', '1');
        showView('customize');
    }
}

// =============================================================================
//  VISTA: EXPLORADOR
// =============================================================================
function openExplorerSelector() {
    const savedExplorer = localStorage.getItem('pokesector_explorer') || EXPLORERS[0].id;
    explorerIndex = EXPLORERS.findIndex(e => e.id === savedExplorer);
    if (explorerIndex < 0) explorerIndex = 0;
    renderExplorerPreview();
    showView('explorer');
}

function renderExplorerPreview() {
    const img = document.getElementById('explorer-preview-img');
    if (!img) return;
    const explorer = EXPLORERS[explorerIndex];
    img.src = explorer.src;
    img.alt = explorer.label;
    const nameEl = document.querySelector('.menu-explorer-name');
    if (nameEl) nameEl.textContent = explorer.label;
}

function handleExplorer(action) {
    if (action === 'pressB') { playClick(); showView('customize'); return; }

    if (action === 'pressLeft') {
        playClick();
        explorerIndex = (explorerIndex - 1 + EXPLORERS.length) % EXPLORERS.length;
        renderExplorerPreview();
        return;
    }
    if (action === 'pressRight') {
        playClick();
        explorerIndex = (explorerIndex + 1) % EXPLORERS.length;
        renderExplorerPreview();
        return;
    }

    if (action === 'pressA') {
        playClick();
        const chosen = EXPLORERS[explorerIndex];
        const playerImg = document.querySelector('#player img');
        if (playerImg) playerImg.src = chosen.src;
        localStorage.setItem('pokesector_explorer', chosen.id);
        showView('customize');
    }
}

// =============================================================================
//  VISTA: DIFICULTAD
// =============================================================================
function handleDifficulty(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('customize'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-difficulty .menu-list');
        const items    = list.querySelectorAll('.menu-item');
        const selected = items[getCursorIndex()].dataset.difficulty;

        if (selected === 'back') { showView('customize'); return; }

        const config = DIFFICULTY_CONFIG[selected];
        if (config) {
            localStorage.setItem('pokesector_difficulty', JSON.stringify({ id: selected, ...config }));
            items.forEach(item => item.classList.remove('selected'));
            items[getCursorIndex()].classList.add('selected');
        }

        showView('customize');
    }
}
