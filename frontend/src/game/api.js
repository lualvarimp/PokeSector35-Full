// =============================================================================
//  api.js — Conexión con la PokeAPI
// =============================================================================
//  RESPONSABILIDAD: Obtener datos de un Pokémon aleatorio de la primera
//  generación (IDs 1–151) y actualizar la pantalla de combate con su
//  nombre e imagen.
//
//  FUNCIONES EXPORTADAS:
//    · triggerPokemonEncounter() — inicia un encuentro con un Pokémon salvaje
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Consumo de APIs       → usa fetch() a https://pokeapi.co
//    ✅ Manejo de asincronía  → función async/await con try/catch
//    ✅ Manipulación del DOM  → inyecta nombre e imagen en la battle-screen
// =============================================================================

import { gameState } from './game-state.js';

export async function triggerPokemonEncounter() {

    // Limpiamos nombre e imagen antes de la nueva llamada para evitar
    // que aparezcan datos del encuentro anterior ("efecto fantasma")
    const battleName = document.querySelector('.battle-pokemon-name'); // span del nombre en batalla
    const battleImg  = document.querySelector('.battle-pokemon-img');  // img del sprite en batalla

    if (battleName) battleName.textContent = "";
    if (battleImg)  battleImg.src = "";

    // Ocultamos el indicador de "ya capturado" antes de cada encuentro
    const alreadyCaught = document.querySelector('.battle-already-caught');
    if (alreadyCaught) alreadyCaught.classList.add('hidden');

    // Generamos un ID aleatorio entre 1 y 151 (primera generación Pokémon)
    const pokemonId = Math.floor(Math.random() * 151) + 1;

    try {
        // Llamada a la PokeAPI — cumple el requisito de fetch a API externa
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data     = await response.json();

        const pokemonName   = data.name.toUpperCase();       // nombre en mayúsculas
        const pokemonSprite = data.sprites.front_default;    // URL del sprite frontal

        // Guardamos el Pokémon encontrado en el estado global como objeto {id, name}
        // El id se usará después para la Pokédex ordenada y para evitar duplicados
        gameState.currentWildPokemon = { id: pokemonId, name: pokemonName };
        gameState.isBattle = true; // activamos el flag de combate para bloquear movimiento

        // Inyectamos nombre y sprite en el DOM de la pantalla de batalla
        const battleNameEl = document.querySelector('.battle-pokemon-name');
        const battleImgEl  = document.querySelector('.battle-pokemon-img');

        if (battleNameEl) battleNameEl.textContent = pokemonName;
        if (battleImgEl)  battleImgEl.src = pokemonSprite;

        // Comprobamos si este Pokémon ya está en la Pokédex del slot
        // (incluye capturas de partidas anteriores + la partida actual)
        const isAlreadyCaptured = gameState.slotPokedex.some(p => p.id === pokemonId)
            || gameState.pokemonCaptured.some(p => p.id === pokemonId);
        if (isAlreadyCaptured && alreadyCaught) {
            alreadyCaught.classList.remove('hidden');
        }

        // Cambiamos de pantalla: ocultamos el mapa y mostramos la batalla
        const gameScreen   = document.querySelector('.game-screen');
        const battleScreen = document.querySelector('.battle-screen');

        if (gameScreen && battleScreen) {
            gameScreen.classList.add('hidden');
            battleScreen.classList.remove('hidden');
        }

    } catch (error) {
        // Si la API falla (sin conexión, timeout…) lo registramos en consola
        // El juego no se rompe: el jugador simplemente no entra en combate
        console.error("Error al obtener el Pokémon de la API:", error);
    }
}