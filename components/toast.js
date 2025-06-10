// Toast JS Component
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Para uso: import { showToast } from '../components/toast.js';
// e chame showToast('Mensagem', 'success'|'error'|'info'|'warning')
