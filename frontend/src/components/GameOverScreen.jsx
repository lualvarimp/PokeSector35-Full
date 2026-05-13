// =============================================================================
//  GameOverScreen.jsx — Pantalla de Game Over
// =============================================================================
//  Se muestra cuando el jugador se queda sin HP.
//  La lógica de activación la gestiona game-over.js.
// =============================================================================

export default function GameOverScreen() {
  return (
    <div className="game-over-screen hidden">
      <h2>GAME OVER</h2>

      {/* Estado inicial: invita al jugador a pulsar START */}
      <p className="game-over-prompt">PULSA START<span> o </span>PULSA ENTER</p>

      <img src="/img/game-over.png" alt="Sad Pokémon trainer" />

      {/* Menú que aparece al pulsar START — oculto hasta entonces */}
      <nav id="gameover-menu" className="hidden">
        <p data-option="0"><span className="end-cursor">►</span> Jugar de nuevo</p>
        <p data-option="1"><span className="end-cursor">►</span> Volver al menú</p>
        <p data-option="2"><span className="end-cursor">►</span> Cerrar sesión</p>
      </nav>
    </div>
  );
}