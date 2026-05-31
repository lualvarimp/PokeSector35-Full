// ============================================================================
// LOGOUT
// ============================================================================

async function performLogout(event) {
  event.preventDefault();

  try {
    const refreshToken = localStorage.getItem('refresh_token');

    await fetch('/pokesector35/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');

    // La cookie admin_token la borra el servidor con HttpOnly
    // JavaScript no puede tocarla — el servidor la invalida en /api/auth/logout

    // Redirigir a login y reemplazar el historial
    // Usar location.replace() para que NO se pueda volver atrás
    window.location.replace('/pokesector35/login');

  } catch (error) {
    console.error('Error en logout:', error);
    // Aunque falle, redirigir a login y limpiar tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    window.location.replace('/pokesector35/login');
  }
}

// ============================================================================
// VERIFICAR TOKEN AL CARGAR PÁGINA (ANTI-BACK BUTTON)
// ============================================================================

function checkAuthOnLoad() {
  const accessToken = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  
  // Si no hay token y no estamos en login, redirigir a login
  if (!accessToken && !window.location.pathname.includes('/login')) {
    window.location.replace('/pokesector35/login');
  }
  
  // Si hay token pero es inválido, redirigir a login
  // (esto lo valida el servidor al hacer cualquier petición)
}

// ============================================================================
// MENU TOGGLE (RESPONSIVE)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación al cargar
  checkAuthOnLoad();

  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un link
    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // THEME TOGGLE
  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) {
    // Verificar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      themeSwitch.checked = true;
    }

    themeSwitch.addEventListener('change', () => {
      const isDark = themeSwitch.checked;
      if (isDark) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Mostrar menú admin si es usuario admin
  const userRole = localStorage.getItem('user_role');
  if (userRole === 'admin') {
    const adminMenuItems = document.querySelectorAll('#adminMenu');
    adminMenuItems.forEach(item => {
      item.style.display = 'block';
    });
  }
});

// ============================================================================
// PREVENIR CACHÉ AL VOLVER ATRÁS
// ============================================================================

// Prevenir que el navegador cachee páginas autenticadas
window.addEventListener('pageshow', (event) => {
  // Si la página viene del caché (back button)
  if (event.persisted) {
    const accessToken = localStorage.getItem('access_token');
    
    // Si no hay token, redirigir a login
    if (!accessToken && !window.location.pathname.includes('/login')) {
      window.location.replace('/pokesector35/login');
    }
  }
});

// Desabilitar caché para páginas admin
window.addEventListener('pagehide', () => {
  // Evitar que el navegador guarde en caché las páginas autenticadas
  if (window.history.pushState) {
    window.history.pushState(null, '', window.location.href);
  }
});