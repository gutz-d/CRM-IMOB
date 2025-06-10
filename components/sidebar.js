// Sidebar JS Component
export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// Para uso: import { initSidebar } from '../components/sidebar.js';
// e chame initSidebar() no carregamento da página.
