// =============================================================================
//  menu.js — Navegación del menú principal
// =============================================================================
//  MODIFICADO PARA FULLSTACK:
//  - Registro y login reales contra la API del backend
//  - Slots cargados desde la BD (usuarios registrados)
//  - Ranking cargado desde la BD
//  - Modo invitado sin persistencia
// =============================================================================

import { gameState, saveGame, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';
import { clickSound }                       from './sounds.js';
import { EXPLORERS, COLORS, DIFFICULTY_CONFIG } from './menu-config.js';
import * as api                             from '../services/apiService.js';

let menuActive   = false;
let currentView  = 'main';
let cursorIndex  = 0;
let explorerIndex = 0;
let colorIndex    = 0;
let confirmAction = null;

// Almacena los slots cargados del backend para usarlos al seleccionar
let loadedSlots = [];

export function showMenu() {
    const homeScreen = document.querySelector('.home-screen');
    const menuScreen = document.querySelector('.menu-screen');

    if (homeScreen) homeScreen.classList.add('hidden');
    if (menuScreen) menuScreen.classList.remove('hidden');

    menuActive  = true;
    cursorIndex = 0;
    showView('main');
    syncMenuVisibility();
}

export function updateMenu(action) {
    if (!menuActive) return;

    switch (currentView) {
        case 'main':       handleMain(action);       break;
        case 'start':      handleStart(action);      break;
        case 'slots':      handleSlots(action);      break;
        case 'info':       handleInfo(action);       break;
        case 'customize':  handleCustomize(action);  break;
        case 'color':      handleColor(action);      break;
        case 'explorer':   handleExplorer(action);   break;
        case 'difficulty': handleDifficulty(action); break;
        case 'ranking':    handleRanking(action);    break;
        case 'account':    handleAccount(action);    break;
        case 'confirm':    handleConfirm(action);    break;
    }
}

export function isMenuOpen() {
    return menuActive;
}

function showView(view) {
    const views = [
        '.menu-main', '.menu-start', '.menu-slots', '.menu-info', '.menu-customize',
        '.menu-color', '.menu-explorer', '.menu-difficulty',
        '.menu-ranking', '.menu-account', '.menu-confirm'
    ];
    views.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('hidden');
    });

    const target = document.querySelector(`.menu-${view}`);
    if (target) target.classList.remove('hidden');

    currentView = view;
    cursorIndex = 0;
    updateCursor();

    // syncMenuVisibility gestiona nombre del explorador y visibilidad condicional
    syncMenuVisibility();
}

// =============================================================================
//  CURSOR — SVG arrow rendering (CRITICAL: must produce exact same SVG)
// =============================================================================
function updateCursor() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;

    const items = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    );

    items.forEach((item, i) => {
        if (!item.dataset.label) {
            item.dataset.label = item.textContent.trim().replace(/^\s*/, '');
        }
        const text    = item.dataset.label;
        const sub     = item.dataset.sublabel || '';
        const cursor  = i === cursorIndex
            ? '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,5 0,10" fill="currentColor"/></svg>'
            : '';

        item.classList.toggle('active', i === cursorIndex);

        item.innerHTML = `<span class="menu-cursor">${cursor}</span> ${text}`
            + (sub ? `<span class="menu-slot-sub">${sub}</span>` : '');
    });
}

function moveCursorUp() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;
    const total = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    ).length;
    cursorIndex = (cursorIndex - 1 + total) % total;
    playClick();
    updateCursor();
}

function moveCursorDown() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;
    const total = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    ).length;
    cursorIndex = (cursorIndex + 1) % total;
    playClick();
    updateCursor();
}

function syncMenuVisibility() {
    const hasSession = api.isLoggedIn();

    // Nombre del explorador: visible solo si logueado (el hueco siempre se respeta por CSS)
    const playerNameEls = document.querySelectorAll('.menu-player-name');
    playerNameEls.forEach(el => {
        el.textContent = hasSession ? (gameState.playerName || '') : '';
    });

    // Menú cuenta: CERRAR SESIÓN y BORRAR CUENTA solo si logueado
    const accountLogout = document.querySelector('[data-account="logout"]');
    const accountDelete = document.querySelector('[data-account="delete"]');
    if (accountLogout) accountLogout.classList.toggle('hidden', !hasSession);
    if (accountDelete) accountDelete.classList.toggle('hidden', !hasSession);
}

// =============================================================================
//  LÓGICA POR VISTA
// =============================================================================

function handleMain(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }

    if (action === 'pressA') {
        playClick();
        const list    = document.querySelector('.menu-main .menu-list');
        const items   = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex].dataset.option;

        switch (selected) {
            case 'start':     onStart();     break;
            case 'customize': onCustomize(); break;
            case 'ranking':   onRanking();   break;
            case 'account':   onAccount();   break;
            case 'logout':    onLogout();    break;
        }
    }
}

// ── INICIAR PARTIDA → pantalla intermedia nueva partida / continuar ───────────
function onStart() {
    showView('start');
}

function handleStart(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list    = document.querySelector('.menu-start .menu-list');
        const items   = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex].dataset.start;

        switch (selected) {
            case 'new-game':  onNewGame();  break;
            case 'continue':  onContinue(); break;
            case 'back':      showView('main'); break;
        }
    }
}

// ── NUEVA PARTIDA ─────────────────────────────────────────────────────────────
function onNewGame() {
    if (api.isLoggedIn()) {
        renderSlots('new-game');
    } else {
        const hasSave = !!localStorage.getItem('pokesector_save');
        confirmNewGame(null, hasSave);
    }
}

// ── CONFIRMACIÓN NUEVA PARTIDA (avisos + nombre explorador) ──────────────────
async function confirmNewGame(slotNumber, slotOccupied = false) {

    // Avisos de sobreescritura solo si el slot ya tiene una partida
    if (slotOccupied) {
        const aviso1 = confirm(
            '⚠️ NUEVA PARTIDA\n\n' +
            'Empezar una nueva partida borrará TODOS los datos del slot:\n' +
            '  · Tu pokédex de este slot\n' +
            '  · Tu progreso actual\n' +
            '  · Tus estadísticas\n\n' +
            'Esta acción no se puede deshacer.\n\n' +
            '¿Quieres continuar?'
        );
        if (!aviso1) return;

        const aviso2 = confirm(
            '🚨 ¿ESTÁS SEGURO/A?\n\n' +
            'Comenzarás una partida completamente nueva desde cero.\n' +
            'Todos los datos anteriores se perderán para siempre.\n\n' +
            '¿Confirmas que quieres empezar de nuevo?'
        );
        if (!aviso2) return;
    }

    // Nombre del explorador — si cancela, se aborta la nueva partida
    const explorerInput = prompt(
        '¿Cómo se llama tu explorador?\n(Máx. 12 caracteres)',
        gameState.playerName || 'Ash'
    );
    if (explorerInput === null) return;

    gameState.playerName = sanitizeExplorerName(explorerInput.trim() || gameState.playerName || 'Ash');
    localStorage.setItem('pokesector_explorer_name', gameState.playerName);
    updateExplorerHUD();

    startGame(slotNumber);
}

// ── CONTINUAR ────────────────────────────────────────────────────────────────
function onContinue() {
    const hasSave = !!localStorage.getItem('pokesector_save');

    if (api.isLoggedIn()) {
        renderSlots('continue');
    } else if (hasSave) {
        showInfoMessage(
            '⚠ Tu partida está guardada solo en este navegador y puede perderse.\n¿Qué quieres hacer?',
            true
        );
    } else {
        showInfoMessage(
            'No tienes ninguna partida guardada.\n¿Quieres crear una cuenta para guardar tu progreso?',
            true
        );
    }
}

function onCustomize() { showView('customize'); }

function onRanking() {
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

function onAccount() { showView('account'); }

function onLogout() {
    api.logout();
    gameState.playerName = 'Ash';
    gameState.slotNumber = null;
    gameState.slotDbId   = null;
    // Limpiar el explorer_name al hacer logout para no arrastrarlo a otra cuenta
    localStorage.removeItem('pokesector_explorer_name');
    updateExplorerHUD();
    syncMenuVisibility();
    showView('main');
}

// =============================================================================
//  VISTA: SLOTS — carga real desde backend
// =============================================================================
async function renderSlots(mode) {
    const list = document.querySelector('.menu-slots .menu-list');
    if (!list) return;

    list.innerHTML = '<li class="menu-item">Cargando slots...</li>';
    showView('slots');

    try {
        loadedSlots = await api.getSlots();
    } catch (e) {
        loadedSlots = [];
    }

    list.innerHTML = '';

    const slots = [1, 2, 3];
    slots.forEach((slotNum, i) => {
        const li   = document.createElement('li');
        li.className    = 'menu-item';
        li.dataset.slot = slotNum;

        const saved = loadedSlots.find(s => s.slot_number === slotNum);
        if (saved) {
            const diff = saved.difficulty_id ? saved.difficulty_id.toUpperCase() : '?';
            li.dataset.label    = `SLOT ${slotNum}`;
            li.dataset.sublabel = `(${diff})`;
        } else {
            li.dataset.label    = `SLOT ${slotNum}`;
            li.dataset.sublabel = '(vacío)';
        }

        if (i === 0) li.classList.add('active');
        list.appendChild(li);
    });

    const back       = document.createElement('li');
    back.className   = 'menu-item';
    back.dataset.slot = 'back';
    back.textContent  = '  VOLVER';
    list.appendChild(back);

    list.dataset.mode = mode;
    cursorIndex = 0;
    updateCursor();
}

function handleSlots(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list    = document.querySelector('.menu-slots .menu-list');
        const items   = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex].dataset.slot;
        const mode     = list.dataset.mode;

        if (selected === 'back') { showView('main'); return; }

        const slotNumber = parseInt(selected);
        gameState.slotNumber = slotNumber;

        if (mode === 'new-game') {
            const existingSlot = loadedSlots.find(s => s.slot_number === slotNumber);
            if (existingSlot) {
                gameState.slotDbId = existingSlot.id;
            }
            confirmNewGame(slotNumber, !!existingSlot);
        } else if (mode === 'continue') {
            const existingSlot = loadedSlots.find(s => s.slot_number === slotNumber);
            if (existingSlot) {
                // SIEMPRE permitir continuar, sin importar is_goal o is_game_over
                restoreFromSlot(existingSlot);
            } else {
                alert('No hay partida guardada en este slot.');
            }
        }
    }
}

// Restore game state from a backend slot
function restoreFromSlot(slot) {
    // ⚠️ SANITIZACIÓN: garantizar que explorer_name NUNCA es el username del usuario
    // Si está vacío, undefined o coincide con el username privado → 'Ash'
    const originalName = slot.explorer_name;
    slot.explorer_name = sanitizeExplorerName(slot.explorer_name);

    // Si detectamos que el nombre estaba corrupto (era el username u otro inválido),
    // actualizamos la BD para corregirlo permanentemente
    if (originalName !== slot.explorer_name && api.isLoggedIn()) {
        api.updateSlot(slot.slot_number, { explorer_name: slot.explorer_name })
            .catch(e => console.warn('No se pudo corregir explorer_name en BD:', e.message));
    }

    // Si la partida anterior llegó a la meta, reiniciar stats de batalla
    // pero mantener la pokédex acumulada
    if (slot.is_goal) {
        gameState.hp              = 10;           // RESET
        gameState.pokeball        = 20;          // RESET
        gameState.currentPosition = { r: 0, c: 0 }; // RESET a origen
        gameState.isGoal          = false;        // Nueva partida en progreso
        gameState.isGameOver      = false;
        // Cargar pokédex del slot (se mantiene)
        gameState.pokemonCaptured = []; // Se cargarán desde la BD si es necesario
        gameState.pokemonEscaped  = [];
    } else {
        // Si estaba en progreso, cargar exactamente como estaba
        gameState.hp              = slot.hp;
        gameState.pokeball        = slot.pokeball;
        gameState.currentPosition = { r: slot.position_r, c: slot.position_c };
        gameState.isGoal          = slot.is_goal;
        gameState.isGameOver      = slot.is_game_over;
    }
    
    gameState.slotNumber      = slot.slot_number;
    gameState.slotDbId        = slot.id;

    // ── Personalización: "bandeja de cambios pendientes" ──────────────────
    // Si el usuario cambió algo en el menú de personalización antes de continuar,
    // esos valores están en localStorage y tienen prioridad sobre la BD (una sola vez).
    // Tras aplicarlos se limpian del localStorage → la BD queda como fuente de verdad.
    const savedDiffRaw  = localStorage.getItem('pokesector_difficulty');
    const savedExplorer = localStorage.getItem('pokesector_explorer');
    const savedColor    = localStorage.getItem('pokesector_color');

    const diffId   = savedDiffRaw ? JSON.parse(savedDiffRaw).id : slot.difficulty_id;
    const explorer = savedExplorer || slot.explorer;
    const color    = savedColor    || slot.color;

    gameState.difficultyId = diffId;
    gameState.explorer     = explorer;
    gameState.color        = color;

    // El nombre ya está sanitizado al inicio de la función
    gameState.playerName = slot.explorer_name;
    localStorage.setItem('pokesector_explorer_name', gameState.playerName);

    // Guardar la personalización en la BD y limpiar la bandeja del localStorage
    const hasLocalChanges = savedDiffRaw || savedExplorer || savedColor;
    if (hasLocalChanges && api.isLoggedIn()) {
        api.updateSlot(slot.slot_number, {
            difficulty_id: diffId,
            explorer:      explorer,
            color:         color,
        }).catch(e => console.warn('No se pudo actualizar personalización en BD:', e.message));

        // Limpiar: ya se han aplicado y guardado en BD, el localStorage queda libre
        localStorage.removeItem('pokesector_difficulty');
        localStorage.removeItem('pokesector_explorer');
        localStorage.removeItem('pokesector_color');
    }

    // Apply difficulty config
    const fullConfig = DIFFICULTY_CONFIG[diffId];
    if (fullConfig) {
        gameState.difficulty = {
            id:            diffId,
            encounterRate: fullConfig.encounterRate,
            wildRate:      fullConfig.wildRate,
            catchRate:     fullConfig.catchRate,
        };
        applyMap(fullConfig.map);
    }

    // Apply explorer
    const explorerObj = EXPLORERS.find(e => e.id === explorer);
    if (explorerObj) {
        const playerImg = document.querySelector('#player img');
        if (playerImg) playerImg.src = explorerObj.src;
    }

    // Apply color
    if (color) {
        document.documentElement.style.setProperty('--gameboy', color);
    }

    // Move player to correct position
    const player    = document.getElementById('player');
    const posR = slot.is_goal ? 0 : slot.position_r;
    const posC = slot.is_goal ? 0 : slot.position_c;
    const targetCell = document.querySelector(`div[data-r="${posR}"][data-c="${posC}"]`);
    if (player && targetCell) {
        targetCell.appendChild(player);
    }

    // Actualizar nombre en HUD usando función centralizada (sanitiza automáticamente)
    updateExplorerHUD();

    // Transition to game screen
    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    if (menuScreen) menuScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    menuActive = false;
    gameState.isIntro = false;

    // Import and update HUD
    import('./hud.js').then(({ updateHUD }) => updateHUD());

    saveGame();
}

// =============================================================================
//  VISTA: INFO
// =============================================================================
function showInfoMessage(text, showContinueOption) {
    const infoText = document.querySelector('.menu-info .menu-info-text');
    const list     = document.querySelector('.menu-info .menu-list');
    if (!infoText || !list) return;

    infoText.textContent = text;
    list.innerHTML = '';

    const goAccount      = document.createElement('li');
    goAccount.className  = 'menu-item active';
    goAccount.dataset.action = 'go-account';
    goAccount.textContent    = 'CREAR CUENTA';
    list.appendChild(goAccount);

    if (showContinueOption) {
        const continueLocal      = document.createElement('li');
        continueLocal.className  = 'menu-item';
        continueLocal.dataset.action = 'continue-local';
        continueLocal.textContent    = '  CONTINUAR SIN CUENTA';
        list.appendChild(continueLocal);
    }

    const back       = document.createElement('li');
    back.className   = 'menu-item';
    back.dataset.action = 'back';
    back.textContent    = '  VOLVER';
    list.appendChild(back);

    showView('info');
}

function handleInfo(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-info .menu-list');
        const items    = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex].dataset.action;

        switch (selected) {
            case 'go-account':      showView('account'); break;
            case 'continue-local':  startGame();         break;
            case 'back':            showView('main');    break;
        }
    }
}

// =============================================================================
//  VISTA: PERSONALIZAR
// =============================================================================
function handleCustomize(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-customize .menu-list');
        const items    = list.querySelectorAll('.menu-item');
        const selected = items[cursorIndex].dataset.customize;

        switch (selected) {
            case 'color':      openColorSelector();      break;
            case 'explorer':   openExplorerSelector();   break;
            case 'difficulty': showView('difficulty');   break;
            case 'back':       showView('main');         break;
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
    if (action === 'pressB') { playClick(); showView('customize'); return; }

    if (action === 'pressLeft') {
        playClick();
        colorIndex = (colorIndex - 1 + COLORS.length) % COLORS.length;
        renderColorPreview();
        return;
    }
    if (action === 'pressRight') {
        playClick();
        colorIndex = (colorIndex + 1) % COLORS.length;
        renderColorPreview();
        return;
    }

    if (action === 'pressA') {
        playClick();
        const chosen = COLORS[colorIndex];
        document.documentElement.style.setProperty('--gameboy', chosen.value);
        localStorage.setItem('pokesector_color', chosen.value);
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
        const selected = items[cursorIndex].dataset.difficulty;

        if (selected === 'back') { showView('customize'); return; }

        const config = DIFFICULTY_CONFIG[selected];
        if (config) {
            localStorage.setItem('pokesector_difficulty', JSON.stringify({ id: selected, ...config }));
            items.forEach(item => item.classList.remove('selected'));
            items[cursorIndex].classList.add('selected');
        }

        showView('customize');
    }
}

// =============================================================================
//  VISTA: RANKING — carga desde backend
// =============================================================================
const DIFFICULTIES = ['facil', 'normal', 'dificil', 'infernal'];
let rankingData        = [];   // todos los datos cargados de la BD
let rankingDiffIndex   = 0;    // índice de la dificultad activa
let rankingScroll      = 0;    // píxeles de scroll actuales

async function renderRanking() {
    const list     = document.querySelector('.ranking-list');
    const label    = document.querySelector('.ranking-filter-label');
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

function handleRanking(action) {
    const viewport = document.querySelector('.ranking-viewport');
    const list     = document.querySelector('.ranking-list');
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

// =============================================================================
//  VISTA: CUENTA — registro y login REALES
// =============================================================================
function handleAccount(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-account .menu-list');
        const items    = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex]?.dataset.account;

        switch (selected) {
            case 'login':    doLogin();           break;
            case 'logout':   onLogout();          break;
            case 'register': doRegister();        break;
            case 'delete':   askDeleteConfirm();  break;
            case 'back':     showView('main');     break;
        }
    }
}

async function doRegister() {
    let explorer = prompt('TU NOMBRE DE EXPLORADOR\n(Máx. 12 caracteres. Aparecerá en el juego)', 'Ash');
    if (explorer === null) return;
    if (explorer.trim() === '') explorer = 'Ash';
    explorer = explorer.trim().substring(0, 12);

    let username = prompt('TU NOMBRE/ID DE USUARIO\n(Único, 3-15 caracteres)', '');
    if (!username || username.trim() === '') return;
    username = username.trim().substring(0, 15);

    let password = prompt('TU CONTRASEÑA DE USUARIO\n(Mínimo 6 caracteres)', '');
    if (!password || password.trim() === '') return;

    let password2 = prompt('REPITE LA CONTRASEÑA', '');
    if (password2 === null) return;
    if (password !== password2) {
        alert('Las contraseñas no coinciden.\nVuelve a intentarlo.');
        return;
    }

    try {
        await api.register(username, password);
        alert(`¡Bienvenido/a, ${explorer}!\n\n¡Gracias por registrarte en PokéSector 35!\nKanto te necesita...\n\n¡Buena suerte, explorador/a!`);

        // El register ya guardó el username en localStorage vía saveSession.
        // Ahora sanitizamos por si el jugador puso el username como nombre de explorador.
        gameState.playerName = sanitizeExplorerName(explorer);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);

        updateExplorerHUD();

        saveGame();
        syncMenuVisibility();
        showView('main');
    } catch (error) {
        alert('Error al registrar: ' + error.message);
    }
}

async function doLogin() {
    let username = prompt('Nombre de usuario:', '');
    if (!username || username.trim() === '') return;

    let password = prompt('Contraseña:', '');
    if (!password || password.trim() === '') return;

    try {
        await api.login(username, password);
        alert(`¡Bienvenido de vuelta, ${username}!`);

        // Cargar el explorer_name desde la BD (slot más reciente)
        // Es la única fuente fiable: el localStorage puede estar vacío o ser de otra cuenta
        let explorerName = '';
        try {
            const slots = await api.getSlots();
            if (slots && slots.length > 0) {
                // Ordenar por slot_number descendente y coger el primero con nombre
                const sorted = slots.sort((a, b) => b.slot_number - a.slot_number);
                explorerName = sorted.find(s => s.explorer_name)?.explorer_name || '';
            }
        } catch (e) {
            // Si falla la llamada, usar el localStorage como fallback
        }

        // Fallback: localStorage (por si no hay slots todavía)
        if (!explorerName) {
            explorerName = localStorage.getItem('pokesector_explorer_name') || '';
        }

        gameState.playerName = sanitizeExplorerName(explorerName);
        localStorage.setItem('pokesector_explorer_name', gameState.playerName);

        updateExplorerHUD();
        syncMenuVisibility();
        showView('main');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function askDeleteConfirm() {
    const aviso1 = confirm(
        '⚠️ BORRAR CUENTA\n\n' +
        'Estás a punto de borrar tu cuenta permanentemente.\n\n' +
        'Se eliminarán:\n' +
        '  · Tu cuenta de usuario\n' +
        '  · Todos tus slots de partida\n' +
        '  · Tu Pokédex completa\n' +
        '  · Tu historial de ranking\n\n' +
        'Esta acción NO se puede deshacer.\n\n' +
        '¿Quieres continuar?'
    );
    if (!aviso1) return;

    const aviso2 = confirm(
        '🚨 ÚLTIMA ADVERTENCIA\n\n' +
        'Si confirmas, todos tus datos desaparecerán para siempre.\n' +
        'No habrá forma de recuperarlos.\n\n' +
        '¿Estás completamente seguro/a de que quieres borrar tu cuenta?'
    );
    if (!aviso2) return;

    try {
        await api.deleteAccount();
    } catch (e) {
        console.warn('Error al borrar cuenta en servidor:', e.message);
    }

    // Limpiar todo: sesión, datos locales y nombre de explorador
    localStorage.removeItem('pokesector_save');
    localStorage.removeItem('pokesector_global');
    localStorage.removeItem('pokesector_replay');
    localStorage.removeItem('pokesector_explorer_name');
    api.logout();

    gameState.playerName = '';
    gameState.slotNumber  = null;
    gameState.slotDbId    = null;

    alert('Tu cuenta y todos tus datos han sido eliminados.');
    syncMenuVisibility();
    showView('main');
}

// =============================================================================
//  INICIAR PARTIDA
// =============================================================================
async function startGame(slotNumber) {
    const diffRaw       = localStorage.getItem('pokesector_difficulty');
    const savedExplorer = localStorage.getItem('pokesector_explorer');
    const savedColor    = localStorage.getItem('pokesector_color');

    // ── Dificultad ────────────────────────────────────────────────────────
    if (diffRaw) {
        const diff       = JSON.parse(diffRaw);
        const fullConfig = DIFFICULTY_CONFIG[diff.id];

        gameState.hp           = fullConfig ? fullConfig.hp       : DIFFICULTY_CONFIG.normal.hp;
        gameState.pokeball     = fullConfig ? fullConfig.pokeballs : DIFFICULTY_CONFIG.normal.pokeballs;
        gameState.difficultyId = diff.id;
        gameState.difficulty   = {
            id:            diff.id,
            encounterRate: fullConfig ? fullConfig.encounterRate : DIFFICULTY_CONFIG.normal.encounterRate,
            wildRate:      fullConfig ? fullConfig.wildRate      : DIFFICULTY_CONFIG.normal.wildRate,
            catchRate:     fullConfig ? fullConfig.catchRate     : DIFFICULTY_CONFIG.normal.catchRate,
        };
        if (fullConfig) applyMap(fullConfig.map);
    } else {
        const def            = DIFFICULTY_CONFIG.normal;
        gameState.hp         = def.hp;
        gameState.pokeball   = def.pokeballs;
        gameState.difficultyId = 'normal';
        gameState.difficulty = { id: 'normal', encounterRate: def.encounterRate, wildRate: def.wildRate, catchRate: def.catchRate };
        applyMap(def.map);
    }

    // ── Explorador ────────────────────────────────────────────────────────
    if (savedExplorer) {
        const explorer = EXPLORERS.find(e => e.id === savedExplorer);
        if (explorer) {
            const playerImg = document.querySelector('#player img');
            if (playerImg) playerImg.src = explorer.src;
        }
        gameState.explorer = savedExplorer;
    }

    // ── Color de consola ──────────────────────────────────────────────────
    if (savedColor) {
        document.documentElement.style.setProperty('--gameboy', savedColor);
        gameState.color = savedColor;
    }

    // ── Slot para usuarios registrados ────────────────────────────────────
    if (api.isLoggedIn() && slotNumber) {
        gameState.slotNumber = slotNumber;

        // Sanitizar antes de crear el slot: explorer_name NUNCA puede ser el username
        gameState.playerName = sanitizeExplorerName(gameState.playerName);

        try {
            // Check if slot exists, if so delete and recreate
            const existingSlot = loadedSlots.find(s => s.slot_number === slotNumber);
            if (existingSlot) {
                await api.deleteSlot(slotNumber);
            }

            const newSlot = await api.createSlot({
                slot_number:   slotNumber,
                explorer:      gameState.explorer || 'boy',
                // explorer_name ya está sanitizado arriba: jamás contendrá el username
                explorer_name: gameState.playerName,
                color:         gameState.color || '#019273',
                difficulty_id: gameState.difficultyId || 'normal',
            });
            gameState.slotDbId = newSlot.id;
        } catch (e) {
            console.warn('Error creating slot:', e.message);
        }
    }

    // ── Limpiamos claves individuales ─────────────────────────────────────
    localStorage.removeItem('pokesector_difficulty');
    localStorage.removeItem('pokesector_explorer');
    localStorage.removeItem('pokesector_color');
    localStorage.removeItem('pokesector_replay');

    // ── Transición al mapa ────────────────────────────────────────────────
    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    if (menuScreen) menuScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    menuActive        = false;
    gameState.isIntro = false;

    // Reset game state for new game
    gameState.pokemonCaptured = [];
    gameState.pokemonEscaped  = [];
    gameState.currentPosition = { r: 0, c: 0 };
    gameState.isGoal          = false;
    gameState.isGameOver      = false;

    // Update HUD
    import('./hud.js').then(({ updateHUD }) => updateHUD());

    saveGame();
}

function applyMap(mapData) {
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 7; c++) {
            const cell = document.querySelector(`div[data-r="${r}"][data-c="${c}"]`);
            if (!cell) continue;

            const clase = mapData[r * 7 + c];
            cell.classList.remove('rock', 'wild', 'goal');
            if (clase) cell.classList.add(clase);
        }
    }

    const player    = document.getElementById('player');
    const startCell = document.querySelector('div[data-r="0"][data-c="0"]');
    if (player && startCell) {
        startCell.appendChild(player);
        gameState.currentPosition = { r: 0, c: 0 };
    }
}

function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
}