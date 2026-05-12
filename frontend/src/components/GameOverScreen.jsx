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
      <p>PULSA START<span> o </span>PULSA ENTER</p>
      <img src="/assets/img/game-over.png" alt="Sad Pokémon trainer" />
    </div>
  );
}