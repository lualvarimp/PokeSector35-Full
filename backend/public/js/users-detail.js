// ============================================================================
// POKÉSECTOR ADMIN PANEL - USERS DETAIL.JS
// Gestión de detalles del usuario
// ============================================================================

let currentUserId = null;
let userData = null;

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!accessToken) {
    window.location.href = '/login';
    return;
  }

  // Obtener userId de la URL: /admin/users/:id
  const pathParts = window.location.pathname.split('/');
  currentUserId = pathParts[pathParts.length - 1];

  if (!currentUserId || currentUserId === 'users') {
    window.location.href = '/admin/users';
    return;
  }

  loadUserData(currentUserId);
  setupEditButtons();
  setupActionButtons();
});

// ============================================================================
// CARGAR DATOS DEL USUARIO
// ============================================================================

async function loadUserData(userId) {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    userData = await response.json();

    // Rellenar tabla (SIN campo explorer)
    document.getElementById('username').textContent = userData.username;
    document.getElementById('role').textContent = userData.role;
    document.getElementById('createdAt').textContent = new Date(userData.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Estado (soft delete)
    const deletedAtElement = document.getElementById('deletedAt');
    if (userData.deleted_at) {
      deletedAtElement.textContent = 'Eliminado';
      deletedAtElement.style.color = 'var(--red)';
      document.getElementById('restoreBtn').style.display = 'inline-block';
      document.getElementById('deleteBtn').style.display = 'none';
    } else {
      deletedAtElement.textContent = 'Activo';
      document.getElementById('restoreBtn').style.display = 'none';
      document.getElementById('deleteBtn').style.display = 'inline-block';
    }

    // Configurar botones de navegación
    document.getElementById('viewPokedexBtn').href = `/admin/pokedex?userId=${userId}`;
    document.getElementById('viewSlotsBtn').href = `/admin/slots?userId=${userId}`;

    // Cargar estadísticas completas (1 request en lugar de 2)
    await loadStatistics(userId);

  } catch (error) {
    console.error('Error cargando datos del usuario:', error);
  }
}

// ============================================================================
// CARGAR ESTADÍSTICAS COMPLETAS (optimizado - 1 request)
// ============================================================================

async function loadStatistics(userId) {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}/stats`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Error obteniendo estadísticas');
    }

    const stats = await response.json();

    // Actualizar Pokémon capturados
    document.getElementById('pokemonCount').textContent = stats.unique_pokemon || 0;

    // Actualizar Slots disponibles
    document.getElementById('slotCount').textContent = stats.total_slots || 0;

    // Actualizar nombre del explorador
    const explorerEl = document.getElementById('explorerName');
    if (explorerEl) {
      explorerEl.textContent = stats.explorer_name || '-';
      explorerEl.dataset.value = stats.explorer_name || '';
    }

  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    document.getElementById('pokemonCount').textContent = '0';
    document.getElementById('slotCount').textContent = '0';
  }
}

// ============================================================================
// SETUP BOTONES EDITAR
// ============================================================================

function setupEditButtons() {
  const editButtons = document.querySelectorAll('.btn-edit');

  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.getAttribute('data-field');
      editField(field);
    });
  });
}

// ============================================================================
// EDITAR CAMPO
// ============================================================================

async function editField(field) {
  const currentValue = document.getElementById(field === 'password' ? 'password' : field)?.textContent || '';

  let newValue;

  if (field === 'role') {
    newValue = prompt(`Nuevo rol (actual: ${userData.role})\nOpciones: user, admin`, userData.role);
    if (!newValue || !['user', 'admin'].includes(newValue)) {
      alert('Rol inválido');
      return;
    }
  } else if (field === 'password') {
    newValue = prompt('Nueva contraseña (mínimo 6 caracteres)');
    if (!newValue || newValue.length < 6) {
      alert('Contraseña muy corta');
      return;
    }
  } else if (field === 'explorerName') {
    const current = document.getElementById('explorerName')?.dataset.value || '';
    newValue = prompt(`Nombre de explorador (actual: ${current || '-'})\nMáx. 12 caracteres`, current);
    if (newValue === null) return;
    newValue = newValue.trim().substring(0, 12) || current;
  } else {
    newValue = prompt(`Nuevo ${field} (actual: ${userData[field] || '-'})`);
    if (!newValue) return;
  }

  await updateUserField(field, newValue);
}

// ============================================================================
// ACTUALIZAR CAMPO DEL USUARIO
// ============================================================================

async function updateUserField(field, value) {
  try {
    const accessToken = localStorage.getItem('access_token');

    if (field === 'password') {
      const response = await fetch(`/api/users/${currentUserId}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: value })
      });
      if (response.ok) {
        alert('Contraseña actualizada');
      } else {
        alert('Error al actualizar contraseña');
      }

    } else if (field === 'explorerName') {
      // Actualizar explorer_name en todos los slots del usuario
      const slotsResp = await fetch(`/api/users/${currentUserId}/slots`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!slotsResp.ok) { alert('Error obteniendo slots'); return; }
      const slots = await slotsResp.json();

      await Promise.all(slots.map(slot =>
        fetch(`/api/users/${currentUserId}/slots/${slot.slot_number}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ explorer_name: value })
        })
      ));

      // Actualizar la UI
      const explorerEl = document.getElementById('explorerName');
      if (explorerEl) {
        explorerEl.textContent = value || '-';
        explorerEl.dataset.value = value || '';
      }
      alert('Nombre de explorador actualizado');

    } else {
      const response = await fetch(`/api/users/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });
      if (response.ok) {
        alert('Usuario actualizado');
        loadUserData(currentUserId);
      } else {
        alert('Error al actualizar usuario');
      }
    }

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    alert('Error en la operación');
  }
}

// ============================================================================
// SETUP BOTONES DE ACCIÓN
// ============================================================================

function setupActionButtons() {
  const deleteBtn = document.getElementById('deleteBtn');
  const restoreBtn = document.getElementById('restoreBtn');

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => permanentlyDeleteUser(currentUserId));
  }

  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => restoreUser(currentUserId));
  }
}

// ============================================================================
// ELIMINAR USUARIO PERMANENTEMENTE (HARD DELETE)
// ============================================================================

async function permanentlyDeleteUser(userId) {
  if (!confirm(`¿ELIMINAR PERMANENTEMENTE a ${userData.username}? Esta acción NO se puede deshacer.`)) {
    return;
  }

  if (!confirm('¿ESTÁS SEGURO? Esta es la última oportunidad para cancelar.')) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}/permanent`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      alert('Usuario eliminado permanentemente');
      window.location.href = '/admin/users';
    } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
    }

  } catch (error) {
    console.error('Error eliminando usuario permanentemente:', error);
  }
}

// ============================================================================
// RESTAURAR USUARIO
// ============================================================================

async function restoreUser(userId) {
  if (!confirm(`¿Restaurar a ${userData.username}?`)) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/users/${userId}/restore`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      alert('Usuario restaurado');
      loadUserData(userId);
    } else {
      alert('Error al restaurar usuario');
    }

  } catch (error) {
    console.error('Error restaurando usuario:', error);
  }
}

// ============================================================================
// MODALES
// ============================================================================

function openCreateModal() {
  document.getElementById('createUserModal').style.display = 'flex';
}

function closeCreateModal() {
  document.getElementById('createUserModal').style.display = 'none';
  document.getElementById('createUserForm').reset();
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
  window.location.href = '/admin/users';
}

// ============================================================================
// CREAR USUARIO
// ============================================================================

document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;
  const role = document.getElementById('newRole').value;

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    if (response.ok) {
      closeCreateModal();
      document.getElementById('successMessage').textContent = `Usuario "${username}" creado correctamente`;
      document.getElementById('successModal').style.display = 'flex';
    } else {
      const data = await response.json();
      alert('Error: ' + (data.error || 'No se pudo crear el usuario'));
    }

  } catch (error) {
    console.error('Error creando usuario:', error);
    alert('Error en la operación');
  }
});