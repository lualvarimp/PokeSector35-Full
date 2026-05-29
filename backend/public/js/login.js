// ============================================================================
// POKÉSECTOR ADMIN PANEL - LOGIN.JS
// SOLO lógica de formulario de login
// layout.js maneja el tema claro/oscuro y menú
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageArea = document.getElementById('messageArea');

  // =========================================================================
  // MANEJO DEL FORMULARIO DE LOGIN
  // =========================================================================

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validación básica
    if (!username || !password) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    // Deshabilitar botón mientras se procesa
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
      const response = await fetch('/pokesector35/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar tokens en localStorage para peticiones AJAX del panel
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_role', data.role);

        // La cookie admin_token la establece el servidor con HttpOnly
        // JavaScript no la toca — el navegador la gestiona solo

        showMessage('¡LOGIN CORRECTO! REDIRIGIENDO...', 'success');

        // Redirigir al dashboard admin
        setTimeout(() => {
          window.location.href = '/pokesector35/admin/dashboard';
        }, 1000);

      } else {
        // Error en login
        showMessage(data.error || 'USUARIO O CONTRASEÑA INCORRECTOS', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }

    } catch (error) {
      console.error('Error en login:', error);
      showMessage('Error de conexión. Intenta nuevamente.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  });

  // =========================================================================
  // FUNCIÓN PARA MOSTRAR MENSAJES
  // =========================================================================

  function showMessage(message, type) {
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      messageArea.textContent = '';
      messageArea.className = 'message-area';
    }, 5000);
  }
});