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
//    · startIntro()        — inicia la intro o la salta si ya está en curso
//    · isIntroInProgress() — true si la intro está activa
// =============================================================================

import { gameState }  from './game-state.js';
import { themeSound } from './sounds.js';
import { showMenu }   from './menu.js';

let introInProgress = false;
let introTimeout;
let hintTimeout;
let hintHideTimeout;

export function isIntroInProgress() { return introInProgress; }

export function startIntro() {
    const homeStart     = document.querySelector('.home-start');
    const animationHome = document.querySelector('.animation-home');
    const homeScreen    = document.querySelector('.home-screen');

    // CASO A: la intro ya está en curso → la saltamos
    if (introInProgress) {
        skipIntro(homeScreen);
        return;
    }

    // CASO B: iniciamos la intro
    if (homeStart && !homeStart.classList.contains('hidden')) {
        introInProgress   = true;
        gameState.isIntro = true;

        homeStart.classList.add('hidden');
        animationHome.classList.remove('hidden');
        animationHome.style.animationPlayState = 'running';

        themeSound.currentTime = 0;
        themeSound.loop = false;
        themeSound.play();

        // Mostrar el hint a los 5 segundos
        hintTimeout = setTimeout(() => {
            const hint = document.querySelector('.intro-skip-hint');
            if (hint) hint.classList.remove('hidden');
        }, 5000);

        // Ocultar el hint a los 34 segundos
        hintHideTimeout = setTimeout(() => {
            const hint = document.querySelector('.intro-skip-hint');
            if (hint) hint.classList.add('hidden');
        }, 34000);

        // Fin natural de la intro
        introTimeout = setTimeout(() => {
            if (introInProgress) {
                skipIntro(homeScreen);
            }
        }, 35000);
    }
}

function skipIntro(home) {
    introInProgress = false;

    clearTimeout(introTimeout);
    clearTimeout(hintTimeout);
    clearTimeout(hintHideTimeout);

    const hint = document.querySelector('.intro-skip-hint');
    if (hint) hint.classList.add('hidden');

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
        showMenu();
    }
}