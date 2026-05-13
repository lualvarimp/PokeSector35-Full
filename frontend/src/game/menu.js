// =============================================================================
//  menu.js — Fachada del sistema de menús
// =============================================================================
//  RESPONSABILIDAD: Re-exportar las funciones públicas del menú para que
//  los consumidores existentes (controls.js, intro.js, game-over.js) sigan
//  usando `import { showMenu, updateMenu, isMenuOpen } from './menu.js'`
//  sin cambios.
//
//  ESTRUCTURA INTERNA:
//    menu-nav.js        — Estado, cursor, vistas, enrutador central
//    menu-start.js      — Flujo de inicio/continuar partida, slots, startGame
//    menu-customize.js  — Personalización: color, explorador, dificultad
//    menu-account.js    — Cuenta: login, registro, logout, borrar cuenta
//    menu-ranking.js    — Ranking: carga, renderizado, scroll
//
//  IMPORTANTE: Los imports de los submódulos aquí abajo NO son innecesarios.
//  Cada submódulo ejecuta registerHandler() al cargarse, registrando sus
//  handlers en el enrutador de menu-nav.js. Sin estos imports, las vistas
//  no responderían a las acciones del usuario.
// =============================================================================

// ── Funciones públicas del menú ──────────────────────────────────────────────
export { showMenu, updateMenu, isMenuOpen } from './menu-nav.js';
export { restartFromEndScreen }             from './menu-start.js';

// ── Carga de submódulos (registran sus handlers al importarse) ───────────────
import './menu-start.js';
import './menu-customize.js';
import './menu-account.js';
import './menu-ranking.js';
import './menu-pokedex.js';