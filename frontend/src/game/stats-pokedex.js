// =============================================================================
//  stats-pokedex.js — Vista Pokédex de estadísticas
// =============================================================================
//  RESPONSABILIDAD: Renderizar la colección global de Pokémon capturados en
//  todas las partidas, con soporte para filtrado por letra inicial usando
//  los botones ◀ y ▶ del mando.
//
//  FUNCIONES EXPORTADAS:
//    · initPokedex()      — construye la instancia Pokedex con datos del localStorage
//    · renderPokedexView() — dibuja la lista filtrada de la Pokédex en .game-list
//
//  VARIABLE EXPORTADA:
//    · pokedex — instancia activa de la clase Pokedex (usada por stats.js para filtrar)
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ POO                     → usa instancias de las clases Pokemon y Pokedex
//    ✅ Filtrado de información  → Pokedex.nextFilter()/prevFilter() filtran por letra
//    ✅ Visualización de datos   → lista ordenada de la colección global con contador
//    ✅ localStorage             → lee pokesector_global para construir la Pokédex
// =============================================================================

import { Pokedex } from './pokemon.js';
import { setInfoStats } from './stats-ui.js';
import { gameState } from './game-state.js';
import * as api from '../services/apiService.js';

export let pokedex = new Pokedex();

export async function initPokedex() {
    let allCapturedData = [];

    if (api.isLoggedIn()) {
        try {
            // Filtrar siempre por el slot actual: la pokédex muestra solo
            // los pokémon capturados en este slot, no en todos los slots
            const slotId = gameState.slotDbId || null;
            const pokedexFromBD = await api.getPokedex(slotId);

            // Deduplicar por si hubiera duplicados legacy en BD
            const seen = new Set();
            allCapturedData = pokedexFromBD
                .filter(p => {
                    if (seen.has(p.pokemon_id)) return false;
                    seen.add(p.pokemon_id);
                    return true;
                })
                .map(p => ({ id: p.pokemon_id, name: p.pokemon_name }));

            // Sincronizar localStorage con los datos del slot actual
            const globalRaw = localStorage.getItem('pokesector_global');
            const global = globalRaw ? JSON.parse(globalRaw) : { playerName: '' };
            global.allCaptured = allCapturedData;
            localStorage.setItem('pokesector_global', JSON.stringify(global));
        } catch (e) {
            const globalRaw = localStorage.getItem('pokesector_global');
            allCapturedData = globalRaw ? (JSON.parse(globalRaw).allCaptured || []) : [];
        }
    } else {
        // Sin sesión: los pokémon capturados en esta partida están en gameState
        allCapturedData = gameState.pokemonCaptured.map(p => ({ id: p.id, name: p.name }));
    }

    pokedex = new Pokedex(allCapturedData);
}

// Dibuja la vista Pokédex en el .game-list con el filtro activo aplicado.
// Se llama al entrar en la vista y cada vez que el jugador cambia el filtro.
export function renderPokedexView() {
    const gameList = document.querySelector('.game-list');
    if (!gameList) return;

    gameList.textContent = ''; // limpiamos antes de redibujar

    setInfoStats('pokedex'); // cambiamos instrucciones: mostramos "B/ESC: Volver atrás"

    // Cabecera: nombre de la vista + filtro activo + contador "filtrados/total"
    const filtered = pokedex.getFilteredEntries(); // entradas según el filtro activo
    const header = document.createElement('p');
    /*header.innerHTML = `<strong>POKÉDEX ${pokedex.getFilterLabel()}</strong> <span style="font-weight:400">${filtered.length}/${pokedex.total}</span>`;*/
    /*header.innerHTML = `<strong>POKÉDEX ${pokedex.getFilterLabel()}</strong> <span style="font-weight:400">${pokedex.total}/151</span>`;*/
    // Contador adaptativo: sin filtro muestra X/151 (capturados sobre el máximo posible
    // de la primera generación), con filtro de letra muestra los Pokémon de esa letra
    // sobre el total capturado, para que el jugador siempre tenga contexto del resultado.
    const isFiltered = pokedex.activeFilter !== null;
    header.innerHTML = `<strong>POKÉDEX ${pokedex.getFilterLabel()}</strong> <span style="font-weight:400">${isFiltered ? `${filtered.length}/${pokedex.total}` : `${pokedex.total}/151`}</span>`;
    gameList.appendChild(header);

    // Instrucción de filtrado por letra
    const hint = document.createElement('p');
    hint.innerHTML = '<span style="font-size:0.73rem">◀ ▶ Filtrar por letra</span>';
    gameList.appendChild(hint);

    // Lista de Pokémon filtrados
    if (filtered.length === 0) {
        const p = document.createElement('p');
        // Mensaje diferente según si la colección está vacía o solo el filtro no tiene resultados
        p.textContent = pokedex.total === 0 ? 'Ninguno todavía' : 'Sin resultados';
        gameList.appendChild(p);
    } else {
        // Cada entrada usa pokemon.toString() que devuelve "#007 Squirtle"
        filtered.forEach((pokemon, i) => {
            const p = document.createElement('p');
            p.textContent = `${i + 1}. ${pokemon.toString()}`;
            gameList.appendChild(p);
        });
    }
}