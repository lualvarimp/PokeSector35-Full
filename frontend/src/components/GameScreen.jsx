// =============================================================================
//  GameScreen.jsx — Pantalla principal del juego (mapa + HUD)
// =============================================================================
//  Renderiza el grid del mapa (5 filas × 7 columnas), el jugador y el HUD
//  con HP y Pokéballs. La lógica de movimiento la gestiona movement.js.
//
//  El grid se genera dinámicamente con Array.map() para evitar repetición.
//  Las clases de cada celda (rock, wild, goal) las aplica applyMap() en
//  menu-start.js una vez el gameScreen es visible en el DOM.
// =============================================================================

const ROWS = 5;
const COLS = 7;

export default function GameScreen() {
  return (
    <div className="game-screen hidden">
      <div className="screen-grid">

        <div data-row="top" className="full-top">
          <div>
            <h2><span>EXPLORER: Ash</span></h2>
          </div>
        </div>

        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => (
            <div key={`${r}-${c}`} data-r={r} data-c={c}>
              {r === 0 && c === 0 && (
                <div id="player">
                  <img src="/img/character-boy-front.png" alt="Pokémon explorer" />
                </div>
              )}
            </div>
          ))
        )}

        <div data-row="bottom" className="full-bottom">
          <div>
            <img src="/img/heart.png" alt="heart" />
            <p>HP:</p>
            <div>
              <div className="hp-bar">
                {Array.from({ length: 10 }, (_, i) => <span key={i}></span>)}
              </div>
              <p className="player-hp"><span>10</span>/10</p>
            </div>
            <div>
              <span><img src="/img/pokeball.png" alt="pokeball" /></span>
              <p>X</p>
              <p className="player-balls"></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}