// Header JS Component
export function initHeader() {
  // Exemplo: adicionar eventos de busca, notificações, etc.
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      searchInput.setAttribute('aria-expanded', 'true');
    });
    searchInput.addEventListener('blur', () => {
      searchInput.setAttribute('aria-expanded', 'false');
    });
  }
}

// Para uso: import { initHeader } from '../components/header.js';
// e chame initHeader() no carregamento da página.
