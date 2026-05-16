// =============================================================================
//  sounds.js — Recursos de audio del juego
// =============================================================================
//  Paths adjusted for Vite: assets are served from /public/
//
//  CAMBIO EN ESTA VERSIÓN:
//  - melodySound → Sistema de música aleatoria (10 pistas)
//  - Todas las demás pistas de sonido se mantienen igual
// =============================================================================

// ── MÚSICA DE FONDO (ALEATORIA CON LOOP) ────────────────────────────────────
// 10 pistas diferentes que se reproducen de forma aleatoria en cada partida
// Se repiten constantemente en loop durante la partida

export const MELODY_TRACKS = [
  {
    name: 'Cartridge Route',
    path: '/sounds/soundtrack/cartridge-route.mp3'
  },
  {
    name: 'Cobblestone Mornings',
    path: '/sounds/soundtrack/cobblestone-mornings.mp3'
  },
  {
    name: 'High Score Morning',
    path: '/sounds/soundtrack/high-score-morning.mp3'
  },
  {
    name: 'Level One Arrival',
    path: '/sounds/soundtrack/level-one-arrival.mp3'
  },
  {
    name: 'Morning Sun at the Gate',
    path: '/sounds/soundtrack/morning-sun-at-the-gate.mp3'
  },
  {
    name: 'Over the Hilltop',
    path: '/sounds/soundtrack/over-the-hilltop.mp3'
  },
  {
    name: 'Pocket Kingdom Map',
    path: '/sounds/soundtrack/pocket-kingdom-map.mp3'
  },
  {
    name: 'Pocket Mountain Ascent',
    path: '/sounds/soundtrack/pocket-mountain-ascent.mp3'
  },
  {
    name: "The Mayor's Porch",
    path: '/sounds/soundtrack/the-mayors-porch.mp3'
  },
  {
    name: 'The Sunny Coast',
    path: '/sounds/soundtrack/the-sunny-coast.mp3'
  },
];

/**
 * Crea instancias de Audio para todas las pistas
 * Se llama una sola vez al cargar el módulo
 */
const melodyInstances = MELODY_TRACKS.map(track => ({
  ...track,
  audio: new Audio(track.path)
}));

/**
 * Devuelve una instancia de Audio de forma aleatoria
 * La música tiene loop habilitado para repetirse constantemente
 * @returns {HTMLAudioElement} Elemento audio aleatorio
 */
export function getRandomMelodyTrack() {
  const randomTrack = melodyInstances[Math.floor(Math.random() * melodyInstances.length)];
  randomTrack.audio.loop = true; // Asegurar que loop está habilitado
  randomTrack.audio.volume = 0.3; // ← Volumen más bajo (máximo 1.0)
  return randomTrack.audio;
}

/**
 * Devuelve el nombre de la pista aleatoria (para debug/créditos)
 * @returns {string} Nombre de la pista
 */
export function getRandomMelodyTrackName() {
  const randomTrack = melodyInstances[Math.floor(Math.random() * melodyInstances.length)];
  return randomTrack.name;
}

// ── SONIDOS DEL JUEGO (SE MANTIENEN IGUAL) ──────────────────────────────────

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