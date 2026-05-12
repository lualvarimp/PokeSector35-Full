// =============================================================================
//  MenuScreen.jsx — Pantalla de menú principal
// =============================================================================
//  Renderiza todas las vistas del menú: principal, inicio de partida, slots,
//  personalización, ranking, cuenta y confirmación.
//  La lógica de navegación entre vistas la gestiona menu.js (Vanilla JS).
// =============================================================================

export default function MenuScreen() {
  return (
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

      {/* Vista: Iniciar partida (continuar / nueva partida) */}
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

      {/* Vista: Ranking — pantalla fija, scroll interno con ▲▼, cambio dificultad con ◀▶ */}
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
  );
}