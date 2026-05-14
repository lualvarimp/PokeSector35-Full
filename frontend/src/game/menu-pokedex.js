// =============================================================================
//  menu-pokedex.js — Pokédex del menú principal
// =============================================================================
//  RESPONSABILIDAD: Cargar y mostrar la Pokédex del slot activo desde el menú
//  principal. Si no hay sesión muestra un mensaje de aviso. Si no hay slot
//  activo permite elegir uno con el D-Pad. Gestiona el scroll (▲▼) y el
//  filtro alfabético (◀▶) de forma independiente a la Pokédex de stats-screen.
//
//  MODOS INTERNOS:
//    · 'slot-select' — el usuario está eligiendo un slot con ▲▼ y A
//    · 'pokedex'     — la Pokédex está cargada y se navega con ▲▼ y ◀▶
//
//  FUNCIONES EXPORTADAS:
//    · onPokedex() — punto de entrada desde menu-nav.js
//
//  REGISTRA HANDLERS PARA:
//    · 'pokedex' — vista de la Pokédex en el menú
// =============================================================================

import { Pokedex }   from './pokemon.js';
import * as api      from '../services/apiService.js';
import { gameState } from './game-state.js';
import {
    showView, playClick, showInfoMessage, registerHandler,
} from './menu-nav.js';

// ── Estado local ─────────────────────────────────────────────────────────────
let menuPokedex   = new Pokedex(); // instancia propia, no comparte estado con stats
let pokedexScroll = 0;
let mode          = 'pokedex';     // 'slot-select' | 'pokedex'
let availableSlots = [];           // slots cargados cuando no hay slot activo
let slotCursor    = 0;             // índice del cursor en el selector de slots

// ── Registrar handler ────────────────────────────────────────────────────────
registerHandler('pokedex', handlePokedex);

// =============================================================================
//  ENTRY POINT
// =============================================================================
export async function onPokedex() {
    if (!api.isLoggedIn()) {
        showInfoMessage(
            'Inicia sesión para acceder a la Pokédex.',
            false
        );
        return;
    }

    // Reset de estado al entrar
    menuPokedex    = new Pokedex();
    pokedexScroll  = 0;
    slotCursor     = 0;
    availableSlots = [];

    showView('pokedex');

    const targetSlotDbId = gameState.slotDbId ?? null;

    if (!targetSlotDbId) {
        await showSlotSelector();
    } else {
        await loadPokedex(targetSlotDbId, gameState.slotNumber);
    }
}

// =============================================================================
//  MODO SLOT-SELECT — muestra los slots disponibles con cursor D-Pad
// =============================================================================
async function showSlotSelector() {
    const list  = document.querySelector('.menu-pokedex .game-list');
    const label = document.querySelector('.pokedex-filter-label');
    if (!list) return;

    list.innerHTML = '<p>Cargando slots...</p>';
    if (label) label.textContent = '';

    try {
        const slots = await api.getSlots();
        availableSlots = slots.filter(s => s.id).sort((a, b) => a.slot_number - b.slot_number);
    } catch (e) {
        list.innerHTML = '<p>Error al cargar los slots.</p>';
        return;
    }

    if (!availableSlots.length) {
        list.innerHTML = '<p>No tienes partidas guardadas todavía.</p>';
        return;
    }

    mode       = 'slot-select';
    slotCursor = 0;
    renderSlotSelector();
}

function renderSlotSelector() {
    const gameList = document.querySelector('.menu-pokedex .game-list');
    const label    = document.querySelector('.pokedex-filter-label');
    if (!gameList) return;

    if (label) label.textContent = 'Elige un slot:';

    gameList.textContent = '';

    // Usamos un ul.menu-list para heredar exactamente los mismos estilos
    // de cursor y sublabel que el resto del menú
    const ul = document.createElement('ul');
    ul.className = 'menu-list';

    const SVG_CURSOR = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,5 0,10" fill="currentColor"/></svg>';

    availableSlots.forEach((slot, i) => {
        const li = document.createElement('li');
        li.className = 'menu-item' + (i === slotCursor ? ' active' : '');

        const cursor = i === slotCursor ? SVG_CURSOR : '';

        const diff = slot.difficulty_id ? slot.difficulty_id.toUpperCase() : '?';
        li.innerHTML = `<span class="menu-cursor">${cursor}</span> SLOT ${slot.slot_number} <span>(${diff})</span>`;

        ul.appendChild(li);
    });

    gameList.appendChild(ul);
}

// =============================================================================
//  MODO POKEDEX — carga y renderiza la Pokédex del slot
// =============================================================================
async function loadPokedex(slotDbId, slotNumber) {
    const list  = document.querySelector('.menu-pokedex .game-list');
    const label = document.querySelector('.pokedex-filter-label');
    const title = document.getElementById('pokedex-title');
    if (!list) return;

    if (title && slotNumber != null) title.textContent = `POKÉDEX: SLOT ${slotNumber}`;

    list.innerHTML = '<p>Cargando...</p>';
    pokedexScroll = 0;
    if (label) label.textContent = '';

    try {
        const rawData = await api.getPokedex(slotDbId);

        // Deduplicar por pokemon_id (consistente con stats-pokedex.js)
        const seen = new Set();
        const cleanData = rawData
            .filter(p => {
                if (seen.has(p.pokemon_id)) return false;
                seen.add(p.pokemon_id);
                return true;
            })
            .map(p => ({ id: p.pokemon_id, name: p.pokemon_name }));

        menuPokedex = new Pokedex(cleanData);
        menuPokedex.filterByLetter(null);
        mode = 'pokedex';
        renderList();
    } catch (e) {
        list.innerHTML = '<p>Error al cargar la Pokédex.</p>';
    }
}

// =============================================================================
//  RENDERIZADO DE LA LISTA DE POKÉMON
// =============================================================================
function renderList() {
    const list  = document.querySelector('.menu-pokedex .game-list');
    const label = document.querySelector('.pokedex-filter-label');
    if (!list) return;

    pokedexScroll = 0;
    list.style.transform = 'translateY(0)';

    if (label) {
        label.textContent = `◀  ${menuPokedex.getFilterLabel()}  ▶`;
    }

    list.textContent = '';

    // Cabecera con contador adaptativo
    const filtered   = menuPokedex.getFilteredEntries();
    const isFiltered = menuPokedex.activeFilter !== null;
    const header     = document.createElement('p');
    header.innerHTML = `<strong>POKÉDEX: </strong> <span style="font-weight:400">${isFiltered ? `${filtered.length}/${menuPokedex.total}` : `${menuPokedex.total}/151`}</span>`;
    list.appendChild(header);

    if (filtered.length === 0) {
        const p = document.createElement('p');
        p.textContent = menuPokedex.total === 0 ? 'Ninguno todavía' : 'Sin resultados';
        list.appendChild(p);
    } else {
        filtered.forEach((pokemon) => {
            const p = document.createElement('p');
            p.textContent = pokemon.toString();
            list.appendChild(p);
        });
    }
}

// =============================================================================
//  HANDLER DE NAVEGACIÓN — enruta según el modo activo
// =============================================================================
function handlePokedex(action) {

    // B — siempre vuelve al menú principal y resetea el estado
    if (action === 'pressB') {
        playClick();
        menuPokedex    = new Pokedex();
        pokedexScroll  = 0;
        mode           = 'pokedex';
        availableSlots = [];
        slotCursor     = 0;
        const title = document.getElementById('pokedex-title');
        if (title) title.textContent = 'POKÉDEX';
        showView('main');
        return;
    }

    // ── Modo selector de slot ─────────────────────────────────────────────
    if (mode === 'slot-select') {
        if (action === 'pressUp') {
            playClick();
            slotCursor = (slotCursor - 1 + availableSlots.length) % availableSlots.length;
            renderSlotSelector();
            return;
        }
        if (action === 'pressDown') {
            playClick();
            slotCursor = (slotCursor + 1) % availableSlots.length;
            renderSlotSelector();
            return;
        }
        if (action === 'pressA') {
            playClick();
            const selectedSlot = availableSlots[slotCursor];
            if (selectedSlot) loadPokedex(selectedSlot.id, selectedSlot.slot_number);
            return;
        }
        return;
    }

    // ── Modo Pokédex ──────────────────────────────────────────────────────

    // ◀▶ — filtro alfabético
    if (action === 'pressLeft' || action === 'pressRight') {
        if (menuPokedex.total === 0) return;
        if (action === 'pressLeft')  menuPokedex.prevFilter();
        if (action === 'pressRight') menuPokedex.nextFilter();
        playClick();
        renderList();
        return;
    }

    // ▲▼ — scroll
    const viewport  = document.querySelector('.pokedex-viewport');
    const list      = document.querySelector('.menu-pokedex .game-list');
    if (!viewport || !list) return;

    const scrollStep = 40;
    const maxScroll  = Math.max(0, list.scrollHeight - viewport.clientHeight);

    if (action === 'pressUp' && pokedexScroll > 0) {
        playClick();
        pokedexScroll = Math.max(0, pokedexScroll - scrollStep);
        list.style.transform = `translateY(-${pokedexScroll}px)`;
    }
    if (action === 'pressDown' && pokedexScroll < maxScroll) {
        playClick();
        pokedexScroll = Math.min(maxScroll, pokedexScroll + scrollStep);
        list.style.transform = `translateY(-${pokedexScroll}px)`;
    }
}