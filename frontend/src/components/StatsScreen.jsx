// =============================================================================
//  StatsScreen.jsx — Pantalla de estadísticas y Pokédex
// =============================================================================
//  Muestra las estadísticas de la partida (capturados/perdidos) y la Pokédex.
//  Incluye también la pantalla de meta (goal-screen).
//  La lógica de renderizado la gestiona stats.js y stats-pokedex.js.
// =============================================================================

export default function StatsScreen() {
  return (
    <>
      {/* Pantalla de meta — aparece al llegar al objetivo */}
      <div className="goal-screen hidden">
        <div className="goal-list">
          <h2>¡Enhorabuena!</h2>
          <p><span id="goal-text"></span></p>
          <p><strong>SELECT/SHIFT:</strong> Ver estadísticas.</p>
          <p><strong>START/ENTER:</strong> Comenzar nueva partida.</p>
        </div>
      </div>

      {/* Pantalla de estadísticas y Pokédex */}
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
    </>
  );
}