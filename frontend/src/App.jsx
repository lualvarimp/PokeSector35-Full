import { useState, useEffect } from 'react';
import { useGameInit } from './hooks/useGameInit.js';
import MenuScreen from './components/MenuScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import BattleScreen from './components/BattleScreen.jsx';
import StatsScreen from './components/StatsScreen.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import GameControls from './components/GameControls.jsx';

// =============================================================================
//  App.jsx — Componente principal React
// =============================================================================
//  Orquesta los componentes de cada pantalla del juego y arranca el motor
//  Vanilla JS a través del hook personalizado useGameInit.
//
//  Hooks utilizados:
//  · useGameInit (custom): inicializa main.js tras el primer render (useEffect + useRef + useState interno)
//  · useState: gestiona el nombre del explorador que aparece en el menú
//  · useEffect: sincroniza playerName con localStorage al cargar la app
//
//  IMPORTANTE: React actúa solo como contenedor que renderiza el DOM correcto.
//  Toda la lógica del juego (movimiento, menú, batalla, etc.) sigue siendo
//  Vanilla JS manipulando el DOM directamente. Esto garantiza que los controles,
//  las clases CSS y los selectores del juego funcionen exactamente igual.
// =============================================================================

export default function App() {
  const { ready, error } = useGameInit();
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pokesector_explorer_name');
    if (saved && saved.trim() !== '') {
      setPlayerName(saved.trim());
    }

    // Cargar sticker guardado, o nosticker por defecto
    const savedSticker = localStorage.getItem('pokesector_sticker') || '/img/stickers/nosticker.webp';
    const stickerImg = document.querySelector('.sticker img');
    if (stickerImg) stickerImg.src = savedSticker;
  }, []);

  return (
    <main className="gameboy">

      <h1 className='logo'>PokéSector 35 - El misterio de los Pokémon salvajes</h1>

      <section className="bezel">

        <div className="speaker"></div>
        <div className="light-position">
          <div className="red-light"></div>
        </div>
        <div className="gameboy-logo-position">
          <div className="gameboy-logo"></div>
        </div>

        <div className="home-screen">
          <div className="home-start">
            <h2>PULSA START<span>o</span>PULSA ENTER</h2>
          </div>
          <div className="intro-skip">
            <p className="intro-skip-hint hidden"><strong>A/SPACE: </strong>Saltar intro</p>
          </div>
          <div className="animation-home hidden">
            <h2>
              <img
                src="/img/game-freak-nintendo-screen.png"
                alt="Gracias, Game Freak y Nintendo, por un juego tan divertido"
              />
            </h2>
            <h3>
              <img
                src="/img/pokesector-35-screen.png"
                alt="PokéSector 35 - El misterio de los Pokémon salvajes"
              />
            </h3>
            <div className="text-separator"></div>
            <p>Corren malos tiempos para la gente de la región de Kanto.</p>
            <p>El <strong>Team Rocket</strong> ha liberado un virus que ha enfermado a todos los Pokémon salvajes.</p>
            <p>Son muy agresivos y atacan a cualquier ciudadano descuidado.</p>
            <p><strong>TU MISIÓN:</strong><br />
              Capturar el máximo número de Pokémon, llevarlos al profesor Oak y que encuentre una cura.
            </p>
            <p><strong>IMPORTANTE:</strong><br />
              Llega a la meta antes de quedarte sin vida o tu esfuerzo de poco habrá servido y los Pokémon
              capturados escaparán.
            </p>
            <p>Prepárate y disfruta de una aventura épica en...</p>
            <p>¡POKÉSECTOR 35!</p>
          </div>
        </div>

        <MenuScreen />
        <GameScreen />
        <BattleScreen />
        <StatsScreen />
        <GameOverScreen />

      </section>

      <div className='logo'>
        <img
          src="/img/pokesector-35-console.png"
          alt="PokéSector 35 - El misterio de los Pokémon salvajes"
        />
      </div>
      <div className='sticker'>
        <img src='/img/stickers/nosticker.webp' alt='' />
      </div>

      <GameControls />

    </main>
  );
}