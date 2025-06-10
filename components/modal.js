// Modal JS Component
export function initModal() {
  const modal = document.getElementById('confirmation-modal');
  const closeBtn = modal?.querySelector('.close-btn');
  const cancelBtn = modal?.querySelector('.cancel-btn');
  function closeModal() {
    modal.classList.remove('open');
  }
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
// Para uso: import { initModal } from '../components/modal.js';
// e chame initModal() no carregamento da página.
