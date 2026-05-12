
// =============================================================================
//  stats-ui.js — Utilidades de interfaz compartidas entre vistas de stats
// =============================================================================
//  RESPONSABILIDAD: Proporcionar funciones de apoyo reutilizables para las
//  dos vistas de la pantalla de estadísticas (resumen y Pokédex): formateo
//  de nombres y gestión de las instrucciones visibles según la vista activa.
//
//  FUNCIONES EXPORTADAS:
//    · formatName(name)      — formatea un nombre Pokémon para mostrarlo
//    · setInfoStats(view)    — muestra u oculta instrucciones según la vista
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ Manipulación del DOM  → modifica clases CSS para mostrar/ocultar elementos
// =============================================================================

// Convierte un nombre en mayúsculas de la API al formato de presentación
// Ejemplo: "BULBASAUR" → "Bulbasaur"
export function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Alterna las instrucciones visibles en la cabecera de la pantalla de stats
// según si estamos en la vista resumen ('summary') o en la Pokédex ('pokedex').
// En la vista Pokédex se ocultan las instrucciones normales y se muestra
// "B/ESC: Volver atrás" para no confundir al jugador.
export function setInfoStats(view) {
    const infoStats = document.querySelectorAll('.info-stats'); // párrafos de instrucciones del HTML
    let backHint    = document.getElementById('pokedex-back-hint'); // hint creado dinámicamente

    if (view === 'pokedex') {
        // Ocultamos las instrucciones estándar (START, A, B del HTML)
        infoStats.forEach(el => el.classList.add('hidden'));

        // Creamos el hint de "Volver atrás" la primera vez que se entra a la Pokédex
        if (!backHint) {
            backHint           = document.createElement('p');
            backHint.id        = 'pokedex-back-hint';
            backHint.className = 'info-stats'; // misma clase para herencia de estilos
            backHint.innerHTML = '<strong>B/ESC:</strong> Volver atrás.';

            // Lo insertamos justo antes de .game-list para que quede en la cabecera
            const gameList = document.querySelector('.game-list');
            gameList.parentNode.insertBefore(backHint, gameList);
        }
        backHint.classList.remove('hidden'); // mostramos el hint de volver

    } else {
        // Vista resumen: restauramos las instrucciones originales del HTML
        infoStats.forEach(el => el.classList.remove('hidden'));

        // Ocultamos el hint de volver si existe (puede no existir en la primera carga)
        if (backHint) backHint.classList.add('hidden');
    }
}