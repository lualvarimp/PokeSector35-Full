// ============================================================================
// MULTI-COLUMN SORT UTILITY
// Librería genérica para ordenamiento multi-columna en cualquier tabla
// Uso: new MultiColumnSort('tableSelector', dataArray, renderFunction)
// ============================================================================

class MultiColumnSort {
  constructor(tableSelector, dataArray, renderFunction) {
    this.tableSelector = tableSelector;
    this.table = document.querySelector(tableSelector);
    this.allData = dataArray;
    this.filteredData = [...dataArray];
    this.renderFunction = renderFunction;
    this.sortCriteria = []; // [{column: 0, direction: 'up'}, ...]
    
    this.init();
  }

  init() {
    if (!this.table) {
      console.error(`Tabla no encontrada: ${this.tableSelector}`);
      return;
    }

    this.setupHeaderClickListeners();
  }

  setupHeaderClickListeners() {
    const headers = this.table.querySelectorAll('thead span[data-sort-state]');
    
    headers.forEach((header, index) => {
      header.addEventListener('click', () => {
        this.handleHeaderClick(index);
      });
      
      // Mostrar cursor pointer para indicar que es clickeable
      header.style.cursor = 'pointer';
    });
  }

  handleHeaderClick(columnIndex) {
    const existingIndex = this.sortCriteria.findIndex(c => c.column === columnIndex);

    if (existingIndex !== -1) {
      // Columna ya existe en criterios
      const criteria = this.sortCriteria[existingIndex];
      
      if (criteria.direction === 'up') {
        criteria.direction = 'down';
      } else if (criteria.direction === 'down') {
        // Remover el criterio
        this.sortCriteria.splice(existingIndex, 1);
      }
    } else {
      // Nueva columna
      this.sortCriteria.push({ column: columnIndex, direction: 'up' });
    }

    this.updateHeaderStates();
    this.applySort();
  }

  updateHeaderStates() {
    const headers = this.table.querySelectorAll('thead span[data-sort-state]');
    
    headers.forEach(header => {
      header.setAttribute('data-sort-state', 'none');
      header.removeAttribute('data-sort-order');
      header.title = ''; // Limpiar tooltip
    });

    // Actualizar estado de cada header en sortCriteria
    this.sortCriteria.forEach((criteria, index) => {
      const header = this.table.querySelectorAll('thead span[data-sort-state]')[criteria.column];
      if (header) {
        header.setAttribute('data-sort-state', criteria.direction);
        header.setAttribute('data-sort-order', index + 1);
        // Mostrar en tooltip el orden de criterio
        header.title = `Criterio ${index + 1}: ${criteria.direction === 'up' ? 'Ascendente' : 'Descendente'}`;
      }
    });
  }

  applySort() {
    if (this.sortCriteria.length === 0) {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = [...this.allData];
      this.multiColumnSort(this.filteredData);
    }

    this.renderFunction(this.filteredData);
  }

  multiColumnSort(data) {
    data.sort((a, b) => {
      for (let criteria of this.sortCriteria) {
        const columnIndex = criteria.column;
        const direction = criteria.direction;
        
        const aValue = this.getColumnValue(a, columnIndex);
        const bValue = this.getColumnValue(b, columnIndex);
        
        let comparison = this.compareValues(aValue, bValue);
        
        if (comparison !== 0) {
          return direction === 'down' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  getColumnValue(item, columnIndex) {
    // Mapeo personalizable de columna a valor del objeto
    // Esto debe ser sobrescrito por subclases si es necesario
    const keys = Object.keys(item);
    if (columnIndex < keys.length) {
      return item[keys[columnIndex]];
    }
    return '';
  }

  compareValues(a, b) {
    // Manejar números
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Manejar strings
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    // Conversión por defecto
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    return aStr.localeCompare(bStr);
  }

  setData(newData) {
    this.allData = newData;
    this.filteredData = [...newData];
    this.applySort();
  }

  filter(filterFunction) {
    this.filteredData = this.allData.filter(filterFunction);
    if (this.sortCriteria.length > 0) {
      this.multiColumnSort(this.filteredData);
    }
    this.renderFunction(this.filteredData);
  }

  resetSort() {
    this.sortCriteria = [];
    this.updateHeaderStates();
    this.applySort();
  }

  getFilteredData() {
    return this.filteredData;
  }
}

// ============================================================================
// EXTENSIÓN PARA POKEDEX (mapeo personalizado de columnas)
// ============================================================================

class PokedexSort extends MultiColumnSort {
  getColumnValue(item, columnIndex) {
    const columnMap = {
      0: () => item.pokemon_id,
      1: () => item.pokemon_name,
      2: () => item.slot_id || 0,
      // Columna 3 (Capturado) - NO ordenable
      4: () => ''
    };

    const getter = columnMap[columnIndex];
    return getter ? getter() : '';
  }
}

// ============================================================================
// EXTENSIÓN PARA USERS (mapeo personalizado de columnas)
// ============================================================================

class UsersSort extends MultiColumnSort {
  getColumnValue(item, columnIndex) {
    const columnMap = {
      0: () => item.id,
      1: () => item.username,
      // Columna 2 (Rol) - NO ordenable
      // Columna 3 (Creado) - NO ordenable
      4: () => item.deleted_at ? 'eliminado' : 'activo'
    };

    const getter = columnMap[columnIndex];
    return getter ? getter() : '';
  }
}

// ============================================================================
// EXTENSIÓN PARA RANKING (mapeo personalizado de columnas)
// ============================================================================

class RankingSort extends MultiColumnSort {
  getColumnValue(item, columnIndex) {
    const columnMap = {
      0: () => item.username, // Para ordenar por usuario usamos username
      1: () => item.username,
      2: () => item.captured_count || 0,
      // Columna 3 (Esc.) - NO ordenable
      4: () => {
        const total = (item.captured_count || 0) + (item.escaped_count || 0);
        return total > 0 ? (item.captured_count / total) * 100 : 0;
      }
    };

    const getter = columnMap[columnIndex];
    return getter ? getter() : '';
  }
}

// ============================================================================
// EXTENSIÓN PARA SLOTS (mapeo personalizado de columnas)
// ============================================================================

class SlotsSort extends MultiColumnSort {
  getColumnValue(item, columnIndex) {
    const columnMap = {
      0: () => item.slot_number,
      1: () => item.explorer_name || item.explorer,
      2: () => item.difficulty_id,
      3: () => item.hp,
      4: () => item.is_game_over ? 'completado' : 'activo'
    };

    const getter = columnMap[columnIndex];
    return getter ? getter() : '';
  }
}