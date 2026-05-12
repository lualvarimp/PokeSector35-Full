import React, { useEffect, useRef } from 'react';

// =============================================================================
//  App.jsx — Componente principal React
// =============================================================================
//  ESTRATEGIA: Renderizar el HTML del juego EXACTAMENTE igual que el original.
//  Los módulos JS del juego se inicializan via useEffect una vez el DOM existe.
//  React actúa solo como contenedor — toda la lógica del juego sigue siendo
//  vanilla JS manipulando el DOM directamente, tal como el juego original.
//  Esto garantiza que los controles, las flechas SVG y los estilos no se rompan.
// =============================================================================

export default function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initialize game modules after DOM is ready
    import('./game/main.js');
  }, []);

  return (
    <main className="gameboy">

      <h1>
        <img src="/assets/img/pokesector-35-console.png" alt="PokéSector 35 - El misterio de los Pokémon salvajes" />
      </h1>

      <section className="bezel">

        <div className="speaker"></div>
        <div className="light-position">
          <div className="red-light"></div>
        </div>
        <div className="gameboy-logo-position">
          <div className="gameboy-logo"></div>
        </div>

        <div className="home-screen">
          {/* Mensaje parpadeante "PULSA START" */}
          <div className="home-start">
            <h2>PULSA START<span>o</span>PULSA ENTER</h2>
          </div>

          {/* Animación de scroll vertical con el texto de la historia */}
          <div className="animation-home hidden">
            <h2>
              <img src="/assets/img/game-freak-nintendo-screen.png"
                alt="Gracias, Game Freak y Nintendo, por un juego tan divertido" />
            </h2>
            <h3>
              <img src="/assets/img/pokesector-35-screen.png"
                alt="PokéSector 35 - El misterio de los Pokémon salvajes" />
            </h3>

            <div className="text-separator"></div>

            <p>Corren malos tiempos para la gente de la región de Kanto.</p>
            <p>El <strong>Team Rocket</strong> ha liberado un virus que ha enfermado a todos los Pokémon
              salvajes.</p>
            <p>Son muy agresivos y atacan a cualquier ciudadano descuidado.</p>
            <p><strong>TU MISIÓN:</strong><br />
              Capturar el máximo número de Pokémon, llevarlos al profesor Oak y que encuentre una cura.
            </p>
            <p><strong>IMPORTANTE:</strong><br />
              Llega a la meta antes de quedarte sin vida o tu esfuerzo de poco habrá servido y los Pokémon
              capturados escaparán.</p>
            <p>Prepárate y disfruta de una aventura épica en...</p>
            <p>¡POKÉSECTOR 35!</p>
          </div>
        </div>

        <div className="menu-screen hidden">
          {/* Vista principal del menú */}
          <div className="menu-main">
            <h2>MENÚ PRINCIPAL</h2>
            <p className="menu-player-name"></p>
            <ul className="menu-list">
              <li data-option="start" className="menu-item active">INICIAR PARTIDA</li>
              <li data-option="customize" className="menu-item"> PERSONALIZAR</li>
              <li data-option="ranking" className="menu-item"> RANKING</li>
              <li data-option="account" className="menu-item"> CUENTA</li>
            </ul>
            <p className="menu-hint"><strong>▲▼:</strong> Seleccionar <br /><strong>A/SPACE:</strong> Elegir</p>
          </div>

          {/* Vista: Iniciar partida (nueva partida / continuar) */}
          <div className="menu-start hidden">
            <h2>MENÚ PRINCIPAL</h2>
            <p className="menu-player-name"></p>
            <ul className="menu-list">
              <li data-start="continue"  className="menu-item active"> CONTINUAR</li>
              <li data-start="new-game"  className="menu-item"> NUEVA PARTIDA</li>
              <li data-start="back"      className="menu-item"> ATRÁS</li>
            </ul>
          </div>

          {/* Vista: Selección de slot */}
          <div className="menu-slots hidden">
            <h2>ELIGE SLOT</h2>
            <ul className="menu-list">
              <li data-slot="1" className="menu-item active">SLOT 1</li>
              <li data-slot="2" className="menu-item"> SLOT 2</li>
              <li data-slot="3" className="menu-item"> SLOT 3</li>
              <li data-slot="back" className="menu-item"> VOLVER</li>
            </ul>
          </div>

          {/* Vista: Mensaje informativo */}
          <div className="menu-info hidden">
            <p className="menu-info-text"></p>
            <ul className="menu-list">
              <li data-action="go-account" className="menu-item active">CREAR CUENTA</li>
              <li data-action="continue-local" className="menu-item"> CONTINUAR SIN CUENTA</li>
              <li data-action="back" className="menu-item"> VOLVER</li>
            </ul>
          </div>

          {/* Vista: Personalizar */}
          <div className="menu-customize hidden">
            <h2>PERSONALIZAR</h2>
            <ul className="menu-list">
              <li data-customize="color" className="menu-item active">COLOR CONSOLA</li>
              <li data-customize="explorer" className="menu-item"> EXPLORADOR</li>
              <li data-customize="difficulty" className="menu-item"> DIFICULTAD</li>
              <li data-customize="back" className="menu-item"> VOLVER</li>
            </ul>
          </div>

          {/* Vista: Selector de color */}
          <div className="menu-color hidden">
            <h2>COLOR CONSOLA</h2>
            <p className="menu-preview-color"></p>
            <p className="menu-hint">
              <strong>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.7em',height:'0.7em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="10,0 0,5 10,10"/></svg>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.7em',height:'0.7em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg>
                :</strong> Cambiar &nbsp; <strong>A/SPACE:</strong> Confirmar &nbsp;
              <strong>B/ESC:</strong> Volver
            </p>
          </div>

          {/* Vista: Selector de explorador */}
          <div className="menu-explorer hidden">
            <h2>EXPLORADOR</h2>
            <div className="menu-explorer-preview">
              <img id="explorer-preview-img" src="" alt="Explorador" />
            </div>
            <p className="menu-hint">
              <strong>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.7em',height:'0.7em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="10,0 0,5 10,10"/></svg>
                <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.7em',height:'0.7em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg>
                :</strong> Cambiar &nbsp; <strong>A/SPACE:</strong> Confirmar &nbsp;
              <strong>B/ESC:</strong> Volver
            </p>
          </div>

          {/* Vista: Selector de dificultad */}
          <div className="menu-difficulty hidden">
            <h2>DIFICULTAD</h2>
            <ul className="menu-list">
              <li data-difficulty="facil" className="menu-item active">FÁCIL</li>
              <li data-difficulty="normal" className="menu-item"> NORMAL</li>
              <li data-difficulty="dificil" className="menu-item"> DIFÍCIL</li>
              <li data-difficulty="infernal" className="menu-item"> INFERNAL</li>
              <li data-difficulty="back" className="menu-item"> VOLVER</li>
            </ul>
          </div>

          {/* Vista: Ranking */}
          <div className="menu-ranking hidden">
            <h2>RANKING</h2>
            <p className="ranking-filter-label"></p>
            <div className="ranking-viewport">
              <div className="ranking-list"></div>
            </div>
            <p className="menu-hint"><strong>▲▼</strong> scroll &nbsp;|&nbsp; <strong>B</strong> volver</p>
          </div>

          {/* Vista: Cuenta */}
          <div className="menu-account hidden">
            <h2>CUENTA</h2>
            <ul className="menu-list">
              <li data-account="login"    className="menu-item active"> INICIAR SESIÓN</li>
              <li data-account="logout"   className="menu-item"> CERRAR SESIÓN</li>
              <li data-account="register" className="menu-item"> CREAR CUENTA</li>
              <li data-account="delete"   className="menu-item"> BORRAR CUENTA</li>
              <li data-account="back"     className="menu-item"> VOLVER</li>
            </ul>
          </div>

          {/* Vista: Confirmación */}
          <div className="menu-confirm hidden">
            <p className="menu-confirm-text"></p>
            <p><strong>A/SPACE:</strong> Confirmar</p>
            <p><strong>B/ESC:</strong> Cancelar</p>
          </div>
        </div>

        <div className="game-screen hidden">
          <div className="screen-grid">
            <div data-row="top" className="full-top">
              <div>
                <h2><span>EXPLORER: Ash</span></h2>
              </div>
            </div>

            {/* Fila 0 */}
            <div data-r="0" data-c="0">
              <div id="player"><img src="/assets/img/character-boy-front.png" alt="Pokémon explorer" /></div>
            </div>
            <div data-r="0" data-c="1" className="wild"></div>
            <div data-r="0" data-c="2"></div>
            <div data-r="0" data-c="3"></div>
            <div data-r="0" data-c="4" className="rock"></div>
            <div data-r="0" data-c="5" className="wild"></div>
            <div data-r="0" data-c="6"></div>

            {/* Fila 1 */}
            <div data-r="1" data-c="0"></div>
            <div data-r="1" data-c="1" className="rock"></div>
            <div data-r="1" data-c="2"></div>
            <div data-r="1" data-c="3" className="wild"></div>
            <div data-r="1" data-c="4"></div>
            <div data-r="1" data-c="5"></div>
            <div data-r="1" data-c="6" className="wild"></div>

            {/* Fila 2 */}
            <div data-r="2" data-c="0" className="wild"></div>
            <div data-r="2" data-c="1"></div>
            <div data-r="2" data-c="2" className="wild"></div>
            <div data-r="2" data-c="3"></div>
            <div data-r="2" data-c="4" className="rock"></div>
            <div data-r="2" data-c="5" className="wild"></div>
            <div data-r="2" data-c="6"></div>

            {/* Fila 3 */}
            <div data-r="3" data-c="0"></div>
            <div data-r="3" data-c="1" className="wild"></div>
            <div data-r="3" data-c="2" className="rock"></div>
            <div data-r="3" data-c="3"></div>
            <div data-r="3" data-c="4" className="wild"></div>
            <div data-r="3" data-c="5"></div>
            <div data-r="3" data-c="6" className="wild"></div>

            {/* Fila 4 — meta */}
            <div data-r="4" data-c="0" className="wild"></div>
            <div data-r="4" data-c="1"></div>
            <div data-r="4" data-c="2"></div>
            <div data-r="4" data-c="3" className="wild"></div>
            <div data-r="4" data-c="4"></div>
            <div data-r="4" data-c="5" className="rock"></div>
            <div data-r="4" data-c="6" className="goal"></div>

            {/* HUD inferior */}
            <div data-row="bottom" className="full-bottom">
              <div>
                <img src="/assets/img/heart.png" alt="heart" />
                <p>HP:</p>
                <div>
                  <div className="hp-bar">
                    <span></span><span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                  <p className="player-hp"><span>10</span>/10</p>
                </div>
                <div>
                  <span><img src="/assets/img/pokeball.png" alt="pokeball" /></span>
                  <p>X</p>
                  <p className="player-balls"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="battle-screen hidden">
          <div data-row="top" className="full-top">
            <div>
              <h2><span>EXPLORER: Ash</span></h2>
            </div>
          </div>

          <div className="pokemon-battle">
            <h2>Ha aparecido <span className="battle-pokemon-name"></span></h2>
            <div className="pokemon-container">
              <img className="battle-pokemon-img" src="" alt="Pokemon salvaje" />
            </div>
            <div className="battle-actions">
              <p><strong>A/SPACE:</strong> Lanzar Pokéball</p>
              <p><strong>B/ESC:</strong> Huir</p>
            </div>
          </div>

          <div className="full-bottom">
            <div>
              <img src="/assets/img/heart.png" alt="heart" />
              <p>HP:</p>
              <div>
                <div className="hp-bar">
                  <span></span><span></span><span></span><span></span><span></span>
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <p className="player-hp"><span>10</span>/10</p>
              </div>
              <div>
                <span><img src="/assets/img/pokeball.png" alt="pokeball" /></span>
                <p>X</p>
                <p className="player-balls"></p>
              </div>
            </div>
          </div>

          <div id="battle-message" className="hidden"></div>
        </div>

        <div className="goal-screen hidden">
          <div className="goal-list">
            <h2>¡Enhorabuena!</h2>
            <p><span id="goal-text"></span></p>
            <p><strong>SELECT/SHIFT:</strong> Ver estadísticas.</p>
            <p><strong>START/ENTER:</strong> Comenzar nueva partida.</p>
          </div>
        </div>

        <div className="stats-screen hidden">
          <div className="stats-list">
            <h2>Estadísticas</h2>
            <p className="info-stats"><strong>START/ENTER:</strong> Comenzar juego.</p>
            <p className="info-stats"><strong>A/SPACE:</strong> Mirar Pokédex.</p>
            <p className="info-stats"><strong>B/ESC:</strong> Borrar estadísticas.<br />
              <span style={{textAlign: 'center'}}>---------------</span>
            </p>
            <div className="game-list"></div>
          </div>
        </div>

        <div className="game-over-screen hidden">
          <h2>GAME OVER</h2>
          <p>PULSA START<span> o </span>PULSA ENTER</p>
          <img src="/assets/img/game-over.png" alt="Sad Pokémon trainer" />
        </div>

      </section>

      <div className="separator"></div>

      <section className="controls">
        <div className="dpad">
          <div></div>
          <button id="up-btn" className="btn" aria-label="Arriba"></button>
          <div></div>
          <button id="left-btn" className="btn" aria-label="Izquierda"></button>
          <div className="center"></div>
          <button id="right-btn" className="btn" aria-label="Derecha"></button>
          <div></div>
          <button id="down-btn" className="btn" aria-label="Abajo"></button>
          <div></div>
        </div>

        <div className="actions">
          <button id="b-btn">B</button>
          <button id="a-btn">A</button>
        </div>
      </section>

      <div className="separator"></div>

      <section className="menu">
        <button id="start-btn">START</button>
        <button id="select-btn">SELECT</button>
      </section>

    </main>
  );
}