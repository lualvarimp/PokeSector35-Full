// =============================================================================
//  StatsScreen.jsx — Pantalla de estadísticas, Pokédex y meta
// =============================================================================
//  Incluye la goal-screen (meta), la results-screen (resultados de partida)
//  y la stats-screen (estadísticas globales y Pokédex).
//  La lógica la gestiona stats.js y stats-pokedex.js.
// =============================================================================

export default function StatsScreen() {
  return (
    <>
      {/* Pantalla de meta — aparece al llegar al objetivo */}
      <div className="goal-screen hidden">
        <div className="goal-list">
          <h2>¡Enhorabuena!</h2>
          <nav id="goal-menu">
            <p data-option="0"><span className="end-cursor">►</span> Jugar de nuevo</p>
            <p data-option="1"><span className="end-cursor">►</span> Ver resultados</p>
            <p data-option="2"><span className="end-cursor">►</span> Volver al menú</p>
            <p data-option="3"><span className="end-cursor">►</span> Cerrar sesión</p>
          </nav>
        </div>
      </div>

      {/* Pantalla de resultados — lista de capturados/escapados de esta partida */}
      <div className="results-screen hidden">
        <div className="results-list">
          <h2>Resultados</h2>
          <div id="results-text"></div>
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