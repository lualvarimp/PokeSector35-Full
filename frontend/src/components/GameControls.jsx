// =============================================================================
//  GameControls.jsx — Controles físicos de la Game Boy
// =============================================================================
//  Renderiza el D-Pad, los botones A/B y los botones START/SELECT.
//  Los event listeners los registra controls.js (Vanilla JS).
// =============================================================================

export default function GameControls() {
  return (
    <>
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
    </>
  );
}