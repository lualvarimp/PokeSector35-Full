// =============================================================================
//  menu-contact.js — Contacto: enviar email al desarrollador
// =============================================================================
//  RESPONSABILIDAD: Gestionar la vista de contacto del menú.
//  El email se construye dinámicamente para evitar que bots de spam
//  lo detecten al rastrear el código fuente.
//
//  REGISTRA HANDLERS PARA:
//    · 'contact' — vista de contacto
// =============================================================================

import {
    showView, moveCursorUp, moveCursorDown, playClick,
    getCursorIndex, registerHandler, showAlert,
} from './menu-nav.js';

// ── Registrar handler ────────────────────────────────────────────────────────
registerHandler('contact', handleContact);

// =============================================================================
//  VISTA: CONTACTO
// =============================================================================
function handleContact(action) {
    if (action === 'pressUp')   { moveCursorUp();   return; }
    if (action === 'pressDown') { moveCursorDown(); return; }
    if (action === 'pressB')    { playClick(); showView('main'); return; }

    if (action === 'pressA') {
        playClick();
        const list     = document.querySelector('.menu-contact .menu-list');
        const items    = [...list.querySelectorAll('.menu-item')].filter(
            el => !el.classList.contains('hidden')
        );
        const selected = items[getCursorIndex()]?.dataset.contact;

        switch (selected) {
            case 'send': openMail(); break;
            case 'back': showView('main'); break;
        }
    }
}

// =============================================================================
//  ABRIR CLIENTE DE EMAIL
// =============================================================================
//  El email se construye a partir de trozos separados para que los bots
//  de scraping no encuentren la dirección en texto plano en el código.
function openMail() {
    const u = 'pokesector35';
    const d = 'gmail';
    const t = 'com';
    const addr = u + '@' + d + '.' + t;
    const subject = encodeURIComponent('PokéSector 35 — Contacto');

    window.location.href = 'mai' + 'lto:' + addr + '?subject=' + subject;

    showAlert('¡Se ha abierto tu app de email!\n\n¡Muchas gracias por ponerte en contacto con nosotros!', 'contact');
}