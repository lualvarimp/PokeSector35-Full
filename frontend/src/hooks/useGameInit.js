// =============================================================================
//  useGameInit.js — Hook personalizado de inicialización del juego
// =============================================================================
//  Encapsula la lógica de arranque del motor del juego:
//  · Importa main.js (Vanilla JS) una sola vez tras el primer render
//  · Devuelve el estado de inicialización para que App.jsx pueda reaccionar
//
//  Uso de hooks:
//  · useRef: evita doble inicialización en React StrictMode
//  · useState: expone el estado de inicialización al componente padre
//  · useEffect: ejecuta el efecto secundario (import dinámico) tras montar el DOM
// =============================================================================

import { useState, useEffect, useRef } from 'react';

export function useGameInit() {
  const initialized    = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Evitar doble inicialización (React StrictMode monta dos veces en desarrollo)
    if (initialized.current) return;
    initialized.current = true;

    // Importar el motor del juego de forma dinámica, una vez el DOM existe
    import('../game/main.js')
      .then(() => setReady(true))
      .catch(err => {
        console.error('Error al inicializar el juego:', err);
        setError(err.message);
      });
  }, []);

  return { ready, error };
}