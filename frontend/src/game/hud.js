
// =============================================================================
//  hud.js — Heads-Up Display (indicadores de estado del jugador)
// =============================================================================
//  RESPONSABILIDAD: Mantener sincronizados los indicadores visuales de HP
//  y Pokéballs con el estado real del juego. Se llama desde cualquier módulo
//  que modifique hp o pokeball para que la interfaz refleje los cambios
//  inmediatamente sin recargar la página.
//
//  FUNCIONES EXPORTADAS:
//    · updateHUD() — refresca todos los indicadores de estado visibles
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM        → actualiza elementos sin recargar la página
//    ✅ Interfaz dinámica/responsiva → los cambios se reflejan en tiempo real
//    ✅ Visualización de datos       → la barra de HP es una visualización de datos
// =============================================================================

import { gameState } from './game-state.js';

export function updateHUD() {

    // Los selectores usan querySelectorAll porque HP y Pokéballs aparecen
    // tanto en la game-screen como en la battle-screen (dos HUDs idénticos)
    const hpDisplays    = document.querySelectorAll('.player-hp span'); // número de HP
    const ballsDisplays = document.querySelectorAll('.player-balls');   // número de Pokéballs

    // ── HP numérico y animación de parpadeo crítico ────────────────────────
    hpDisplays.forEach(el => {
        el.textContent = gameState.hp; // actualizamos el número

        // Si el HP es 4 o menos, añadimos la clase que activa el parpadeo CSS
        // para alertar visualmente al jugador del peligro
        if (gameState.hp <= 4) {
            el.classList.add('critical-hp');
        } else {
            el.classList.remove('critical-hp');
        }
    });

    // ── Contador de Pokéballs ─────────────────────────────────────────────
    ballsDisplays.forEach(el => {
        el.textContent = gameState.pokeball;
    });

    // ── Barra de HP (10 cuadraditos) ──────────────────────────────────────
    // Cada span representa 1 HP: lleno = vida restante, vacío (.lost) = vida perdida
    const hpBars = document.querySelectorAll('.hp-bar');
    hpBars.forEach(bar => {
        const spans = bar.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (index >= gameState.hp) {
                span.classList.add('lost');    // este HP ya se ha perdido: cuadrado vacío
            } else {
                span.classList.remove('lost'); // este HP sigue activo: cuadrado lleno
            }
        });
    });
}