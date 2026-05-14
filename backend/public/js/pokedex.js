// ============================================================================
// POKÉSECTOR ADMIN PANEL - POKÉDEX.JS
// Gestión de Pokémon capturados del usuario
// Utiliza multiColumnSort.js para ordenamiento multi-columna
// ============================================================================

let userId = null;
let allPokemon = [];
let sorter = null;
let pokemonCache = {}; // Cache para PokeAPI

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    window.location.href = '/login';
    return;
  }

  // Obtener userId de la URL
  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get('userId');

  if (!userId) {
    window.location.href = '/admin/users';
    return;
  }

  setupPokeAPIAutocomplete();
  setupModal();
  loadPokemon();
});

// ============================================================================
// SETUP POKEAPI AUTOCOMPLETE EN MODAL
// ============================================================================

function setupPokeAPIAutocomplete() {
  const pokemonIdInput = document.getElementById('pokemonId');
  const pokemonNameInput = document.getElementById('pokemonName');
  const suggestionsDiv = document.getElementById('pokemonSuggestions') || createSuggestionsDiv();

  // Al escribir ID
  if (pokemonIdInput) {
    pokemonIdInput.addEventListener('input', async (e) => {
      const id = e.target.value.trim();
      
      if (id && id.length > 0) {
        // Buscar después de 500ms sin escribir
        clearTimeout(pokemonIdInput._timeout);
        pokemonIdInput._timeout = setTimeout(async () => {
          await fetchPokemonById(id);
        }, 500);
      } else {
        pokemonNameInput.value = '';
      }
    });
  }

  // Al escribir Nombre
  if (pokemonNameInput) {
    pokemonNameInput.addEventListener('input', async (e) => {
      const name = e.target.value.trim();
      
      if (name.length >= 2) {
        // Buscar después de 300ms sin escribir
        clearTimeout(pokemonNameInput._timeout);
        pokemonNameInput._timeout = setTimeout(async () => {
          await fetchPokemonByName(name, suggestionsDiv);
        }, 300);
      } else {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
      }
    });

    // Cerrar sugerencias al hacer click fuera
    document.addEventListener('click', (e) => {
      if (e.target !== pokemonNameInput && e.target.id !== 'pokemonSuggestions') {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
      }
    });
  }
}

// ============================================================================
// CREAR DIV DE SUGERENCIAS SI NO EXISTE
// ============================================================================

function createSuggestionsDiv() {
  let suggestionsDiv = document.getElementById('pokemonSuggestions');
  
  if (!suggestionsDiv) {
    suggestionsDiv = document.createElement('div');
    suggestionsDiv.id = 'pokemonSuggestions';
    
    const formGroup = document.querySelector('.form-group:has(#pokemonName)');
    if (formGroup) {
      formGroup.style.position = 'relative';
      formGroup.appendChild(suggestionsDiv);
    }
  }
  
  return suggestionsDiv;
}

// ============================================================================
// FETCH POKEMON POR ID
// ============================================================================

async function fetchPokemonById(id) {
  try {
    const pokemonNameInput = document.getElementById('pokemonName');
    const numId = parseInt(id);

    // Validar que el ID sea <= 151
    if (numId > 151) {
      pokemonNameInput.value = '';
      alert('Solo se permiten Pokémon de la generación 1 (ID 1-151)');
      return;
    }

    // Buscar en cache primero
    if (pokemonCache[`id_${id}`]) {
      const cached = pokemonCache[`id_${id}`];
      pokemonNameInput.value = cached.name;
      return;
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id.toLowerCase()}`);
    
    if (!response.ok) {
      pokemonNameInput.value = '';
      return;
    }

    const data = await response.json();

    // Validar que el ID sea <= 151
    if (data.id > 151) {
      pokemonNameInput.value = '';
      alert('Solo se permiten Pokémon de la generación 1 (ID 1-151)');
      return;
    }

    const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    
    // Guardar en cache
    pokemonCache[`id_${id}`] = { name: name, id: data.id };
    pokemonCache[`name_${name.toLowerCase()}`] = { name: name, id: data.id };
    
    pokemonNameInput.value = name;

  } catch (error) {
    console.error('Error buscando Pokémon por ID:', error);
  }
}

// ============================================================================
// FETCH POKEMON POR NOMBRE CON SUGERENCIAS
// ============================================================================

async function fetchPokemonByName(name, suggestionsDiv) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0`);
    
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    
    // Filtrar por nombre que coincida con las letras escritas Y que el ID sea <= 151
    const searchTerm = name.toLowerCase();
    const matches = data.results
      .filter(p => {
        const pokemonId = p.url.split('/')[6];
        return p.name.toLowerCase().startsWith(searchTerm) && parseInt(pokemonId) <= 151;
      })
      .slice(0, 10); // Limitar a 10 sugerencias

    if (matches.length === 0) {
      suggestionsDiv.innerHTML = '<div style="padding: 10px; color: #999;">No hay coincidencias</div>';
      suggestionsDiv.style.display = 'block';
      return;
    }

    // Crear HTML de sugerencias
    suggestionsDiv.innerHTML = matches.map(pokemon => {
      const pokemonId = pokemon.url.split('/')[6];
      return `
      <div onclick="selectPokemonSuggestion('${pokemon.name}', ${pokemonId})">
        <strong>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</strong>
        <span>#${pokemonId}</span>
      </div>
    `;
    }).join('');

    suggestionsDiv.style.display = 'block';

  } catch (error) {
    console.error('Error buscando Pokémon por nombre:', error);
  }
}

// ============================================================================
// SELECCIONAR POKÉMON DE LAS SUGERENCIAS
// ============================================================================

function selectPokemonSuggestion(name, id) {
  const pokemonNameInput = document.getElementById('pokemonName');
  const pokemonIdInput = document.getElementById('pokemonId');
  const suggestionsDiv = document.getElementById('pokemonSuggestions');

  pokemonNameInput.value = name.charAt(0).toUpperCase() + name.slice(1);
  pokemonIdInput.value = id;

  // Guardar en cache
  pokemonCache[`name_${name.toLowerCase()}`] = { name: name, id: id };
  pokemonCache[`id_${id}`] = { name: name, id: id };

  // Cerrar sugerencias
  suggestionsDiv.innerHTML = '';
  suggestionsDiv.style.display = 'none';
}

// ============================================================================
// CARGAR POKÉMON CAPTURADOS
// ============================================================================

async function loadPokemon() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}/pokedex`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Error cargando Pokémon');
    }

    allPokemon = await response.json();

    // Inicializar el sorter con los datos
    if (!sorter) {
      sorter = new PokedexSort('.pokedex-table', allPokemon, renderPokemon);
    } else {
      sorter.setData(allPokemon);
    }

    renderPokemon(allPokemon);
    updateCount(allPokemon.length);
    setupSearchAndControls();
    populateSlotFilter();

  } catch (error) {
    console.error('Error cargando Pokémon:', error);
  }
}

// ============================================================================
// RENDERIZAR POKÉMON
// ============================================================================

function renderPokemon(pokemon) {
  const tbody = document.getElementById('pokemonTableBody');

  if (pokemon.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay Pokémon capturados</td></tr>';
    return;
  }

  tbody.innerHTML = pokemon.map(p => {
    // Formatear fecha a dd/mm/aaaa
    const date = new Date(p.captured_at);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    return `
      <tr>
        <td>#${p.pokemon_id}</td>
        <td>${p.pokemon_name}</td>
        <td>${p.slot_number !== null && p.slot_number !== undefined ? `Slot ${p.slot_number}` : '-'}</td>
        <td>${formattedDate}</td>
        <td>
          <button class="btn-small-delete" onclick="deletePokemon(${p.id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// SETUP BÚSQUEDA Y CONTROLES
// ============================================================================

function applyFilters() {
  const searchTerm = (document.getElementById('pokemonSearch')?.value || '').toLowerCase();
  const slotValue  = document.getElementById('slotFilter')?.value || '';

  sorter.filter(p => {
    const matchesSearch = p.pokemon_name.toLowerCase().includes(searchTerm) ||
                          p.pokemon_id.toString().includes(searchTerm);
    const matchesSlot   = slotValue === '' ||
                          (slotValue === 'none'
                            ? (p.slot_number === null || p.slot_number === undefined)
                            : String(p.slot_number) === slotValue);
    return matchesSearch && matchesSlot;
  });

  updateCount(sorter.getFilteredData().length);
}

function populateSlotFilter() {
  const select = document.getElementById('slotFilter');
  if (!select) return;

  const slots = [...new Set(
    allPokemon
      .map(p => p.slot_number)
      .filter(s => s !== null && s !== undefined)
  )].sort((a, b) => a - b);

  select.innerHTML = '<option value="">Todos los slots</option>';

  slots.forEach(slotNum => {
    const opt = document.createElement('option');
    opt.value = slotNum;
    opt.textContent = `Slot ${slotNum}`;
    select.appendChild(opt);
  });

  const hasUnassigned = allPokemon.some(p => p.slot_number === null || p.slot_number === undefined);
  if (hasUnassigned) {
    const opt = document.createElement('option');
    opt.value = 'none';
    opt.textContent = 'Sin slot';
    select.appendChild(opt);
  }
}

function setupSearchAndControls() {
  const searchInput = document.getElementById('pokemonSearch');
  const slotFilter  = document.getElementById('slotFilter');
  const addBtn      = document.getElementById('addPokemonBtn');

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (slotFilter) {
    slotFilter.addEventListener('change', applyFilters);
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => openAddModal());
  }
}

// ============================================================================
// ELIMINAR POKÉMON
// ============================================================================

async function deletePokemon(pokemonId) {
  if (!confirm('¿Eliminar este Pokémon?')) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}/pokedex/${pokemonId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      const currentSlot = document.getElementById('slotFilter')?.value || '';
      alert('Pokémon eliminado');
      await loadPokemon();
      const slotFilter = document.getElementById('slotFilter');
      if (slotFilter && currentSlot) {
        slotFilter.value = currentSlot;
        applyFilters();
      }
    } else {
      alert('Error al eliminar Pokémon');
    }

  } catch (error) {
    console.error('Error eliminando Pokémon:', error);
  }
}

// ============================================================================
// MODALES
// ============================================================================

function openAddModal() {
  document.getElementById('addPokemonModal').style.display = 'flex';
}

function closeAddModal() {
  document.getElementById('addPokemonModal').style.display = 'none';
  document.getElementById('addPokemonForm').reset();
  const suggestionsDiv = document.getElementById('pokemonSuggestions');
  if (suggestionsDiv) {
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';
  }
}

// ============================================================================
// SETUP MODAL
// ============================================================================

function setupModal() {
  const form = document.getElementById('addPokemonForm');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addPokemon();
    });
  }

  // Cargar los slots reales del usuario (con IDs de BD) en el select
  loadUserSlotsIntoSelect();
}

async function loadUserSlotsIntoSelect() {
  const select = document.getElementById('slotId');
  if (!select) return;

  try {
    const accessToken = localStorage.getItem('access_token');
    const resp = await fetch(`/api/users/${userId}/slots`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!resp.ok) return;

    const slots = await resp.json();
    // Vaciar opciones actuales y añadir las reales con el ID interno de BD
    select.innerHTML = '<option value="">Sin asignar</option>';
    slots
      .sort((a, b) => a.slot_number - b.slot_number)
      .forEach(slot => {
        const opt = document.createElement('option');
        opt.value = slot.id;  // ID interno de BD (el que necesita el backend)
        opt.textContent = `Slot ${slot.slot_number} (${slot.difficulty_id || '?'})`;
        select.appendChild(opt);
      });
  } catch (e) {
    console.warn('No se pudieron cargar los slots:', e.message);
  }
}

// ============================================================================
// AÑADIR POKÉMON
// ============================================================================

async function addPokemon() {
  const pokemonId   = document.getElementById('pokemonId').value;
  const pokemonName = document.getElementById('pokemonName').value.toUpperCase();
  const slotId      = document.getElementById('slotId').value || null;
  const slotError   = document.getElementById('slotError');

  if (!pokemonId || !pokemonName) {
    alert('Por favor, rellena ID y nombre del Pokémon');
    return;
  }

  // Validar slot obligatorio
  if (!slotId) {
    slotError.style.display = 'block';
    document.getElementById('slotId').focus();
    return;
  } else {
    slotError.style.display = 'none';
  }

  const numId = parseInt(pokemonId);

  // Validar que ID sea <= 151
  if (numId > 151) {
    alert('Solo se permiten Pokémon de la generación 1 (ID 1-151)');
    return;
  }

  if (numId < 1) {
    alert('El ID debe ser mayor que 0');
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      alert('Token expirado. Por favor, vuelve a loguear');
      window.location.href = '/login';
      return;
    }

    const response = await fetch(`/api/users/${userId}/pokedex`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pokemon_id: numId,
        pokemon_name: pokemonName,
        slot_id: parseInt(slotId)
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Pokémon añadido correctamente');
      closeAddModal();
      await loadPokemon();
    } else {
      alert('Error: ' + (data.error || 'No se pudo añadir el Pokémon'));
    }

  } catch (error) {
    console.error('Error añadiendo Pokémon:', error);
    alert('Error en la operación: ' + error.message);
  }
}

// ============================================================================
// ACTUALIZAR CONTADOR
// ============================================================================

function updateCount(count) {
  const countElement = document.getElementById('pokemonCountTotal');
  if (countElement) {
    countElement.textContent = `Total: ${count} Pokémon capturados`;
  }
}