// ============================================================================
// POKÉSECTOR ADMIN PANEL - DASHBOARD.JS
// Carga estadísticas en tiempo real desde la API (solo datos reales)
// ============================================================================

let globalStats = {
  totalUsers: 0,
  totalGames: 0,
  totalPokemon: 0,
  usersThisWeek: 0,
  gamesThisWeek: 0,
  pokemonThisWeek: 0
};

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    window.location.href = '/login';
    return;
  }

  loadDashboardData();
});

// ============================================================================
// CARGAR TODOS LOS DATOS DEL DASHBOARD
// ============================================================================

async function loadDashboardData() {
  try {
    // Cargar datos en paralelo
    await Promise.all([
      loadUserStats(),
      loadGameStats(),
      loadPokemonStats(),
      loadTop3Players(),
      loadDifficultyStats()
    ]);
  } catch (error) {
    console.error('Error cargando dashboard:', error);
  }
}

// ============================================================================
// ESTADÍSTICAS DE USUARIOS
// ============================================================================

async function loadUserStats() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const users = await response.json();
    globalStats.totalUsers = users.length;

    // Calcular usuarios registrados esta semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    globalStats.usersThisWeek = users.filter(user => {
      return new Date(user.createdAt) > oneWeekAgo;
    }).length;

    document.getElementById('totalUsers').textContent = globalStats.totalUsers;
    updateChangeElement('totalUsers', globalStats.usersThisWeek);

  } catch (error) {
    console.error('Error cargando estadísticas de usuarios:', error);
    document.getElementById('totalUsers').textContent = '0';
  }
}

// ============================================================================
// ESTADÍSTICAS DE PARTIDAS
// ============================================================================

async function loadGameStats() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/ranking', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const ranking = await response.json();
    globalStats.totalGames = ranking.length;

    // Calcular partidas completadas esta semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    globalStats.gamesThisWeek = ranking.filter(game => {
      return new Date(game.completed_at) > oneWeekAgo;
    }).length;

    document.getElementById('totalGames').textContent = globalStats.totalGames;
    updateChangeElement('totalGames', globalStats.gamesThisWeek);

  } catch (error) {
    console.error('Error cargando estadísticas de partidas:', error);
    document.getElementById('totalGames').textContent = '0';
  }
}

// ============================================================================
// ESTADÍSTICAS DE POKÉMON CAPTURADOS
// ============================================================================

async function loadPokemonStats() {
  try {
    const accessToken = localStorage.getItem('access_token');

    // Obtener todos los usuarios
    const usersResponse = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const users = await usersResponse.json();
    let totalPokemon = 0;
    let pokemonThisWeek = 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Obtener Pokémon de cada usuario
    for (const user of users) {
      try {
        const pokedexResponse = await fetch(`/api/users/${user.id}/pokedex`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (pokedexResponse.ok) {
          const pokedex = await pokedexResponse.json();
          totalPokemon += pokedex.length;

          // Contar Pokémon capturados esta semana
          pokemonThisWeek += pokedex.filter(pokemon => {
            return new Date(pokemon.captured_at) > oneWeekAgo;
          }).length;
        }
      } catch (error) {
        continue;
      }
    }

    globalStats.totalPokemon = totalPokemon;
    globalStats.pokemonThisWeek = pokemonThisWeek;

    document.getElementById('totalPokemon').textContent = globalStats.totalPokemon;
    updateChangeElement('totalPokemon', globalStats.pokemonThisWeek);

  } catch (error) {
    console.error('Error cargando estadísticas de Pokémon:', error);
    document.getElementById('totalPokemon').textContent = '0';
  }
}

// ============================================================================
// ACTUALIZAR ELEMENTO DE CAMBIO SEMANAL
// ============================================================================

function updateChangeElement(elementId, weekChange) {
  const element = document.getElementById(elementId);
  if (element && element.nextElementSibling) {
    const changeElement = element.nextElementSibling;
    const sign = weekChange > 0 ? '+' : '';
    changeElement.textContent = `${sign}${weekChange} esta semana`;
  }
}

// ============================================================================
// TOP 3 JUGADORES
// ============================================================================

async function loadTop3Players() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/ranking', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const ranking = await response.json();

    // Tomar los 3 primeros (ya están ordenados por ranking)
    const top3 = ranking.slice(0, 3);

    // Llenar las 3 tarjetas
    for (let i = 0; i < 3; i++) {
      const player = top3[i];

      if (player) {
        const totalEncounters = player.captured_count + player.escaped_count;
        const percentage = totalEncounters > 0 
          ? ((player.captured_count / totalEncounters) * 100).toFixed(2)
          : '0';

        document.getElementById(`player${i + 1}Name`).textContent = player.username;
        document.getElementById(`player${i + 1}Captures`).textContent = `${player.captured_count} capturados`;
        document.getElementById(`player${i + 1}Difficulty`).textContent = `${player.difficulty_id.charAt(0).toUpperCase() + player.difficulty_id.slice(1)} - ${percentage}%`;
      } else {
        document.getElementById(`player${i + 1}Name`).textContent = 'Sin datos';
        document.getElementById(`player${i + 1}Captures`).textContent = '0 capturados';
        document.getElementById(`player${i + 1}Difficulty`).textContent = 'N/A';
      }
    }
  } catch (error) {
    console.error('Error cargando top 3 jugadores:', error);

    // Llenar con datos vacíos
    for (let i = 0; i < 3; i++) {
      document.getElementById(`player${i + 1}Name`).textContent = 'Error al cargar';
      document.getElementById(`player${i + 1}Captures`).textContent = '0 capturados';
      document.getElementById(`player${i + 1}Difficulty`).textContent = 'N/A';
    }
  }
}

// ============================================================================
// ESTADÍSTICAS POR DIFICULTAD
// ============================================================================

async function loadDifficultyStats() {
  try {
    const accessToken = localStorage.getItem('access_token');

    const response = await fetch('/api/ranking', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const ranking = await response.json();

    // Contar partidas por dificultad
    const difficulties = {
      'facil': 0,
      'normal': 0,
      'dificil': 0,
      'infernal': 0
    };

    ranking.forEach(game => {
      const difficulty = game.difficulty_id.toLowerCase();
      if (difficulties[difficulty] !== undefined) {
        difficulties[difficulty]++;
      }
    });

    const total = ranking.length;

    // Actualizar tarjetas
    updateDifficultyCard('easy', difficulties.facil, total);
    updateDifficultyCard('normal', difficulties.normal, total);
    updateDifficultyCard('hard', difficulties.dificil, total);
    updateDifficultyCard('infernal', difficulties.infernal, total);

  } catch (error) {
    console.error('Error cargando estadísticas por dificultad:', error);

    // Establecer a 0 si hay error
    updateDifficultyCard('easy', 0, 0);
    updateDifficultyCard('normal', 0, 0);
    updateDifficultyCard('hard', 0, 0);
    updateDifficultyCard('infernal', 0, 0);
  }
}

// ============================================================================
// ACTUALIZAR TARJETA DE DIFICULTAD
// ============================================================================

function updateDifficultyCard(difficulty, count, total) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  document.getElementById(`${difficulty}Count`).textContent = count;
  document.getElementById(`${difficulty}Fill`).style.width = `${percentage}%`;
}