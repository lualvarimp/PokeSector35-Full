// =============================================================================
//  pokemon.js — Clases Pokemon y Pokedex (POO)
// =============================================================================
//  RESPONSABILIDAD: Definir el modelo de datos orientado a objetos del juego.
//  La clase Pokemon representa una entidad individual con sus datos y métodos
//  de presentación. La clase Pokedex gestiona una colección de Pokémon usando
//  composición, y añade lógica de filtrado, ordenación y navegación.
//
//  CLASES EXPORTADAS:
//    · Pokemon  — entidad individual: id, name, métodos de presentación
//    · Pokedex  — colección que compone instancias Pokemon; filtra por letra
//
//  RELACIÓN CON LOS REQUISITOS DEL PROYECTO:
//    ✅ POO: clase con propiedades y métodos  → clase Pokemon con 4 métodos
//    ✅ POO: composición                      → Pokedex compone instancias Pokemon
//    ✅ Filtrado de información               → Pokedex.filterByLetter(), nextFilter(), prevFilter()
//    ✅ Visualización de datos               → Pokedex.getFilteredEntries() alimenta la pantalla de stats
// =============================================================================

export class Pokemon {

    // El constructor recibe un objeto {id, name} para ser compatible con el
    // formato que devuelve la PokeAPI y con el almacenado en localStorage
    constructor({ id, name }) {
        this.id   = id;   // número de Pokédex (ID numérico de la PokeAPI, 1–151)
        this.name = name; // nombre en mayúsculas tal como lo devuelve la API
    }

    // Devuelve el nombre con la primera letra en mayúscula y el resto en minúscula
    // Ejemplo: "PIKACHU" → "Pikachu"
    getFormattedName() {
        return this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    }

    // Devuelve la URL del sprite oficial usando el repositorio de imágenes de la PokeAPI
    // Se puede usar para mostrar imágenes en la Pokédex sin hacer nuevas llamadas a la API
    getSpriteUrl() {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${this.id}.png`;
    }

    // Devuelve el número de Pokédex formateado con 3 dígitos y almohadilla
    // Ejemplo: id=7 → "#007"
    getPokedexNumber() {
        return `#${String(this.id).padStart(3, '0')}`;
    }

    // Representación completa en texto para mostrar en listas
    // Ejemplo: "#007 Squirtle"
    toString() {
        return `${this.getPokedexNumber()} ${this.getFormattedName()}`;
    }
}


export class Pokedex {

    // Pokedex usa COMPOSICIÓN: internamente contiene instancias de Pokemon,
    // no hereda de ella. Esto cumple el requisito de "herencia o composición".
    constructor(pokemonDataArray = []) {
        // Convertimos el array de objetos planos {id,name} en instancias Pokemon
        this.entries      = pokemonDataArray.map(data => new Pokemon(data));
        this.activeFilter = null; // null = sin filtro activo (muestra todos)
        this.sortById(); // garantizar orden por ID independientemente del orden de la BD
    }

    // Añade un Pokémon a la colección si aún no existe (comprobación por ID)
    // Mantiene la colección ordenada después de cada inserción
    add(pokemonData) {
        const exists = this.entries.some(p => p.id === pokemonData.id);
        if (!exists) {
            this.entries.push(new Pokemon(pokemonData));
            this.sortById();
        }
    }

    // Ordena la colección por ID de menor a mayor (orden de la Pokédex original)
    sortById() {
        this.entries.sort((a, b) => a.id - b.id);
    }

    // Extrae las letras iniciales únicas de todos los nombres formateados
    // y las devuelve ordenadas alfabéticamente para construir el menú de filtros
    getAvailableLetters() {
        const letters = this.entries.map(p => p.getFormattedName().charAt(0));
        return [...new Set(letters)].sort(); // Set elimina duplicados
    }

    // Establece el filtro activo. Si letter es null, se muestran todos los Pokémon
    filterByLetter(letter) {
        this.activeFilter = letter;
    }

    // Devuelve las entradas que coinciden con el filtro activo.
    // Si no hay filtro (activeFilter === null), devuelve toda la colección.
    getFilteredEntries() {
        if (!this.activeFilter) return this.entries;
        return this.entries.filter(
            p => p.getFormattedName().charAt(0) === this.activeFilter
        );
    }

    // Avanza al siguiente filtro de letra en orden alfabético.
    // Si estamos en la última letra, vuelve a "todos" (null).
    // Usado por el botón derecha (▶) en la vista Pokédex de estadísticas.
    nextFilter() {
        const letters     = [null, ...this.getAvailableLetters()]; // null = "TODOS" al principio
        const currentIndex = letters.indexOf(this.activeFilter);
        const nextIndex    = (currentIndex + 1) % letters.length;  // ciclamos al llegar al final
        this.activeFilter  = letters[nextIndex];
    }

    // Retrocede al filtro de letra anterior.
    // Usado por el botón izquierda (◀) en la vista Pokédex de estadísticas.
    prevFilter() {
        const letters     = [null, ...this.getAvailableLetters()];
        const currentIndex = letters.indexOf(this.activeFilter);
        const prevIndex    = (currentIndex - 1 + letters.length) % letters.length; // ciclamos hacia atrás
        this.activeFilter  = letters[prevIndex];
    }

    // Devuelve la etiqueta del filtro activo para mostrar en la cabecera de la Pokédex
    // Ejemplos: "(ALL)" cuando no hay filtro, "[P]" cuando se filtra por la letra P
    getFilterLabel() {
        return this.activeFilter ? `( ${this.activeFilter} )` : '( TODOS )';
    }

    // Getter que devuelve el número total de entradas sin aplicar ningún filtro
    get total() {
        return this.entries.length;
    }
}