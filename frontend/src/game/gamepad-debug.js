// =============================================================================
//  gamepad-debug.js — Utilidades de debug para gamepad (opcional)
// =============================================================================
//  RESPONSABILIDAD: Proporcionar funciones para monitorear y debuguear
//  la entrada de gamepad en desarrollo. Completamente opcional y sin
//  impacto en el gameplay si no se usa.
//
//  FUNCIONES EXPORTADAS:
//    · showGamepadStatus()     — muestra estado actual de gamepads conectados
//    · logGamepadInputs()      — activa logging de todas las pulsaciones
//    · stopLoggingGamepadInputs() — desactiva logging
//    · debugGamepadAxes()      — monitorea ejes en tiempo real
//
//  USO EN CONSOLA (solo desarrollo):
//    import { showGamepadStatus, logGamepadInputs } from './gamepad-debug.js'
//    showGamepadStatus();
//    logGamepadInputs();
// =============================================================================

let isLogging = false;
let logInterval = null;

/**
 * Muestra un resumen de gamepads conectados en consola.
 * @example showGamepadStatus();
 */
export function showGamepadStatus() {
  const gamepads = navigator.getGamepads();
  if (!gamepads || gamepads.length === 0) {
    console.log('❌ No hay gamepads conectados');
    return;
  }

  console.group('📡 Estado de Gamepads Conectados');
  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp) {
      console.log(`  Slot ${i}: [vacío]`);
      continue;
    }

    console.group(`  Gamepad ${i}: ${gp.id}`);
    console.log(`    Botones: ${gp.buttons.length}`);
    console.log(`    Ejes: ${gp.axes.length}`);
    console.log(`    Vibración: ${gp.vibrationActuator ? '✅ Sí' : '❌ No'}`);

    // Mostrar estado actual de botones presionados
    const pressed = gp.buttons
      .map((btn, idx) => (btn.pressed ? idx : null))
      .filter((idx) => idx !== null);
    if (pressed.length > 0) {
      console.log(`    Botones presionados: ${pressed.join(', ')}`);
    }

    // Mostrar ejes activos
    const activeAxes = gp.axes
      .map((val, idx) => (Math.abs(val) > 0.1 ? `${idx}:${val.toFixed(2)}` : null))
      .filter((v) => v !== null);
    if (activeAxes.length > 0) {
      console.log(`    Ejes activos: ${activeAxes.join(', ')}`);
    }

    console.groupEnd();
  }
  console.groupEnd();
}

/**
 * Activa logging en consola de todas las pulsaciones de gamepad.
 * Útil para debugging y verificar que el mapeo de botones funciona.
 * @example logGamepadInputs();
 */
export function logGamepadInputs() {
  if (isLogging) {
    console.log('⚠️  Logging de gamepad ya activo');
    return;
  }

  isLogging = true;
  const lastState = {};

  logInterval = setInterval(() => {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      if (!lastState[i]) lastState[i] = { buttons: {}, axes: {} };

      // Log de botones
      gp.buttons.forEach((btn, idx) => {
        const wasPressed = lastState[i].buttons[idx];
        if (btn.pressed && !wasPressed) {
          console.log(`🔘 Gamepad ${i} - Botón ${idx} presionado`);
        }
        lastState[i].buttons[idx] = btn.pressed;
      });

      // Log de ejes
      gp.axes.forEach((val, idx) => {
        const lastVal = lastState[i].axes[idx] || 0;
        if (Math.abs(val) > 0.5 && Math.abs(lastVal) <= 0.5) {
          console.log(
            `🎮 Gamepad ${i} - Eje ${idx} activo: ${val.toFixed(2)}`
          );
        }
        lastState[i].axes[idx] = val;
      });
    }
  }, 100);

  console.log('✅ Logging de gamepad activado. Presiona botones para ver eventos.');
  console.log('   Usa stopLoggingGamepadInputs() para detener.');
}

/**
 * Detiene el logging de gamepad.
 * @example stopLoggingGamepadInputs();
 */
export function stopLoggingGamepadInputs() {
  if (!isLogging) {
    console.log('⚠️  Logging no activo');
    return;
  }

  isLogging = false;
  if (logInterval) {
    clearInterval(logInterval);
    logInterval = null;
  }
  console.log('❌ Logging de gamepad desactivado');
}

/**
 * Monitorea ejes en tiempo real (stick analógico).
 * Muestra lecturas para debugging de deadzone y sensibilidad.
 * @example debugGamepadAxes();
 */
export function debugGamepadAxes() {
  const interval = setInterval(() => {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    let hasActiveGamepad = false;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;

      const hasActiveAxis = gp.axes.some((val) => Math.abs(val) > 0.05);
      if (!hasActiveAxis) continue;

      hasActiveGamepad = true;
      console.clear();
      console.log('🎮 MONITOR DE EJES (Presiona ESC para detener)');
      console.group(`Gamepad ${i}: ${gp.id}`);

      gp.axes.forEach((val, idx) => {
        const bar = '█'.repeat(Math.abs(val) * 20);
        const label =
          idx === 0
            ? 'Left Stick X (◀▶)'
            : idx === 1
              ? 'Left Stick Y (▲▼)'
              : idx === 2
                ? 'Right Stick X'
                : 'Right Stick Y';
        console.log(
          `  ${label.padEnd(20)} ${bar.padEnd(20)} ${val.toFixed(2)}`
        );
      });

      console.groupEnd();
    }

    if (!hasActiveGamepad) {
      clearInterval(interval);
      console.log('Monitor finalizado (sin ejes activos)');
    }
  }, 100);
}

/**
 * Prueba de vibración: activa rumble en todos los gamepads conectados.
 * @param {number} [duration=500] - Duración en ms
 * @param {number} [intensity=0.8] - Intensidad 0-1
 * @example testRumble(500, 0.8);
 */
export function testRumble(duration = 500, intensity = 0.8) {
  const gamepads = navigator.getGamepads();
  if (!gamepads) {
    console.log('❌ No hay gamepads conectados');
    return;
  }

  let triggered = false;

  for (let i = 0; i < gamepads.length; i++) {
    const gp = gamepads[i];
    if (!gp || !gp.vibrationActuator) continue;

    triggered = true;
    gp.vibrationActuator
      .playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: intensity * 0.5,
        strongMagnitude: intensity,
      })
      .then(() => {
        console.log(
          `✅ Rumble activado en Gamepad ${i} (${duration}ms, ${intensity})`
        );
      })
      .catch((err) => {
        console.log(
          `❌ Error en rumble Gamepad ${i}: ${err.message}`
        );
      });
  }

  if (!triggered) {
    console.log(
      '❌ Ningún gamepad conectado soporta vibración'
    );
  }
}

// ─── Auto-exportar en consola para fácil acceso ───────────────────────────────
// En desarrollo, puedes usar estas funciones directamente en la consola del navegador:
// - showGamepadStatus()
// - logGamepadInputs()
// - stopLoggingGamepadInputs()
// - debugGamepadAxes()
// - testRumble()

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__gamepadDebug = {
    showGamepadStatus,
    logGamepadInputs,
    stopLoggingGamepadInputs,
    debugGamepadAxes,
    testRumble,
  };
}