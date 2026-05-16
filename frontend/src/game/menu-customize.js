// =============================================================================
//  menu-customize.js — Personalización: color, explorador, dificultad, sticker
// =============================================================================
//  RESPONSABILIDAD: Gestionar las vistas de personalización del menú:
//  selección de color de consola, selección de explorador, selección de
//  dificultad y selección de sticker. Cada una con su propia lógica de navegación.
//
//  REGISTRA HANDLERS PARA:
//    · 'customize'  — vista raíz de personalización
//    · 'color'      — selector de color (◀ ▶)
//    · 'explorer'   — selector de explorador (◀ ▶)
//    · 'difficulty'  — selector de dificultad (cursor)
//    · 'sticker'    — selector de sticker (◀ ▶)
//    · 'vibration'  — selector de vibración (◀ ▶)
// =============================================================================

import { gameState }                                      from './game-state.js';
import { EXPLORERS, COLORS, DIFFICULTY_CONFIG, STICKERS } from './menu-config.js';
import { VIBRATION_OPTIONS } from './menu-config.js';
import {
    showView, moveCursorUp, moveCursorDown, playClick,
    getCursorIndex, registerHandler,
} from './menu-nav.js';

let explorerIndex = 0;
let colorIndex    = 0;
let stickerIndex  = 0;

// ── Registrar handlers ──────────────────────────────────────────────────────
registerHandler('customize',  handleCustomize);
registerHandler('color',      handleColor);
registerHandler('explorer',   handleExplorer);
registerHandler('difficulty', handleDifficulty);
registerHandler('sticker',    handleSticker);
registerHandler('vibration',  handleVibration);

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
            case 'difficulty': openDifficultySelector(); break;
            case 'explorer':   openExplorerSelector();  break;
            case 'color':      openColorSelector();     break;
            case 'sticker':    openStickerSelector();   break;
            case 'vibration':  openVibrationSelector(); break;
            case 'back':       showView('main');        break;
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
function openDifficultySelector() {
    showView('difficulty');
}

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

// =============================================================================
//  VISTA: STICKER
// =============================================================================
function openStickerSelector() {
    const saved = localStorage.getItem('pokesector_sticker') || STICKERS[0].src;
    stickerIndex = STICKERS.findIndex(s => s.src === saved);
    if (stickerIndex < 0) stickerIndex = 0;
    renderStickerPreview();
    showView('sticker');
}

function renderStickerPreview() {
    const preview = document.querySelector('.menu-preview-sticker');
    if (!preview) return;
    const sticker = STICKERS[stickerIndex];
    preview.textContent = sticker.label;

    // Previsualizar en tiempo real en la consola
    const stickerImg = document.querySelector('.sticker img');
    if (stickerImg) stickerImg.src = sticker.src;
}

function handleSticker(action) {
    if (action === 'pressB') {
        playClick();
        // Restaurar el sticker anterior si cancela
        const saved = localStorage.getItem('pokesector_sticker') || STICKERS[0].src;
        const stickerImg = document.querySelector('.sticker img');
        if (stickerImg) stickerImg.src = saved;
        showView('customize');
        return;
    }

    if (action === 'pressLeft') {
        playClick();
        stickerIndex = (stickerIndex - 1 + STICKERS.length) % STICKERS.length;
        renderStickerPreview();
        return;
    }
    if (action === 'pressRight') {
        playClick();
        stickerIndex = (stickerIndex + 1) % STICKERS.length;
        renderStickerPreview();
        return;
    }

    if (action === 'pressA') {
        playClick();
        const chosen = STICKERS[stickerIndex];
        const stickerImg = document.querySelector('.sticker img');
        if (stickerImg) stickerImg.src = chosen.src;
        localStorage.setItem('pokesector_sticker', chosen.src);
        localStorage.setItem('pokesector_sticker_pending', 'true');
        showView('customize');
    }
}

// =============================================================================
//  VISTA: VIBRACIÓN
// =============================================================================
let vibrationIndex = 0;

function openVibrationSelector() {
    const saved = localStorage.getItem('pokesector_vibration') || 'on';
    vibrationIndex = VIBRATION_OPTIONS.findIndex(v => v.value === saved);
    if (vibrationIndex < 0) vibrationIndex = 0;
    renderVibrationPreview();
    showView('vibration');
}

function renderVibrationPreview() {
    const preview = document.querySelector('.menu-preview-vibration');
    if (!preview) return;
    const option = VIBRATION_OPTIONS[vibrationIndex];
    preview.textContent = option.label;
}

function handleVibration(action) {
    if (action === 'pressB') {
        playClick();
        showView('customize');
        return;
    }

    if (action === 'pressLeft') {
        playClick();
        vibrationIndex = (vibrationIndex - 1 + VIBRATION_OPTIONS.length) % VIBRATION_OPTIONS.length;
        renderVibrationPreview();
        return;
    }

    if (action === 'pressRight') {
        playClick();
        vibrationIndex = (vibrationIndex + 1) % VIBRATION_OPTIONS.length;
        renderVibrationPreview();
        return;
    }

    if (action === 'pressA') {
        playClick();
        const chosen = VIBRATION_OPTIONS[vibrationIndex];
        localStorage.setItem('pokesector_vibration', chosen.value);
        showView('customize');
    }
}