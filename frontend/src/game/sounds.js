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
    path: '/pokesector35/sounds/soundtrack/cartridge-route.mp3'
  },
  {
    name: 'Cobblestone Mornings',
    path: '/pokesector35/sounds/soundtrack/cobblestone-mornings.mp3'
  },
  {
    name: 'High Score Morning',
    path: '/pokesector35/sounds/soundtrack/high-score-morning.mp3'
  },
  {
    name: 'Level One Arrival',
    path: '/pokesector35/sounds/soundtrack/level-one-arrival.mp3'
  },
  {
    name: 'Morning Sun at the Gate',
    path: '/pokesector35/sounds/soundtrack/morning-sun-at-the-gate.mp3'
  },
  {
    name: 'Over the Hilltop',
    path: '/pokesector35/sounds/soundtrack/over-the-hilltop.mp3'
  },
  {
    name: 'Pocket Kingdom Map',
    path: '/pokesector35/sounds/soundtrack/pocket-kingdom-map.mp3'
  },
  {
    name: 'Pocket Mountain Ascent',
    path: '/pokesector35/sounds/soundtrack/pocket-mountain-ascent.mp3'
  },
  {
    name: "The Mayor's Porch",
    path: '/pokesector35/sounds/soundtrack/the-mayors-porch.mp3'
  },
  {
    name: 'The Sunny Coast',
    path: '/pokesector35/sounds/soundtrack/the-sunny-coast.mp3'
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

export const themeSound    = new Audio('/pokesector35/sounds/theme.mp3');
export const stepSound     = new Audio('/pokesector35/sounds/step.mp3');
export const crashSound    = new Audio('/pokesector35/sounds/crash.mp3');
export const goalSound     = new Audio('/pokesector35/sounds/goal.mp3');
export const clickSound    = new Audio('/pokesector35/sounds/click.mp3');
export const eraseSound    = new Audio('/pokesector35/sounds/erase.mp3');
export const capturedSound = new Audio('/pokesector35/sounds/captured.mp3');
export const escapedSound  = new Audio('/pokesector35/sounds/escaped.mp3');
export const runawaySound  = new Audio('/pokesector35/sounds/runaway.mp3');
export const gameOverSound = new Audio('/pokesector35/sounds/game-over.mp3');