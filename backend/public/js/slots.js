// ============================================================================
// POKÉSECTOR ADMIN PANEL - SLOTS.JS
// Gestión de slots de partida del usuario
// ============================================================================

let userId = null;
let allSlots = [];
let filteredSlots = [];
let editingSlotId = null;

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    window.location.href = '/pokesector35/login';
    return;
  }

  // Obtener userId de la URL
  const urlParams = new URLSearchParams(window.location.search);
  userId = urlParams.get('userId');

  if (!userId) {
    window.location.href = '/pokesector35/admin/users';
    return;
  }

  loadSlots();
  setupControls();
});

// ============================================================================
// CARGAR SLOTS
// ============================================================================

async function loadSlots() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/pokesector35/api/users/${userId}/slots`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Error cargando slots');
    }

    allSlots = await response.json();
    
    // Ordenar por slot_number
    allSlots.sort((a, b) => a.slot_number - b.slot_number);
    
    filteredSlots = [...allSlots];
    renderSlots(filteredSlots);

  } catch (error) {
    console.error('Error cargando slots:', error);
  }
}

// ============================================================================
// RENDERIZAR SLOTS
// ============================================================================

function renderSlots(slots) {
  const grid = document.getElementById('slotsGrid');

  if (slots.length === 0 && allSlots.length === 0) {
    grid.innerHTML = '<div class="slot-card loading">No hay slots creados</div>';
    return;
  }

  grid.innerHTML = slots.map(slot => `
    <div class="slot-card" style="background: linear-gradient(135deg, ${slot.color}dd, ${slot.color}aa);">
      <div class="slot-avatar-section">
        <div class="slot-avatar-circle">${slot.explorer_name.charAt(0).toUpperCase()}</div>
        <div class="slot-number-top">Slot ${slot.slot_number}</div>
      </div>

      <div class="slot-header">
        <span></span>
        <div class="slot-status ${slot.is_game_over ? 'active' : 'empty'}">
          ${slot.is_game_over ? 'Completado' : 'Activo'}
        </div>
      </div>

      <div class="slot-content">
        <div class="slot-explorer">👤 ${slot.explorer_name || 'Sin nombre'}</div>
        
        <div class="slot-info-item">
          <span class="slot-info-label">Estado:</span>
          <span class="slot-info-value">${slot.is_game_over ? 'Completado' : 'Activo'}</span>
        </div>

        <div class="slot-info-item">
          <span class="slot-info-label">Dificultad:</span>
          <div class="slot-difficulty ${slot.difficulty_id}">
            ${capitalizeFirst(slot.difficulty_id)}
          </div>
        </div>

        <div class="slot-info-item">
          <span class="slot-info-label">Última actualización:</span>
          <span class="slot-info-value">${slot.updated_at ? new Date(slot.updated_at).toLocaleDateString('es-ES') : '-'}</span>
        </div>

        <div class="slot-info-item">
          <span class="slot-info-label">Color de Consola:</span>
          <div class="slot-color-circle" style="background-color: ${slot.color};"></div>
        </div>

        <div class="slot-info-item">
          <span class="slot-info-label">Sticker:</span>
          <span class="slot-info-value">${slot.sticker ? slot.sticker.split('/').pop().replace('.webp', '').toUpperCase() : 'Ninguno'}</span>
        </div>

        <div class="slot-stats">
          <span>🎮 Pokémon capturados: ${slot.captured_count || 0}</span>
        </div>
      </div>

      <div class="slot-actions">
        <button class="btn-slot btn-edit" onclick="editSlot(${slot.id})">Editar</button>
        <button class="btn-slot btn-delete" onclick="deleteSlot(${slot.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// SETUP CONTROLES
// ============================================================================

function setupControls() {
  const searchInput = document.getElementById('slotSearch');
  const createBtn = document.getElementById('createSlotBtn');

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => openSlotModal());
  }
}

// ============================================================================
// APLICAR FILTROS
// ============================================================================

function applyFilters() {
  const searchTerm = document.getElementById('slotSearch').value.toLowerCase();

  filteredSlots = allSlots.filter(slot => {
    return slot.explorer_name.toLowerCase().includes(searchTerm) || 
           slot.slot_number.toString().includes(searchTerm);
  });

  renderSlots(filteredSlots);
}

// ============================================================================
// MODAL
// ============================================================================

function openSlotModal(slotId = null) {
  editingSlotId = slotId;
  const modal = document.getElementById('slotModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('slotForm');

  form.reset();
  document.getElementById('slotColor').value = '#019273'; // Verde por defecto
  document.getElementById('slotSticker').value = '/img/stickers/nosticker.webp'; // Sin sticker por defecto

  if (slotId) {
    title.textContent = 'Editar Slot';
    const slot = allSlots.find(s => s.id === slotId);
    if (slot) {
      document.getElementById('slotNumber').value = slot.slot_number;
      document.getElementById('explorerName').value = slot.explorer_name || '';
      document.getElementById('difficulty').value = slot.difficulty_id;
      document.getElementById('slotColor').value = slot.color;
      document.getElementById('slotSticker').value = slot.sticker;
    }
  } else {
    title.textContent = 'Crear Nuevo Slot';
  }

  modal.style.display = 'flex';
}

// ============================================================================
// CERRAR MODAL
// ============================================================================

function closeSlotModal() {
  const modal = document.getElementById('slotModal');
  modal.style.display = 'none';
  editingSlotId = null;
  document.getElementById('slotForm').reset();
}

// ============================================================================
// EDITAR SLOT
// ============================================================================

async function editSlot(slotId) {
  openSlotModal(slotId);
}

// ============================================================================
// GUARDAR SLOT (CREAR O EDITAR AUTOMÁTICAMENTE)
// ============================================================================

async function saveSlot() {
  const slotNumber = document.getElementById('slotNumber').value;
  const explorerName = document.getElementById('explorerName').value.trim();
  const difficulty = document.getElementById('difficulty').value;
  const color = document.getElementById('slotColor').value;
  const sticker = document.getElementById('slotSticker').value;

  if (!slotNumber || !difficulty || !color || !sticker) {
    alert('Por favor, rellena todos los campos obligatorios');
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const slotNum = parseInt(slotNumber);

    let existingSlot = allSlots.find(s => s.slot_number === slotNum);
    let method = 'POST';
    let url = `/pokesector35/api/users/${userId}/slots`;

    if (existingSlot) {
      url += `/${slotNum}`;
      method = 'PUT';
    }

    const body = {
      slot_number: slotNum,
      explorer: 'boy',
      explorer_name: explorerName || null,
      difficulty_id: difficulty,
      color: color,
      sticker: sticker
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      const isUpdate = method === 'PUT';
      alert(isUpdate ? 'Slot actualizado correctamente' : 'Slot creado correctamente');
      closeSlotModal();
      loadSlots();
    } else {
      alert('Error: ' + (data.error || 'No se pudo guardar el slot'));
    }

  } catch (error) {
    console.error('Error guardando slot:', error);
    alert('Error en la operación: ' + error.message);
  }
}

// ============================================================================
// ELIMINAR SLOT
// ============================================================================

async function deleteSlot(slotId) {
  if (!confirm('¿Eliminar este slot? Se perderán todos los datos asociados.')) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    
    // Encontrar el slot_number por ID
    const slot = allSlots.find(s => s.id === slotId);
    if (!slot) {
      alert('Slot no encontrado');
      return;
    }

    const response = await fetch(`/pokesector35/api/users/${userId}/slots/${slot.slot_number}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      alert('Slot eliminado');
      loadSlots();
    } else {
      alert('Error al eliminar slot');
    }

  } catch (error) {
    console.error('Error eliminando slot:', error);
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}