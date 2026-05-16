// =============================================================================
//  controls.js — Gestión de controles (teclado y botones físicos)
// =============================================================================
//  RESPONSABILIDAD: Capturar todas las entradas del usuario (botones en
//  pantalla y teclado), aplicar un sistema de bloqueo temporal (debounce)
//  para evitar pulsaciones accidentales múltiples, y enrutar cada acción
//  al módulo correspondiente mediante un dispatcher centralizado.
//
//  FUNCIONES EXPORTADAS:
//    · initControls() — registra todos los event listeners al arrancar el juego
//
//  FLUJO DE PRIORIDADES DEL DISPATCH:
//    1. Menú principal abierto      → updateMenu()
//    2. Menú de fin de partida      → handleEndMenuNav()
//    3. Results screen abierta      → updateStatsScreen() (que delega a handleResultsScroll)
//    4. Game over / goal sin menú   → handleGameOverStart() (solo START)
//    5. Stats screen                → updateStatsScreen()
//    6. Batalla                     → updateBattle()
//    7. Movimiento en el mapa       → updatePosition()
//    8. Intro                       → startIntro() (solo START)
// =============================================================================

import { updatePosition }     from './movement.js';
import { startIntro, isIntroInProgress } from './intro.js';
import { updateStatsScreen }  from './stats.js';
import { updateBattle }       from './battle.js';
import {
    handleGameOverStart, handleEndMenuNav,
    isEndMenuOpen, isResultsScreenOpen,
} from './game-over.js';
import { updateMenu, isMenuOpen } from './menu.js';

// ─── Debounce ────────────────────────────────────────────────────────────────
const LOCK_MOVE   = 300;
const LOCK_BATTLE = 350;
const LOCK_MENU   = 250;
const LOCK_INTRO  = 800;

let inputLocked = false;
let lockTimeout = null;

function lock(ms) {
    inputLocked = true;
    clearTimeout(lockTimeout);
    lockTimeout = setTimeout(() => { inputLocked = false; }, ms);
}

// Determina el tiempo de bloqueo según el tipo de acción
function lockTimeFor(action) {
    switch (action) {
        case 'pressStart':              return LOCK_INTRO;
        case 'pressA': case 'pressB':   return LOCK_BATTLE;
        case 'pressUp': case 'pressDown': return LOCK_MOVE;
        default:                        return LOCK_MENU;
    }
}

// =============================================================================
//  FEEDBACK VISUAL — Efecto de pulsación en los botones de la consola
// =============================================================================
const ACTION_TO_BTN = {
    pressUp:     'up-btn',
    pressDown:   'down-btn',
    pressLeft:   'left-btn',
    pressRight:  'right-btn',
    pressStart:  'start-btn',
    pressSelect: 'select-btn',
    pressA:      'a-btn',
    pressB:      'b-btn',
};

function flashButton(action) {
    const id = ACTION_TO_BTN[action];
    if (!id) return;
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
}

// =============================================================================
//  DISPATCH — Enrutador centralizado de acciones
// =============================================================================
// Cada acción pasa por la cadena de prioridades UNA SOLA VEZ.
// Los botones y el teclado llaman ambos a dispatch(), eliminando
// la duplicación que existía anteriormente.

export function dispatch(action) {
    if (inputLocked) return;
    lock(lockTimeFor(action));

    // Feedback visual en el botón correspondiente
    flashButton(action);

    // ── D-Pad: arriba, abajo ─────────────────────────────────────────────
    if (action === 'pressUp' || action === 'pressDown') {
        if (isMenuOpen())    { updateMenu(action); return; }
        if (isEndMenuOpen()) { handleEndMenuNav(action); return; }
        updatePosition(action);
        updateStatsScreen(action);
        return;
    }

    // ── D-Pad: izquierda, derecha ────────────────────────────────────────
    if (action === 'pressLeft' || action === 'pressRight') {
        if (isMenuOpen()) { updateMenu(action); return; }
        updateStatsScreen(action);
        updatePosition(action);
        return;
    }

    // ── START ────────────────────────────────────────────────────────────
    if (action === 'pressStart') {
        if (isMenuOpen())    return;
        if (isEndMenuOpen()) { handleEndMenuNav('pressStart'); return; }
        if (isResultsScreenOpen()) return;
        const handled = handleGameOverStart();
        if (!handled) {
            // Si hay partida en curso (mapa o combate), Start no hace nada
            const gameScreen   = document.querySelector('.game-screen');
            const battleScreen = document.querySelector('.battle-screen');
            if ((gameScreen && !gameScreen.classList.contains('hidden')) ||
                (battleScreen && !battleScreen.classList.contains('hidden'))) return;
            startIntro();
            updateStatsScreen('pressStart');
        }
        return;
    }

    // ── SELECT ───────────────────────────────────────────────────────────
    if (action === 'pressSelect') {
        if (isMenuOpen()) return;
        updateStatsScreen('pressSelect');
        return;
    }

    // ── A ────────────────────────────────────────────────────────────────
    if (action === 'pressA') {
        if (isIntroInProgress()) { startIntro(); return; }
        if (isMenuOpen())    { updateMenu('pressA'); return; }
        if (isEndMenuOpen()) { handleEndMenuNav('pressA'); return; }
        updateStatsScreen('pressA');
        updateBattle('pressA');
        return;
    }

    // ── B ────────────────────────────────────────────────────────────────
    if (action === 'pressB') {
        if (isMenuOpen())    { updateMenu('pressB'); return; }
        if (isEndMenuOpen()) return;
        updateStatsScreen('pressB');
        updateBattle('pressB');
        return;
    }
}

// =============================================================================
//  MAPA DE TECLAS → ACCIONES
// =============================================================================
const KEY_MAP = {
    'ArrowUp':    'pressUp',
    'ArrowDown':  'pressDown',
    'ArrowLeft':  'pressLeft',
    'ArrowRight': 'pressRight',
    'Enter':      'pressStart',
    'Shift':      'pressSelect',
    ' ':          'pressA',
    'Escape':     'pressB',
    'a':          'pressA',
    'A':          'pressA',
    'b':          'pressB',
    'B':          'pressB',
};

// Teclas cuyo comportamiento por defecto debe cancelarse
const PREVENT_DEFAULT_KEYS = new Set(['ArrowUp', 'ArrowDown', ' ', 'Escape']);

// =============================================================================
//  INIT CONTROLS — Punto de entrada
// =============================================================================
export function initControls() {
    // ── Botones físicos (pantalla) ───────────────────────────────────────
    const buttons = {
        'up-btn':     'pressUp',
        'down-btn':   'pressDown',
        'left-btn':   'pressLeft',
        'right-btn':  'pressRight',
        'start-btn':  'pressStart',
        'select-btn': 'pressSelect',
        'a-btn':      'pressA',
        'b-btn':      'pressB',
    };

    Object.entries(buttons).forEach(([id, action]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); dispatch(action); });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); dispatch(action); }, { passive: false });
        }
    });

    // ── Teclado ──────────────────────────────────────────────────────────
    window.addEventListener('keydown', (event) => {
        const action = KEY_MAP[event.key];
        if (!action) return;
        if (PREVENT_DEFAULT_KEYS.has(event.key)) event.preventDefault();
        dispatch(action);
    });
}