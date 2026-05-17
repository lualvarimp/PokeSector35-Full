// =============================================================================
//  menu-nav.js — Navegación central del menú principal
// =============================================================================
//  RESPONSABILIDAD: Estado del menú (activo/inactivo, vista actual, cursor),
//  lógica de cursor (SVG, up/down), switching de vistas, routing de acciones,
//  y visibilidad condicional de items según sesión.
//
//  FUNCIONES EXPORTADAS:
//    · showMenu()           — muestra el menú principal
//    · updateMenu(action)   — enruta una acción a la vista activa
//    · isMenuOpen()         — devuelve si el menú está activo
//    · showView(view)       — cambia a una vista del menú (uso interno)
//    · moveCursorUp()       — mueve cursor arriba (uso compartido)
//    · moveCursorDown()     — mueve cursor abajo (uso compartido)
//    · playClick()          — sonido de click (uso compartido)
//    · syncMenuVisibility() — actualiza visibilidad según sesión
// =============================================================================

import { gameState }                        from './game-state.js';
import { clickSound }                       from './sounds.js';
import * as api                             from '../services/apiService.js';

// ── Estado del menú ──────────────────────────────────────────────────────────
let menuActive  = false;
let currentView = 'main';
let cursorIndex = 0;

// Getters para que los submódulos consulten el estado sin acoplarse
export function isMenuOpen()      { return menuActive; }
export function getCurrentView()  { return currentView; }
export function getCursorIndex()  { return cursorIndex; }
export function setMenuActive(v)  { menuActive = v; }
export function setCursorIndex(v) { cursorIndex = v; }

// ── Imports diferidos de submódulos (evita circulares) ───────────────────────
// Los handlers se registran desde cada submódulo llamando a registerHandler()
const viewHandlers = {};
export function registerHandler(viewName, handler) {
    viewHandlers[viewName] = handler;
}

// =============================================================================
//  SHOW MENU — Punto de entrada principal
// =============================================================================
export function showMenu() {
    const homeScreen = document.querySelector('.home-screen');
    const menuScreen = document.querySelector('.menu-screen');

    if (homeScreen) homeScreen.classList.add('hidden');
    if (menuScreen) menuScreen.classList.remove('hidden');

    menuActive  = true;
    cursorIndex = 0;
    showView('main');
    syncMenuVisibility();
}

// =============================================================================
//  UPDATE MENU — Enrutador central de acciones
// =============================================================================
export function updateMenu(action) {
    if (!menuActive) return;

    // handleMain se gestiona aquí directamente por ser la vista raíz
    if (currentView === 'main') {
        handleMain(action);
        return;
    }

    // El resto se delega al handler registrado para la vista activa
    const handler = viewHandlers[currentView];
    if (handler) handler(action);
}

// =============================================================================
//  SHOW VIEW — Cambia la vista visible del menú
// =============================================================================
const VIEW_SELECTORS = [
    '.menu-main', '.menu-start', '.menu-slots', '.menu-info', '.menu-customize',
    '.menu-color', '.menu-explorer', '.menu-difficulty', '.menu-sticker', '.menu-vibration',
    '.menu-ranking', '.menu-pokedex', '.menu-account', '.menu-confirm',
];

export function showView(view) {
    VIEW_SELECTORS.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('hidden');
    });

    const target = document.querySelector(`.menu-${view}`);
    if (target) target.classList.remove('hidden');

    currentView = view;
    cursorIndex = 0;
    updateCursor();
    syncMenuVisibility();
}

// =============================================================================
//  CURSOR — SVG arrow rendering (CRITICAL: must produce exact same SVG)
// =============================================================================
export function updateCursor() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;

    const items = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    );

    items.forEach((item, i) => {
        if (!item.dataset.label) {
            item.dataset.label = item.textContent.trim().replace(/^\s*/, '');
        }
        const text    = item.dataset.label;
        const sub     = item.dataset.sublabel || '';
        const cursor  = i === cursorIndex
            ? '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,5 0,10" fill="currentColor"/></svg>'
            : '';

        item.classList.toggle('active', i === cursorIndex);

        item.innerHTML = `<span class="menu-cursor">${cursor}</span> ${text}`
            + (sub ? `<span class="menu-slot-sub">${sub}</span>` : '');
    });
}

export function moveCursorUp() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;
    const total = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    ).length;
    cursorIndex = (cursorIndex - 1 + total) % total;
    playClick();
    updateCursor();
}

export function moveCursorDown() {
    const list = document.querySelector(`.menu-${currentView} .menu-list`);
    if (!list) return;
    const total = [...list.querySelectorAll('.menu-item')].filter(
        el => !el.classList.contains('hidden')
    ).length;
    cursorIndex = (cursorIndex + 1) % total;
    playClick();
    updateCursor();
}

// =============================================================================
//  SYNC MENU VISIBILITY — Nombre + items condicionales según sesión
// =============================================================================
export function syncMenuVisibility() {
    const hasSession = api.isLoggedIn();

    const playerNameEls = document.querySelectorAll('.menu-player-name');
    playerNameEls.forEach(el => {
        el.textContent = hasSession ? (gameState.playerName || '') : '';
    });

    const accountLogout = document.querySelector('[data-account="logout"]');
    const accountDelete = document.querySelector('[data-account="delete"]');
    if (accountLogout) accountLogout.classList.toggle('hidden', !hasSession);
    if (accountDelete) accountDelete.classList.toggle('hidden', !hasSession);
    
    const continueItem = document.getElementById('continue-item');
    if (continueItem) continueItem.classList.toggle('hidden', !hasSession);
}

// =============================================================================
//  HANDLE MAIN — Vista principal del menú (aquí para evitar circulares)
// =============================================================================
function handleMain(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }

    if (action === 'pressA') {
        playClick();
        const list    = document.querySelector('.menu-main .menu-list');
        const items   = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[cursorIndex].dataset.option;

        // Despacha a los submódulos. Los imports dinámicos evitan circulares
        // y permiten que cada módulo se registre de forma independiente.
        switch (selected) {
            case 'start':
                import('./menu-start.js').then(m => m.onStart());
                break;
            case 'customize':
                showView('customize');
                break;
            case 'ranking':
                import('./menu-ranking.js').then(m => m.onRanking());
                break;
            case 'pokedex':
                import('./menu-pokedex.js').then(m => m.onPokedex());
                break;
            case 'account':
                showView('account');
                break;
            case 'logout':
                import('./menu-account.js').then(m => m.onLogout());
                break;
        }
    }
}

// =============================================================================
//  UTILIDADES COMPARTIDAS
// =============================================================================
export function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// Muestra un mensaje informativo con opciones (crear cuenta, continuar, volver).
// Se usa desde menu-start.js (continuar sin cuenta) y menu-ranking.js (ranking sin sesión).
export function showInfoMessage(text, showContinueOption) {
    const infoText = document.querySelector('.menu-info .menu-info-text');
    const list     = document.querySelector('.menu-info .menu-list');
    if (!infoText || !list) return;

    infoText.textContent = text;
    list.innerHTML = '';

    const goAccount      = document.createElement('li');
    goAccount.className  = 'menu-item active';
    goAccount.dataset.action = 'go-account';
    goAccount.textContent    = 'IR A LA CUENTA';
    list.appendChild(goAccount);

    if (showContinueOption) {
        const continueLocal      = document.createElement('li');
        continueLocal.className  = 'menu-item';
        continueLocal.dataset.action = 'continue-local';
        continueLocal.textContent    = '  CONTINUAR SIN CUENTA';
        list.appendChild(continueLocal);
    }

    const back       = document.createElement('li');
    back.className   = 'menu-item';
    back.dataset.action = 'back';
    back.textContent    = '  VOLVER';
    list.appendChild(back);

    showView('info');
}
// =============================================================================
//  SHOW ALERT — Sustituye a window.alert()
// =============================================================================
// Muestra un mensaje informativo dentro de la consola.
// El jugador lo cierra con A/SPACE o B/ESC.
// backView: vista a la que volver al cerrar (por defecto 'main')
let _alertBackView = 'main';
let _alertCallback = null;

export function showAlert(text, backView = 'main', callback = null) {
    _alertBackView = backView;
    _alertCallback = callback;

    const confirmText = document.querySelector('.menu-confirm-text');
    const menuConfirm = document.querySelector('.menu-confirm');
    if (!confirmText || !menuConfirm) return;

    confirmText.innerHTML = text;

    // Ocultar instrucciones de confirmación y mostrar solo "Continuar"
    menuConfirm.querySelectorAll('p:not(.menu-confirm-text)').forEach(p => p.classList.add('hidden'));

    let okHint = document.getElementById('alert-ok-hint');
    if (!okHint) {
        okHint    = document.createElement('p');
        okHint.id = 'alert-ok-hint';
        menuConfirm.appendChild(okHint);
    }
    okHint.innerHTML = '<strong>A/SPACE</strong> o <strong>B/ESC:</strong> Continuar';
    okHint.classList.remove('hidden');

    menuConfirm.dataset.mode = 'alert';
    showView('confirm');
}

// =============================================================================
//  SHOW CONFIRM — Sustituye a window.confirm()
// =============================================================================
// Muestra una pregunta de confirmación dentro de la consola.
// onConfirm: callback que se ejecuta si el jugador pulsa A/SPACE
// onCancel:  callback que se ejecuta si el jugador pulsa B/ESC (opcional)
let _confirmCallback = null;
let _cancelCallback  = null;

export function showConfirm(text, onConfirm, onCancel = null) {
    _confirmCallback = onConfirm;
    _cancelCallback  = onCancel;

    const confirmText = document.querySelector('.menu-confirm-text');
    const menuConfirm = document.querySelector('.menu-confirm');
    if (!confirmText || !menuConfirm) return;

    confirmText.innerHTML = text;

    // Restaurar instrucciones de confirmación
    menuConfirm.querySelectorAll('p:not(.menu-confirm-text)').forEach(p => p.classList.remove('hidden'));

    const okHint = document.getElementById('alert-ok-hint');
    if (okHint) okHint.classList.add('hidden');

    menuConfirm.dataset.mode = 'confirm';
    showView('confirm');
}

// Handler para la vista 'confirm' — gestiona A/B según el modo
registerHandler('confirm', function handleConfirm(action) {
    const menuConfirm = document.querySelector('.menu-confirm');
    const mode = menuConfirm?.dataset.mode || 'alert';

    if (action === 'pressA') {
        playClick();
        if (mode === 'alert') {
            const cb = _alertCallback;
            _alertCallback = null;
            showView(_alertBackView);
            if (cb) cb();
        } else {
            const cb = _confirmCallback;
            _confirmCallback = null;
            _cancelCallback  = null;
            showView('main');
            if (cb) cb();
        }
    }

    if (action === 'pressB') {
        playClick();
        if (mode === 'alert') {
            const cb = _alertCallback;
            _alertCallback = null;
            showView(_alertBackView);
            if (cb) cb();
        } else {
            const cb = _cancelCallback;
            _confirmCallback = null;
            _cancelCallback  = null;
            showView('main');
            if (cb) cb();
        }
    }
});