// =============================================================================
//  useGameInit.js — Hook personalizado de inicialización del juego
// =============================================================================
import { useState, useEffect, useRef } from 'react';

export function useGameInit() {
  const initialized    = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Esperamos a que React haya pintado el DOM completo Y a que el navegador
    // haya terminado el layout antes de arrancar el motor del juego.
    // requestAnimationFrame garantiza que el DOM está pintado,
    // el setTimeout interior añade un frame extra de seguridad.
    requestAnimationFrame(() => {
      setTimeout(() => {
        import('../game/main.js')
          .then(() => setReady(true))
          .catch(err => {
            console.error('Error al inicializar el juego:', err);
            setError(err.message);
          });
      }, 300);
    });
  }, []);

  return { ready, error };
}