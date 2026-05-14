// =============================================================================
//  save.js — Volcado de datos de partida al backend
// =============================================================================
//  RESPONSABILIDAD: Orquestar el guardado completo de una partida finalizada
//  con éxito (meta alcanzada) hacia el backend. Coordina las llamadas a
//  slots, pokédex, ranking y replays en un único flujo.
//
//  Se llama desde game-state.js → saveToBackend() cuando el jugador
//  registrado llega a la meta.
// =============================================================================

import { updateSlot, getSlot } from './slots.js';
import { addCapturedPokemon } from './pokedex.js';
import { createRanking } from './ranking.js';
import { createReplay } from './replays.js';
import { getUserId } from './http.js';

export async function saveGameToBackend(gameState, slotNumber) {
  const userId = getUserId();
  if (!userId) return;

  try {
    // 1. Update slot with final state
    await updateSlot(slotNumber, {
      hp: gameState.hp,
      pokeball: gameState.pokeball,
      position_r: gameState.currentPosition.r,
      position_c: gameState.currentPosition.c,
      is_goal: gameState.isGoal,
      is_game_over: gameState.isGameOver,
    });

    // 2. Save captured pokemon to pokedex
    for (const pokemon of gameState.pokemonCaptured) {
      try {
        await addCapturedPokemon({
          pokemon_id: pokemon.id,
          pokemon_name: pokemon.name,
          slot_id: gameState.slotDbId || null,
        });
      } catch (e) {
        // Pokemon might already exist in pokedex, ignore
        console.warn('Pokemon already in pokedex or error:', e.message);
      }
    }

    // 3. Save ranking entry
    const totalEncounters = gameState.pokemonCaptured.length + gameState.pokemonEscaped.length;
    if (totalEncounters >= 10) {
      try {
        await createRanking({
          captured_count: gameState.pokemonCaptured.length,
          escaped_count: gameState.pokemonEscaped.length,
          difficulty_id: gameState.difficultyId || 'normal',
          explorer_name: gameState.playerName || null,
        });
      } catch (e) {
        console.warn('Error saving ranking:', e.message);
      }
    }

    // 4. Save replay from localStorage and clear it
    const replayRaw = localStorage.getItem('pokesector_replay');
    if (replayRaw) {
      try {
        const movements = JSON.parse(replayRaw);
        const slot = await getSlot(slotNumber);
        if (slot && slot.id) {
          await createReplay(slot.id, movements);
        }
        localStorage.removeItem('pokesector_replay');
      } catch (e) {
        console.warn('Error saving replay:', e.message);
      }
    }

    console.log('✅ Game data saved to backend successfully');
  } catch (error) {
    console.error('❌ Error saving game to backend:', error);
  }
}
