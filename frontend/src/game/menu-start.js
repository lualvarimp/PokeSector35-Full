// =============================================================================
//  menu-start.js — Flujo de inicio de partida
// =============================================================================
//  RESPONSABILIDAD: Gestionar todo el flujo de iniciar y continuar partidas:
//  selección de slot, confirmación de nueva partida, restauración desde la BD,
//  aplicación de personalización, transición al mapa, y reinicio desde
//  pantallas de fin de partida.
//
//  FUNCIONES EXPORTADAS:
//    · onStart()               — abre la vista de inicio (continuar/nueva)
//    · restartFromEndScreen()  — reinicia desde game-over o meta
//
//  REGISTRA HANDLERS PARA:
//    · 'start' — vista continuar/nueva partida
//    · 'slots' — vista selección de slot
//    · 'info'  — vista de mensaje informativo
// =============================================================================

import { gameState, saveGame, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';
import { melodySound }                      from './sounds.js';
import { EXPLORERS, DIFFICULTY_CONFIG }      from './menu-config.js';
import * as api                              from '../services/apiService.js';
import {
    showView, moveCursorUp, moveCursorDown, playClick,
    setMenuActive, setCursorIndex, getCursorIndex, updateCursor,
    syncMenuVisibility, registerHandler, showMenu, showInfoMessage,
} from './menu-nav.js';

// Almacena los slots cargados del backend para usarlos al seleccionar
let loadedSlots = [];

// ── Registrar handlers en el enrutador central ───────────────────────────────
registerHandler('start', handleStart);
registerHandler('slots', handleSlots);
registerHandler('info',  handleInfo);

// =============================================================================
//  INICIAR PARTIDA → pantalla intermedia nueva partida / continuar
// =============================================================================
export function onStart() {
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
        const selected = items[getCursorIndex()].dataset.start;

        switch (selected) {
            case 'new-game':  onNewGame();       break;
            case 'continue':  onContinue();      break;
            case 'back':      showView('main');  break;
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

// ── CONFIRMACIÓN NUEVA PARTIDA ───────────────────────────────────────────────
async function confirmNewGame(slotNumber, slotOccupied = false) {
    if (slotOccupied) {
        const aviso1 = confirm(
            'NUEVA PARTIDA\n' +
            'Esta acción borrará TODOS los datos de este slot:\n' +
            '  · Tu pokédex\n' +
            '  · Tu progreso actual\n' +
            '  · Tus estadísticas\n' +
            '¿Quieres continuar?'
        );
        if (!aviso1) return;

        const aviso2 = confirm(
            '¿ESTÁS SEGURO/A?\n' +
            'Comenzarás una partida nueva desde cero.\n' +
            'Los datos anteriores se perderán para siempre.\n' +
            '¿Confirmas que quieres empezar de nuevo?'
        );
        if (!aviso2) return;
    }

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
    setCursorIndex(0);
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
        const selected = items[getCursorIndex()].dataset.slot;
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
                restoreFromSlot(existingSlot);
            } else {
                alert('No hay partida guardada en este slot.');
            }
        }
    }
}

// =============================================================================
//  RESTORE FROM SLOT — Restaurar partida desde la BD
// =============================================================================
function restoreFromSlot(slot) {
    const originalName = slot.explorer_name;
    slot.explorer_name = sanitizeExplorerName(slot.explorer_name);

    if (originalName !== slot.explorer_name && api.isLoggedIn()) {
        api.updateSlot(slot.slot_number, { explorer_name: slot.explorer_name })
            .catch(e => console.warn('No se pudo corregir explorer_name en BD:', e.message));
    }

    if (slot.is_goal) {
        gameState.hp              = 10;
        gameState.pokeball        = 20;
        gameState.currentPosition = { r: 0, c: 0 };
        gameState.isGoal          = false;
        gameState.isGameOver      = false;
        gameState.pokemonCaptured = [];
        gameState.pokemonEscaped  = [];
    } else {
        gameState.hp              = slot.hp;
        gameState.pokeball        = slot.pokeball;
        gameState.currentPosition = { r: slot.position_r, c: slot.position_c };
        gameState.isGoal          = slot.is_goal;
        gameState.isGameOver      = slot.is_game_over;
    }

    gameState.slotNumber = slot.slot_number;
    gameState.slotDbId   = slot.id;

    // Personalización: bandeja de cambios pendientes
    const savedDiffRaw   = localStorage.getItem('pokesector_difficulty');
    const savedExplorer  = localStorage.getItem('pokesector_explorer');
    const colorPending   = localStorage.getItem('pokesector_color_pending');
    const savedColor     = colorPending ? localStorage.getItem('pokesector_color') : null;

    const diffId   = savedDiffRaw ? JSON.parse(savedDiffRaw).id : slot.difficulty_id;
    const explorer = savedExplorer || slot.explorer;
    const color    = savedColor    || slot.color;

    gameState.difficultyId = diffId;
    gameState.explorer     = explorer;
    gameState.color        = color;

    gameState.playerName = slot.explorer_name;
    localStorage.setItem('pokesector_explorer_name', gameState.playerName);

    document.documentElement.style.setProperty('--gameboy', color);
    localStorage.setItem('pokesector_color', color);

    // Guardar personalización en BD y limpiar bandeja
    const hasLocalChanges = savedDiffRaw || savedExplorer || colorPending;
    if (hasLocalChanges && api.isLoggedIn()) {
        api.updateSlot(slot.slot_number, {
            difficulty_id: diffId,
            explorer:      explorer,
            color:         color,
        }).catch(e => console.warn('No se pudo actualizar personalización en BD:', e.message));

        localStorage.removeItem('pokesector_difficulty');
        localStorage.removeItem('pokesector_explorer');
        localStorage.removeItem('pokesector_color_pending');
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

    updateExplorerHUD();

    // Transition to game screen
    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    if (menuScreen) menuScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    melodySound.currentTime = 0;
    melodySound.play().catch(() => {});

    setMenuActive(false);
    gameState.isIntro = false;

    import('./hud.js').then(({ updateHUD }) => updateHUD());

    saveGame();
}

// =============================================================================
//  VISTA: INFO — handler para las opciones de la pantalla informativa
// =============================================================================

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
        const selected = items[getCursorIndex()].dataset.action;

        switch (selected) {
            case 'go-account':      showView('account'); break;
            case 'continue-local':  startGame();         break;
            case 'back':            showView('main');    break;
        }
    }
}

// =============================================================================
//  START GAME — Inicia una partida nueva
// =============================================================================
async function startGame(slotNumber) {
    if (!api.isLoggedIn()) {
        gameState.playerName = 'Ash';
        updateExplorerHUD();
    }

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
        gameState.playerName = sanitizeExplorerName(gameState.playerName);

        try {
            const existingSlot = loadedSlots.find(s => s.slot_number === slotNumber);
            if (existingSlot) {
                await api.deleteSlot(slotNumber);
            }

            const newSlot = await api.createSlot({
                slot_number:   slotNumber,
                explorer:      gameState.explorer || 'boy',
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
    localStorage.removeItem('pokesector_color_pending');
    localStorage.removeItem('pokesector_replay');

    // ── Transición al mapa ────────────────────────────────────────────────
    const menuScreen = document.querySelector('.menu-screen');
    const gameScreen = document.querySelector('.game-screen');
    if (menuScreen) menuScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    melodySound.currentTime = 0;
    melodySound.play().catch(() => {});

    setMenuActive(false);
    gameState.isIntro = false;

    // Reset game state for new game
    gameState.pokemonCaptured = [];
    gameState.pokemonEscaped  = [];
    gameState.currentPosition = { r: 0, c: 0 };
    gameState.isGoal          = false;
    gameState.isGameOver      = false;

    import('./hud.js').then(({ updateHUD }) => updateHUD());

    saveGame();
}

// =============================================================================
//  APPLY MAP — Aplica la configuración del mapa al grid
// =============================================================================
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

// =============================================================================
//  RESTART FROM END SCREEN
// =============================================================================
export async function restartFromEndScreen() {
    const slotNumber = gameState.slotNumber;

    const screens = ['.game-over-screen', '.goal-screen', '.results-screen'];
    screens.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('hidden');
    });

    gameState.isGoal        = false;
    gameState.isGameOver    = false;
    gameState.isResultsOpen = false;
    gameState.statsScroll   = 0;

    await startGame(slotNumber);
}
