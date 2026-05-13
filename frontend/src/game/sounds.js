// =============================================================================
//  sounds.js — Recursos de audio del juego
// =============================================================================
//  Paths adjusted for Vite: assets are served from /public/assets/
// =============================================================================

export const melodySound   = new Audio('/sounds/melody.mp3');
melodySound.loop = true;

export const themeSound    = new Audio('/sounds/theme.mp3');
export const stepSound     = new Audio('/sounds/step.mp3');
export const crashSound    = new Audio('/sounds/crash.mp3');
export const goalSound     = new Audio('/sounds/goal.mp3');
export const clickSound    = new Audio('/sounds/click.mp3');
export const eraseSound    = new Audio('/sounds/erase.mp3');
export const capturedSound = new Audio('/sounds/captured.mp3');
export const escapedSound  = new Audio('/sounds/escaped.mp3');
export const runawaySound  = new Audio('/sounds/runaway.mp3');
export const gameOverSound = new Audio('/sounds/game-over.mp3');