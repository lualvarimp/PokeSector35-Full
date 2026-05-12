// ============================================================================
// POKÉSECTOR ADMIN PANEL - RANKING.JS
// Gestión de tabla de ranking global
// ============================================================================

const ITEMS_PER_PAGE = 40;
let currentPage = 1;
let allRanking = [];
let displayRanking = []; // Array con posición asignada
let sorter = null;

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    window.location.href = '/login';
    return;
  }

  loadRanking();
  setupFilters();
});

// ============================================================================
// CARGAR RANKING
// ============================================================================

async function loadRanking() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/ranking', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const ranking = await response.json();

    // Asignar posiciones globales SOLO UNA VEZ al cargar
    allRanking = ranking.map((item, index) => ({
      ...item,
      _globalPosition: index + 1
    }));
    
    displayRanking = [...allRanking];

    // Inicializar sorter
    if (!sorter) {
      sorter = new RankingSort('.ranking-table', displayRanking, onSortComplete);
    } else {
      sorter.setData(displayRanking);
    }

    currentPage = 1;
    renderTable(displayRanking);

  } catch (error) {
    console.error('Error cargando ranking:', error);
  }
}

// ============================================================================
// CALLBACK CUANDO EL SORTER TERMINA DE ORDENAR
// ============================================================================

function onSortComplete(sortedData) {
  // No reasignar posiciones - mantener _globalPosition original
  displayRanking = sortedData;
  currentPage = 1;
  renderTable(displayRanking);
}

// ============================================================================
// RENDERIZAR TABLA CON PAGINACIÓN
// ============================================================================

function renderTable(ranking) {
  const tbody = document.getElementById('rankingTableBody');
  const userRole = localStorage.getItem('user_role');
  
  if (ranking.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay partidas en el ranking</td></tr>';
    updatePaginationUI(0);
    return;
  }

  // Calcular paginación
  const totalPages = Math.ceil(ranking.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRanking = ranking.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  tbody.innerHTML = paginatedRanking.map((entry) => {
    const totalEncounters = entry.captured_count + entry.escaped_count;
    const percentage = totalEncounters > 0 
      ? ((entry.captured_count / totalEncounters) * 100).toFixed(2)
      : 0;
    const completedAt = new Date(entry.completed_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Usar posición global original, no índice de la página
    const position = entry._globalPosition;
    const rowClass = position <= 3 ? `top-${position}` : '';

    return `
      <tr class="${rowClass}">
        <td class="position">${position}</td>
        <td>${entry.username}</td>
        <td>${entry.captured_count}</td>
        <td>${entry.escaped_count}</td>
        <td class="percentage">${percentage}%</td>
        <td><span class="difficulty-badge ${entry.difficulty_id}">${entry.difficulty_id}</span></td>
        <td>${completedAt}</td>
        <td>
          <div class="actions-cell">
            ${userRole === 'admin' ? `
              <button class="btn-small btn-delete" onclick="deleteRanking('${entry.id}', '${entry.username}')">Eliminar</button>
            ` : ''}
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
    renderTable(displayRanking);
  }
}

function nextPage() {
  const totalPages = Math.ceil(displayRanking.length / ITEMS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable(displayRanking);
  }
}

// ============================================================================
// SETUP FILTROS
// ============================================================================

function setupFilters() {
  const difficultyFilter = document.getElementById('difficultyFilter');
  const letterFilter = document.getElementById('letterFilter');

  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', applyFilters);
  }

  if (letterFilter) {
    letterFilter.addEventListener('change', applyFilters);
  }
}

// ============================================================================
// APLICAR FILTROS
// ============================================================================

function applyFilters() {
  const difficultyFilter = document.getElementById('difficultyFilter').value;
  const letterFilter = document.getElementById('letterFilter').value;

  sorter.filter(entry => {
    if (difficultyFilter !== 'todos' && entry.difficulty_id !== difficultyFilter) {
      return false;
    }
    
    if (letterFilter !== 'all') {
      const firstLetter = entry.username.charAt(0).toUpperCase();
      if (firstLetter !== letterFilter) {
        return false;
      }
    }
    
    return true;
  });

  currentPage = 1;
}

// ============================================================================
// ELIMINAR ENTRADA DE RANKING (ADMIN)
// ============================================================================

async function deleteRanking(rankingId, username) {
  if (!confirm(`¿Eliminar la entrada de ranking de ${username}?`)) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch(`/api/ranking/${rankingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
      alert('Entrada eliminada correctamente');
      location.reload();
    } else {
      alert('Error al eliminar la entrada');
    }

  } catch (error) {
    console.error('Error eliminando ranking:', error);
  }
}