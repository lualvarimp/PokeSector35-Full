// =============================================================================
//  StatsScreen.jsx — Pantalla de estadísticas, Pokédex y meta
// =============================================================================
//  Incluye la goal-screen (meta), la results-screen (resultados de partida)
//  y la stats-screen (estadísticas globales y Pokédex).
//  La lógica de navegación la gestiona stats.js (Vanilla JS).
//
//  Hooks utilizados:
//  · useState:  almacena los datos de stats del usuario y el estado de carga
//  · useEffect: llama a la API al montar el componente si hay sesión activa
// =============================================================================

import { useState, useEffect } from 'react';
import { isLoggedIn, getUserStats } from '../services/apiService.js';

export default function StatsScreen() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) return;

    setLoading(true);
    getUserStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Pantalla de meta — aparece al llegar al objetivo */}
      <div className="goal-screen hidden">
        <div className="goal-list">
          <h2>¡Enhorabuena!</h2>
          <nav id="goal-menu">
            <p data-option="0"><span className="end-cursor"><svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.8em',height:'0.8em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg></span> Jugar de nuevo</p>
            <p data-option="1"><span className="end-cursor"><svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.8em',height:'0.8em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg></span> Ver resultados</p>
            <p data-option="2"><span className="end-cursor"><svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.8em',height:'0.8em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg></span> Volver al menú</p>
            <p data-option="3"><span className="end-cursor"><svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style={{width:'0.8em',height:'0.8em',verticalAlign:'middle',fill:'currentColor'}}><polygon points="0,0 10,5 0,10"/></svg></span> Cerrar sesión</p>
          </nav>
          <div id="goal-unregistered-message" className="goal-message hidden">
            <p><strong>¡Crea una cuenta y guarda tu progreso!</strong></p>
            <p>Sin una cuenta, tus avances no se guardarán.</p>
          </div>
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

      {/* Pantalla de estadísticas globales */}
      <div className="stats-screen hidden">
        <h2>ESTADÍSTICAS</h2>

        {loading && <p className="stats-loading">Cargando...</p>}
        {error   && <p className="stats-error">Sin datos de sesión</p>}

        {stats && (
          <div className="stats-global">
            <p><strong>Jugador:</strong> {stats.username}</p>
            <p><strong>Partidas jugadas:</strong> {stats.total_games}</p>
            <p><strong>Pokémon capturados:</strong> {stats.total_captured}</p>
            <p><strong>Pokémon perdidos:</strong> {stats.total_escaped}</p>
            <p><strong>Pokémon únicos:</strong> {stats.unique_pokemon}</p>
          </div>
        )}

        <div className="stats-list">
          <div className="game-list"></div>
        </div>

        <p className="info-stats"><strong>A/SPACE:</strong> Pokédex</p>
        <p className="info-stats"><strong>B/ESC:</strong> Borrar datos</p>
        <p className="info-stats"><strong>SELECT:</strong> Volver a meta</p>
      </div>
    </>
  );
}