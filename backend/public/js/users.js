// ============================================================================
// POKÉSECTOR ADMIN PANEL - USERS.JS
// Gestión de usuarios
// Utiliza multiColumnSort.js para ordenamiento multi-columna
// ============================================================================

const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let allUsers = [];
let filteredUsers = []; // Almacenar usuarios filtrados
let sorter = null;

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    window.location.href = '/login';
    return;
  }

  loadUsers();
  setupFilters();
});

// ============================================================================
// CARGAR USUARIOS
// ============================================================================

async function loadUsers() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Error cargando usuarios');
    }

    allUsers = await response.json();
    filteredUsers = [...allUsers];

    // Inicializar sorter SOLO LA PRIMERA VEZ
    if (!sorter) {
      sorter = new UsersSort('.users-table', filteredUsers, renderUsers);
    } else {
      sorter.setData(filteredUsers);
    }

    currentPage = 1;
    renderUsers(filteredUsers);

  } catch (error) {
    console.error('Error cargando usuarios:', error);
  }
}

// ============================================================================
// RENDERIZAR USUARIOS CON PAGINACIÓN
// ============================================================================

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay usuarios</td></tr>';
    updatePaginationUI(0);
    return;
  }

  // Calcular paginación
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, endIndex);

  tbody.innerHTML = paginatedUsers.map(user => {
    const date = new Date(user.created_at);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Determinar si el usuario está habilitado o deshabilitado
    const isDisabled = user.deleted_at !== null;
    const buttonText = isDisabled ? 'Habilitar' : 'Deshabilitar';
    const buttonClass = isDisabled ? 'btn-enable' : 'btn-disable';

    return `
    <tr>
      <td>#${user.id}</td>
      <td>${user.username}</td>
      <td>
        <span class="role-badge ${user.role}">
          ${user.role}
        </span>
      </td>
      <td>${formattedDate}</td>
      <td>
        <div class="actions-cell">
          <a href="/admin/users/${user.id}" class="btn-small btn-view">Ver</a>
          <button class="btn-small ${buttonClass}" onclick="toggleUserStatus(${user.id}, ${isDisabled})">${buttonText}</button>
        </div>
      </td>
    </tr>
  `;
  }).join('');

  updatePaginationUI(totalPages);
}

// ============================================================================
// ACTUALIZAR UI DE PAGINACIÓN
// ============================================================================

function updatePaginationUI(totalPages) {
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
  }
}

// ============================================================================
// PAGINACIÓN
// ============================================================================

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderUsers(filteredUsers);
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderUsers(filteredUsers);
  }
}

// ============================================================================
// SETUP FILTROS
// ============================================================================

function setupFilters() {
  const roleFilter = document.getElementById('roleFilter');
  const letterFilter = document.getElementById('letterFilter');
  const statusFilter = document.getElementById('statusFilter');

  if (roleFilter) {
    roleFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });
  }

  if (letterFilter) {
    letterFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentPage = 1;
      applyFilters();
    });
  }
}

// ============================================================================
// APLICAR FILTROS
// ============================================================================

function applyFilters() {
  const roleFilter = document.getElementById('roleFilter').value;
  const letterFilter = document.getElementById('letterFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;

  // Filtrar datos originales
  filteredUsers = allUsers.filter(user => {
    // Filtrar por rol
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }

    // Filtrar por letra inicial del usuario
    if (letterFilter !== 'all') {
      const firstLetter = user.username.charAt(0).toUpperCase();
      if (firstLetter !== letterFilter) {
        return false;
      }
    }

    // Filtrar por estado (habilitado/deshabilitado)
    if (statusFilter !== 'all') {
      const isDisabled = user.deleted_at !== null;
      if (statusFilter === 'enabled' && isDisabled) {
        return false;
      }
      if (statusFilter === 'disabled' && !isDisabled) {
        return false;
      }
    }

    return true;
  });

  // Actualizar sorter con datos filtrados
  if (sorter) {
    sorter.setData(filteredUsers);
  }

  currentPage = 1;
  renderUsers(filteredUsers);
}

// ============================================================================
// TOGGLE ESTADO DEL USUARIO (DESHABILITAR/HABILITAR)
// ============================================================================

async function toggleUserStatus(userId, isCurrentlyDisabled) {
  const action = isCurrentlyDisabled ? 'habilitar' : 'deshabilitar';
  const confirmMessage = isCurrentlyDisabled 
    ? '¿Habilitar este usuario?' 
    : '¿Deshabilitar este usuario?';

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    // Si está deshabilitado, restaurarlo. Si está habilitado, deshabilitarlo.
    let url;
    let method;

    if (isCurrentlyDisabled) {
      // Habilitar (restaurar)
      url = `/api/users/${userId}/restore`;
      method = 'PUT';
    } else {
      // Deshabilitar (soft delete)
      url = `/api/users/${userId}`;
      method = 'DELETE';
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      // Actualizar el usuario en el array local
      const userIndex = allUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        if (isCurrentlyDisabled) {
          // Restaurar: eliminar deleted_at
          allUsers[userIndex].deleted_at = null;
        } else {
          // Deshabilitar: añadir deleted_at
          allUsers[userIndex].deleted_at = new Date().toISOString();
        }
      }

      // Re-aplicar filtros y renderizar
      applyFilters();
      alert(`Usuario ${action} correctamente`);
    } else {
      const data = await response.json();
      alert(`Error: ${data.error || 'No se pudo actualizar el estado del usuario'}`);
    }

  } catch (error) {
    console.error('Error actualizando estado del usuario:', error);
    alert('Error en la operación');
  }
}