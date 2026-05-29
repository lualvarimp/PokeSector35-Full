// =============================================================================
//  main.js — Punto de entrada de la aplicación
// =============================================================================
//  RESPONSABILIDAD: Orquestar el arranque del juego. Lee los datos guardados
//  en localStorage, restaura el estado visual correcto según la situación
//  en la que se quedó la partida, e inicializa los controles y el HUD.
//
//  FUNCIONES:
//    · loadGame() — función principal de arranque (privada, llamada en 'load')
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ localStorage          → lee pokesector_save y pokesector_global al arrancar
//    ✅ Manipulación del DOM  → restaura la pantalla correcta sin recargar lógica
//    ✅ Guardar preferencias  → recupera nombre del explorador y posición guardada
// =============================================================================

import { gameState, sanitizeExplorerName, updateExplorerHUD } from './game-state.js';
import { updateHUD } from './hud.js';
import { initControls, dispatch } from './controls.js';
import { initGamepad } from './gamepad-input.js';
import { updateGoalScreen } from './movement.js';
import { getRandomMelodyTrack, themeSound } from './sounds.js';
import { openGoalMenu } from './game-over.js';

async function loadGame() {
    // 0. PRECARGA DE AUDIO — antes que nada, asegurar que theme.mp3 está en memoria
    // Esto es crítico en móvil donde los navegadores no precargan por defecto.
    // El usuario verá la pantalla de "PULSA START" mientras el audio se carga en segundo plano.
    themeSound.preload = 'auto';
    themeSound.load();

    // 1. Datos globales persistentes (nombre + colección total)
    const globalRaw = localStorage.getItem('pokesector_global');
    if (globalRaw) {
        const global = JSON.parse(globalRaw);
        // Sanitizar: el username NUNCA debe aparecer como nombre de explorador
        gameState.playerName = sanitizeExplorerName(global.playerName);
        updateExplorerHUD();
    }

    // 2. Partida en curso
    const savedData = localStorage.getItem('pokesector_save');
    if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Sanitizar: el username NUNCA debe aparecer como nombre de explorador
        gameState.playerName      = sanitizeExplorerName(parsedData.playerName || gameState.playerName);
        gameState.hp              = parsedData.hp          ?? 10;
        gameState.pokeball        = parsedData.pokeball    ?? 5;
        gameState.pokemonCaptured = parsedData.pokemonCaptured || [];
        gameState.pokemonEscaped  = parsedData.pokemonEscaped  || [];
        gameState.isGoal          = parsedData.isGoal     || false;
        gameState.isGameOver      = parsedData.isGameOver || false;
        gameState.slotNumber      = parsedData.slotNumber  || null;
        gameState.slotDbId        = parsedData.slotDbId    || null;

        if (parsedData.currentPosition) {
            const { r, c } = parsedData.currentPosition;
            gameState.currentPosition = { r, c };

            const player    = document.getElementById('player');
            const savedCell = document.querySelector(`div[data-r="${r}"][data-c="${c}"]`);
            if (player && savedCell) {
                savedCell.appendChild(player);
            }
        }

        updateExplorerHUD();

        const homeScreen = document.querySelector('.home-screen');

        // ── Restaurar personalización guardada dentro del save ─────────────
        // La personalización vive en gameState (no en claves individuales).
        // La aplicamos visualmente y restauramos el mapa de la dificultad.
        if (parsedData.difficultyId || parsedData.difficulty) {
            const { DIFFICULTY_CONFIG } = await import('./menu-config.js');
            const diffId     = parsedData.difficultyId || (parsedData.difficulty && parsedData.difficulty.id);
            const fullConfig = DIFFICULTY_CONFIG[diffId];

            // Restauramos gameState con la personalización guardada
            gameState.difficultyId = diffId || null;
            gameState.difficulty   = parsedData.difficulty || null;

            // Aplicamos el mapa visualmente
            if (fullConfig) {
                for (let r = 0; r < 5; r++) {
                    for (let c = 0; c < 7; c++) {
                        const cell = document.querySelector(`div[data-r="${r}"][data-c="${c}"]`);
                        if (!cell) continue;
                        const clase = fullConfig.map[r * 7 + c];
                        cell.classList.remove('rock', 'wild', 'goal');
                        if (clase) cell.classList.add(clase);
                    }
                }
            }
        }
        if (parsedData.explorer) {
            const { EXPLORERS } = await import('./menu-config.js');
            const explorer = EXPLORERS.find(e => e.id === parsedData.explorer);
            if (explorer) {
                const playerImg = document.querySelector('#player img');
                if (playerImg) playerImg.src = explorer.src;
            }
            gameState.explorer = parsedData.explorer;
        }
        if (parsedData.color) {
            document.documentElement.style.setProperty('--gameboy', parsedData.color);
            gameState.color = parsedData.color;
        } else {
            // El save no tiene color → usar el elegido en personalización si existe
            const savedColor = localStorage.getItem('pokesector_color');
            if (savedColor) {
                document.documentElement.style.setProperty('--gameboy', savedColor);
                gameState.color = savedColor;
            }
        }

        if (gameState.isGameOver) {
            homeScreen.classList.add('hidden');
            document.querySelector('.game-over-screen').classList.remove('hidden');
        } else if (gameState.isGoal) {
            homeScreen.classList.add('hidden');
            updateGoalScreen();
            document.querySelector('.goal-screen').classList.remove('hidden');
            openGoalMenu();
        } else {
            // Partida en curso normal: el juego está listo, no bloqueamos
            homeScreen.classList.add('hidden');
            document.querySelector('.game-screen').classList.remove('hidden');
            // Los navegadores bloquean autoplay sin interacción previa del usuario.
            // Intentamos reproducir; si falla (política de autoplay), esperamos al
            // primer keydown para arrancarlo.
            const randomMelodyTrack = getRandomMelodyTrack();
            randomMelodyTrack.currentTime = 0;
            gameState.currentMelody = randomMelodyTrack;
            randomMelodyTrack.play().catch(() => {
                const unlock = () => {
                    randomMelodyTrack.play().catch(() => {});
                    window.removeEventListener('keydown', unlock);
                };
                window.addEventListener('keydown', unlock);
            });
        }

    } else {
        // Sin partida guardada: estamos en la home-screen esperando que el jugador
        // pulse START. Activamos isIntro para bloquear las direcciones hasta que
        // el jugador inicie la intro y askPlayerName() la desactive correctamente.
        // Esto evita que una pulsación rápida de dirección antes de START
        // dispare un encuentro Pokémon con la game-screen aún no visible.
        gameState.isIntro = true;

        // Aplicar color guardado en personalización (persiste entre sesiones)
        const savedColor = localStorage.getItem('pokesector_color');
        if (savedColor) {
            document.documentElement.style.setProperty('--gameboy', savedColor);
            gameState.color = savedColor;
        }
    }

    // 3. Controles
    initControls();

    // 3.5 Gamepad/Joystick
    initGamepad(dispatch);

    // 4. HUD
    updateHUD();
}

// In the React app, this module is imported via dynamic import() after the DOM
// is mounted by React. The 'load' event has already fired, so we run immediately.
if (document.readyState === 'complete') {
    loadGame();
} else {
    window.addEventListener('load', () => loadGame());
}