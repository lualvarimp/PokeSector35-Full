// =============================================================================
//  controls.js — Gestión de controles (teclado y botones físicos)
// =============================================================================
//  RESPONSABILIDAD: Capturar todas las entradas del usuario (botones en
//  pantalla y teclado), aplicar un sistema de bloqueo temporal (debounce)
//  para evitar pulsaciones accidentales múltiples, y enrutar cada acción
//  al módulo correspondiente.
//
//  FUNCIONES EXPORTADAS:
//    · initControls() — registra todos los event listeners al arrancar el juego
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → eventos sobre botones del HTML
//    ✅ Interfaz responsiva   → mismas acciones disponibles en botón y teclado
// =============================================================================

import { updatePosition }        from './movement.js';
import { startIntro }            from './intro.js';
import { updateStatsScreen }     from './stats.js';
import { updateBattle }          from './battle.js';
import { handleGameOverStart, handleEndMenuNav, isEndMenuOpen, isResultsScreenOpen } from './game-over.js';
import { updateMenu, isMenuOpen } from './menu.js';

const LOCK_MOVE   = 300;
const LOCK_BATTLE = 350;
const LOCK_MENU   = 250;
const LOCK_INTRO  = 800;

let inputLocked = false;
let lockTimeout  = null;

function lock(ms) {
    inputLocked = true;
    clearTimeout(lockTimeout);
    lockTimeout = setTimeout(() => { inputLocked = false; }, ms);
}

export function initControls() {
    const startBtn  = document.getElementById('start-btn');
    const selectBtn = document.getElementById('select-btn');
    const aBtn      = document.getElementById('a-btn');
    const bBtn      = document.getElementById('b-btn');
    const upBtn     = document.getElementById('up-btn');
    const leftBtn   = document.getElementById('left-btn');
    const rightBtn  = document.getElementById('right-btn');
    const downBtn   = document.getElementById('down-btn');

    upBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_MOVE);
        if (isMenuOpen())    { updateMenu('pressUp'); return; }
        if (isEndMenuOpen()) { handleEndMenuNav('pressUp'); return; }
        updatePosition('pressUp');
        updateStatsScreen('pressUp');
    });

    downBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_MOVE);
        if (isMenuOpen())    { updateMenu('pressDown'); return; }
        if (isEndMenuOpen()) { handleEndMenuNav('pressDown'); return; }
        updatePosition('pressDown');
        updateStatsScreen('pressDown');
    });

    leftBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_MENU);
        if (isMenuOpen()) { updateMenu('pressLeft'); return; }
        updateStatsScreen('pressLeft');
        updatePosition('pressLeft');
    });

    rightBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_MENU);
        if (isMenuOpen()) { updateMenu('pressRight'); return; }
        updateStatsScreen('pressRight');
        updatePosition('pressRight');
    });

    startBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_INTRO);
        if (isMenuOpen())    return;
        if (isEndMenuOpen()) { handleEndMenuNav('pressStart'); return; }
        if (isResultsScreenOpen()) return;
        const handled = handleGameOverStart();
        if (!handled) {
            startIntro();
            updateStatsScreen('pressStart');
        }
    });

    selectBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_MENU);
        if (isMenuOpen()) return; // SELECT no hace nada dentro del menú
        updateStatsScreen('pressSelect');
    });

    aBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_BATTLE);
        if (isMenuOpen())    { updateMenu('pressA'); return; }
        if (isEndMenuOpen()) { handleEndMenuNav('pressA'); return; }
        updateStatsScreen('pressA');
        updateBattle('pressA');
    });

    bBtn.addEventListener('click', () => {
        if (inputLocked) return;
        lock(LOCK_BATTLE);
        if (isMenuOpen())    { updateMenu('pressB'); return; }
        if (isEndMenuOpen()) return; // B no hace nada en el menú de fin
        updateStatsScreen('pressB');
        updateBattle('pressB');
    });

    window.addEventListener('keydown', (event) => {
        if (inputLocked) return;

        switch (event.key) {
            case 'ArrowLeft':
                lock(LOCK_MENU);
                if (isMenuOpen()) { updateMenu('pressLeft'); return; }
                updateStatsScreen('pressLeft');
                updatePosition('pressLeft');
                break;
            case 'ArrowRight':
                lock(LOCK_MENU);
                if (isMenuOpen()) { updateMenu('pressRight'); return; }
                updateStatsScreen('pressRight');
                updatePosition('pressRight');
                break;
            case 'ArrowUp':
                event.preventDefault();
                lock(LOCK_MOVE);
                if (isMenuOpen())    { updateMenu('pressUp'); return; }
                if (isEndMenuOpen()) { handleEndMenuNav('pressUp'); return; }
                updatePosition('pressUp');
                updateStatsScreen('pressUp');
                break;
            case 'ArrowDown':
                event.preventDefault();
                lock(LOCK_MOVE);
                if (isMenuOpen())    { updateMenu('pressDown'); return; }
                if (isEndMenuOpen()) { handleEndMenuNav('pressDown'); return; }
                updatePosition('pressDown');
                updateStatsScreen('pressDown');
                break;
            case 'Enter': {
                lock(LOCK_INTRO);
                if (isMenuOpen())    return;
                if (isEndMenuOpen()) { handleEndMenuNav('pressStart'); break; }
                if (isResultsScreenOpen()) break;
                const handled = handleGameOverStart();
                if (!handled) {
                    startIntro();
                    updateStatsScreen('pressStart');
                }
                break;
            }
            case 'Shift':
                lock(LOCK_MENU);
                if (isMenuOpen()) return;
                updateStatsScreen('pressSelect');
                break;
            case ' ':
                event.preventDefault();
                lock(LOCK_BATTLE);
                if (isMenuOpen())    { updateMenu('pressA'); return; }
                if (isEndMenuOpen()) { handleEndMenuNav('pressA'); return; }
                updateStatsScreen('pressA');
                updateBattle('pressA');
                break;
            case 'Escape':
                event.preventDefault();
                lock(LOCK_BATTLE);
                if (isMenuOpen())    { updateMenu('pressB'); return; }
                if (isEndMenuOpen()) return;
                updateStatsScreen('pressB');
                updateBattle('pressB');
                break;
        }
    });
}