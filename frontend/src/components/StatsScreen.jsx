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
        <h2>Resultados</h2>
        <div className="results-viewport">
          <div className="results-list">
            
            <div id="results-text"></div>
          </div>
        </div>
        <p className="results-back"><strong>B/ESC:</strong> Volver</p>
      </div>
    </>
  );
}