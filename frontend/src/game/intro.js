
// =============================================================================
//  intro.js — Animación de introducción
// =============================================================================
//  RESPONSABILIDAD: Controlar la secuencia de introducción del juego:
//  arrancar la animación de scroll con música, permitir saltarla con Start,
//  y bloquear el movimiento del jugador mientras la intro está activa.
//  IMPORTANTE: al terminar la intro ahora se muestra la menu-screen en lugar
//  de ir directamente al juego. showMenu() desactivará isIntro al terminar.
//
//  FUNCIONES EXPORTADAS:
//    · startIntro() — inicia la intro o la salta si ya está en curso
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → muestra/oculta elementos, controla animación CSS
//    ✅ Interfaz dinámica     → transición fluida entre home-screen y menu-screen
// =============================================================================

import { gameState }  from './game-state.js';
import { themeSound } from './sounds.js';
import { showMenu }   from './menu.js';   // ← ahora redirigimos al menú, no al juego

let introInProgress = false;
let introTimeout;

export function startIntro() {
    const homeStart     = document.querySelector('.home-start');
    const animationHome = document.querySelector('.animation-home');
    const homeScreen    = document.querySelector('.home-screen');

    // CASO A: la intro ya está en curso → la saltamos al pulsar Start de nuevo
    if (introInProgress) {
        skipIntro(homeScreen);
        return;
    }

    // CASO B: la intro aún no ha comenzado → la iniciamos
    if (homeStart && !homeStart.classList.contains('hidden')) {
        introInProgress   = true;
        gameState.isIntro = true; // bloqueamos el movimiento durante toda la intro

        homeStart.classList.add('hidden');
        animationHome.classList.remove('hidden');
        animationHome.style.animationPlayState = 'running';

        themeSound.currentTime = 0;
        themeSound.loop = false;
        themeSound.play();

        introTimeout = setTimeout(() => {
            if (introInProgress) {
                skipIntro(homeScreen);
            }
        }, 35000);
    }
}

function skipIntro(home) {
    introInProgress = false;
    // NOTA: NO desactivamos isIntro aquí. Lo desactivará showMenu() → startGame()
    // cuando el jugador confirme el inicio de partida, para que el bloqueo cubra
    // también el tiempo de navegación en el menú.

    clearTimeout(introTimeout);

    themeSound.pause();
    themeSound.currentTime = 0;

    const animationHome = document.querySelector('.animation-home');
    if (animationHome) {
        animationHome.style.animationPlayState = 'paused';
        animationHome.style.animation  = 'none';
        animationHome.style.transform  = 'translateY(0)';
        animationHome.classList.add('hidden');
    }

    if (home) {
        home.classList.add('hidden');
        // Mostramos el menú principal en lugar de ir directamente al juego
        showMenu();
    }
}