// =============================================================================
//  gamepad-input.js — Gestión de entrada de gamepad/joystick
// =============================================================================
//  RESPONSABILIDAD: Detectar y procesar entrada de gamepads conectados al
//  ordenador (Xbox, PlayStation, genéricos, etc.) y convertir sus botones y
//  ejes en las mismas acciones que el teclado (pressUp, pressDown, pressA, etc.).
//
//  CARACTERÍSTICAS:
//    · Detección automática de gamepads conectados/desconectados
//    · Mapeo estándar: D-Pad y stick izquierdo → movimiento
//    · Botones: A(0), B(1), X(2), Y(3) → acciones del juego
//    · Deadzone configurable para evitar drift del stick analógico
//    · Soporte para vibración/rumble (haptic feedback opcional)
//    · Funciona en paralelo con teclado (ambos activos)
//
//  FUNCIONES EXPORTADAS:
//    · initGamepad() — inicia el polling y detecta gamepads
//    · stopGamepad() — detiene el polling (limpieza)
//    · triggerGamepadRumble(duration, intensity) — vibración háptica
//
//  RELACIÓN CON controls.js:
//    Ambos importan la función dispatch() para enrutar acciones. Este módulo
//    actúa como un adaptador que traduce inputs de gamepad a dispatch().
// =============================================================================

import { gameState } from './game-state.js';
import { flashButton, releaseButton } from './controls.js';

// ─── Configuración ──────────────────────────────────────────────────────────
const DEADZONE = 0.4;        // Umbral para activar stick analógico (0-1)
const POLL_INTERVAL = 50;    // ms entre cheques de gamepad (20 veces/segundo)
const BUTTON_PRESS_DURATION = 120; // ms que se mantiene presionado virtualmente

// ─── Mapeo de botones estándar ──────────────────────────────────────────────
//  Índices de botones según estándar Gamepad API:
//    0 = A (abajo)
//    1 = B (derecha)
//    2 = X (izquierda)
//    3 = Y (arriba)
//    4 = LB (left bumper)
//    5 = RB (right bumper)
//    6 = LT (left trigger)
//    7 = RT (right trigger)
//    8 = Back / Select
//    9 = Start
//    10 = Left stick press
//    11 = Right stick press
//    12-15 = D-Pad (up, down, left, right)
const BUTTON_MAP = {
    0: 'pressA',      // A
    1: 'pressB',      // B
    9: 'pressStart',  // Start
    8: 'pressSelect', // Back/Select
};

// Índices de ejes estándar:
//    0 = Left stick X (-1 izquierda, +1 derecha)
//    1 = Left stick Y (-1 arriba, +1 abajo)
//    2 = Right stick X
//    3 = Right stick Y
const AXIS_MAP = {
    0: { neg: 'pressLeft', pos: 'pressRight' },  // Left stick X
    1: { neg: 'pressUp', pos: 'pressDown' },     // Left stick Y
};

// Índices de D-Pad (algunos gamepads lo reportan como botones):
const DPAD_BUTTON_MAP = {
    12: 'pressUp',
    13: 'pressDown',
    14: 'pressLeft',
    15: 'pressRight',
};

// ─── Estado interno ─────────────────────────────────────────────────────────
let gamepadPollInterval = null;
const gamepadState = new Map(); // Almacena estado anterior de botones/ejes
const activeActions = new Set(); // Acciones activas para evitar duplicados

// ─── Función dispatcher: vincula acciones del gamepad al dispatch de controls.js ────
let dispatchFunction = null;

/**
 * Registra la función dispatch de controls.js para que gamepad.js pueda
 * enrutar acciones. Se llama desde initGamepad().
 * @param {Function} dispatch - Función dispatch de controls.js
 */
export function registerDispatch(dispatch) {
    dispatchFunction = dispatch;
}

// =============================================================================
//  INICIALIZACIÓN Y POLLING
// =============================================================================

/**
 * Inicia la detección y polling de gamepads.
 * Debe llamarse una sola vez al arrancar el juego (desde main.js).
 * @param {Function} dispatch - Función dispatch de controls.js para enrutar acciones
 */
export function initGamepad(dispatch) {
    registerDispatch(dispatch);

    // Detectar conexión de gamepad
    window.addEventListener('gamepadconnected', (event) => {
        console.log(`📡 Gamepad conectado: ${event.gamepad.id}`);
    });

    // Detectar desconexión de gamepad
    window.addEventListener('gamepaddisconnected', (event) => {
        console.log(`📡 Gamepad desconectado: ${event.gamepad.id}`);
        gamepadState.clear();
        activeActions.clear();
    });

    // Iniciar polling continuo
    startGamepadPolling();
}

/**
 * Detiene el polling de gamepads (limpieza).
 * Útil si se descarga el módulo o se cierra el juego.
 */
export function stopGamepad() {
    if (gamepadPollInterval) {
        clearInterval(gamepadPollInterval);
        gamepadPollInterval = null;
    }
    gamepadState.clear();
    activeActions.clear();
}

// ─── Polling ─────────────────────────────────────────────────────────────────

function startGamepadPolling() {
    gamepadPollInterval = setInterval(pollGamepads, POLL_INTERVAL);
}

function pollGamepads() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue; // Slot vacío

        processGamepad(gamepad, i);
    }
}

// =============================================================================
//  PROCESAMIENTO DE GAMEPAD
// =============================================================================

/**
 * Procesa un gamepad individual:
 *   1. Compara botones/ejes actuales con estado anterior
 *   2. Detecta transiciones "release → press"
 *   3. Enruta acciones mediante dispatch()
 */
function processGamepad(gamepad, index) {
    if (!gamepadState.has(index)) {
        gamepadState.set(index, {
            buttons: {},
            axes: {},
        });
    }

    const state = gamepadState.get(index);

    // ── Procesar botones ──────────────────────────────────────────────────────
    processGamepadButtons(gamepad, state, index);

    // ── Procesar ejes (stick analógico y D-Pad de algunos gamepads) ──────────
    processGamepadAxes(gamepad, state, index);
}

function processGamepadButtons(gamepad, state, index) {
    const { buttons } = gamepad;

    for (let i = 0; i < buttons.length; i++) {
        const pressed = buttons[i].pressed;
        const wasPressedBefore = state.buttons[i] || false;

        // Transición: no presionado → presionado
        if (pressed && !wasPressedBefore) {
            const action = BUTTON_MAP[i] || DPAD_BUTTON_MAP[i];
            if (action && dispatchFunction) {
                flashButton(action, true);
                dispatchFunction(action);
            }
        }

        // Transición: presionado → suelto
        if (!pressed && wasPressedBefore) {
            const action = BUTTON_MAP[i] || DPAD_BUTTON_MAP[i];
            if (action) {
                releaseButton(action);
            }
        }

        state.buttons[i] = pressed;
    }
}

function processGamepadAxes(gamepad, state, index) {
    const { axes } = gamepad;

    for (let axisIndex = 0; axisIndex < axes.length; axisIndex++) {
        const value = axes[axisIndex];
        const mapping = AXIS_MAP[axisIndex];

        if (!mapping) continue;

        const wasActive = state.axes[axisIndex] || { pos: false, neg: false };
        let currentState = { pos: false, neg: false };

        // Aplicar deadzone y determinar dirección activa
        if (Math.abs(value) > DEADZONE) {
            if (value > 0) {
                currentState.pos = true;
            } else {
                currentState.neg = true;
            }
        }

        // Detectar transiciones
        if (currentState.pos && !wasActive.pos) {
            const action = mapping.pos;
            if (action && dispatchFunction) {
                flashButton(action, true);
                dispatchFunction(action);
            }
        }
        if (!currentState.pos && wasActive.pos) {
            releaseButton(mapping.pos);
        }

        if (currentState.neg && !wasActive.neg) {
            const action = mapping.neg;
            if (action && dispatchFunction) {
                flashButton(action, true);
                dispatchFunction(action);
            }
        }
        if (!currentState.neg && wasActive.neg) {
            releaseButton(mapping.neg);
        }

        state.axes[axisIndex] = currentState;
    }
}

// =============================================================================
//  HAPTIC FEEDBACK / VIBRACIÓN
// =============================================================================

/**
 * Activa la vibración del gamepad (si lo soporta).
 * Útil para feedback háptico en eventos importantes (captura, daño, etc.).
 * @param {number} [duration=200] - Duración de vibración en ms
 * @param {number} [intensity=0.5] - Intensidad 0-1
 * @example
 *   triggerGamepadRumble(100, 0.8); // Vibración fuerte y corta
 */
export function triggerGamepadRumble(duration = 200, intensity = 0.5) {
    // Se agrega chequeo de comprobación para habilitar-deshabilitar vibración
    const vibrationEnabled = localStorage.getItem('pokesector_vibration') !== 'off';
    if (!vibrationEnabled) return;

    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad || !gamepad.vibrationActuator) continue;

        // Vibración simple: duración + intensidad
        gamepad.vibrationActuator
            .playEffect('dual-rumble', {
                startDelay: 0,
                duration: duration,
                weakMagnitude: intensity * 0.5,
                strongMagnitude: intensity,
            })
            .catch(() => {
                // Algunos gamepads no soportan vibración
            });
    }
}

// =============================================================================
//  UTILIDADES
// =============================================================================

/**
 * Devuelve lista de gamepads conectados (para debug/UI).
 * @returns {Array<Object>} Array de gamepads con id, index y cantidad de botones
 */
export function getConnectedGamepads() {
    const gamepads = navigator.getGamepads();
    const connected = [];

    if (!gamepads) return connected;

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            connected.push({
                index: i,
                id: gamepads[i].id,
                buttons: gamepads[i].buttons.length,
                axes: gamepads[i].axes.length,
            });
        }
    }

    return connected;
}