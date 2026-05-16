// =============================================================================
//  battle.js — Lógica de combate
// =============================================================================
//  RESPONSABILIDAD: Gestionar las acciones del jugador durante un encuentro
//  Pokémon (lanzar Pokéball o huir) y sus consecuencias sobre HP, Pokéballs
//  y listas de capturas/huidas.
//
//  FUNCIONES EXPORTADAS:
//    · updateBattle(action) — procesa una acción de combate ('pressA'/'pressB')
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → muestra/oculta mensaje de resultado en pantalla
//    ✅ localStorage          → llama a saveGame() tras cada acción para persistir
//    ✅ Visualización datos   → actualiza HUD (HP bar, contador de Pokéballs)
// =============================================================================

import { gameState, saveGame } from './game-state.js';
import { capturedSound, escapedSound, runawaySound } from './sounds.js';
import { triggerGamepadRumble } from './gamepad-input.js';
import { updateHUD } from './hud.js';
import { triggerGameOver } from './game-over.js';

export function updateBattle(action) {

    // Si no hay combate activo, ignoramos la acción
    if (!gameState.isBattle) return;

    const messageBox = document.getElementById('battle-message'); // caja de mensaje flotante

    // Si el mensaje de resultado ya está visible, bloqueamos nuevas acciones
    // hasta que desaparezca (evita doble pulsación durante los 2 segundos)
    if (messageBox && !messageBox.classList.contains('hidden')) return;

    let messageBattle = "";                                   // texto que se mostrará al jugador
    const battleScreen = document.querySelector('.battle-screen');
    const gameScreen = document.querySelector('.game-screen');

    // currentWildPokemon es { id, name } — guardado por api.js
    const pokemon = gameState.currentWildPokemon;

    // ── ACCIÓN A: lanzar Pokéball ─────────────────────────────────────────
    if (action === 'pressA') {

        if (gameState.pokeball <= 0) {
            // Sin Pokéballs: huida forzada con penalización de 1 HP
            messageBattle = "¡No tienes Pokéballs! Huyes y pierdes 1 HP.";
            gameState.hp -= 1;
            runawaySound.currentTime = 0;
            runawaySound.play();

        } else {
            gameState.pokeball -= 1; // gastamos una Pokéball

            // Leemos catchRate desde gameState.difficulty (sobrevive a recargas)
            const catchRate = gameState.difficulty ? gameState.difficulty.catchRate : 0.60;
            const success = Math.random() < catchRate;

            if (success) {
                messageBattle = `Has capturado a ${pokemon.name}`;
                // Guardamos el objeto completo {id, name} para poder ordenar por ID en la Pokédex
                gameState.pokemonCaptured.push({ id: pokemon.id, name: pokemon.name });
                triggerGamepadRumble(100, 0.5);

                // También lo añadimos a la Pokédex del slot para detectar duplicados
                if (!gameState.slotPokedex.some(p => p.id === pokemon.id)) {
                    gameState.slotPokedex.push({ id: pokemon.id, name: pokemon.name });

                }
                capturedSound.play();


            } else {
                gameState.hp -= 2; // fallo: perdemos 2 HP
                messageBattle = `¡Fallaste! Pierdes 2 HP. ${pokemon.name} ha escapado...`;
                gameState.pokemonEscaped.push({ id: pokemon.id, name: pokemon.name });
                triggerGamepadRumble(150, 0.6);
                escapedSound.play();

            }
        }
    }

    // ── ACCIÓN B: huir voluntariamente ────────────────────────────────────
    else if (action === 'pressB') {
        gameState.hp -= 1; // huir tiene coste de 1 HP
        messageBattle = "¡Has huido! Pierdes 1 HP.";
        runawaySound.currentTime = 0;
        runawaySound.play();
    }

    // ── Resultado: mostramos mensaje y volvemos al mapa ───────────────────
    if (messageBattle !== "") {
        updateHUD();   // actualizamos la barra de HP y el contador de Pokéballs
        saveGame();    // persistimos el nuevo estado en localStorage

        // Mostramos el mensaje de resultado en la pantalla de batalla
        messageBox.textContent = messageBattle;
        messageBox.classList.remove('hidden');

        // Tras 2 segundos cerramos el mensaje y volvemos al mapa
        setTimeout(() => {
            gameState.isBattle = false; // desactivamos el flag de combate
            gameState.currentWildPokemon = null;  // limpiamos el Pokémon actual

            messageBox.classList.add('hidden');
            if (battleScreen) battleScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');

            // Si el jugador se ha quedado sin HP, activamos la pantalla de derrota
            if (gameState.hp <= 0) {
                triggerGameOver();
            }
        }, 2000);
    }
}