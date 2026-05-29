// =============================================================================
//  BattleScreen.jsx — Pantalla de batalla contra Pokémon salvaje
// =============================================================================
//  Muestra el nombre e imagen del Pokémon encontrado, las acciones disponibles
//  y el HUD del jugador. La lógica de combate la gestiona battle.js.
// =============================================================================

export default function BattleScreen() {
  return (
    <div className="battle-screen hidden">

      <div data-row="top" className="full-top">
        <div>
          <h2><span>EXPLORER: Ash</span></h2>
        </div>
      </div>

      <div className="pokemon-battle">
        <h2>Ha aparecido <span className="battle-pokemon-name"></span></h2>
        <div className="battle-already-caught hidden">
          <img src="/pokesector35/img/pokeball.png" alt="pokeball" />
          <span>Ya lo has<br /> capturado</span>
        </div>
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
          <img src="/pokesector35/img/heart.png" alt="heart" />
          <p>HP:</p>
          <div>
            <div className="hp-bar">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <p className="player-hp"><span>10</span>/10</p>
          </div>
          <div>
            <span><img src="/pokesector35/img/pokeball.png" alt="pokeball" /></span>
            <p>X</p>
            <p className="player-balls"></p>
          </div>
        </div>
      </div>

      <div id="battle-message" className="hidden"></div>

    </div>
  );
}