// =============================================================================
//  GameScreen.jsx — Pantalla principal del juego (mapa + HUD)
// =============================================================================
//  Renderiza el grid del mapa (5 filas × 7 columnas), el jugador y el HUD
//  con HP y Pokéballs. La lógica de movimiento la gestiona movement.js.
// =============================================================================

export default function GameScreen() {
  return (
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
  );
}