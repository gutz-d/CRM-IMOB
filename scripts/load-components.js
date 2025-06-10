// Carrega HTML de componentes externos e injeta nos containers
export async function loadComponent(containerSelector, componentPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  try {
    const resp = await fetch(componentPath);
    if (!resp.ok) throw new Error('Erro ao carregar componente: ' + componentPath);
    const html = await resp.text();
    container.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

export async function loadAllComponents() {
  await loadComponent('#sidebar', 'components/sidebar.html');
  await loadComponent('#main-header', 'components/header.html');
  await loadComponent('#confirmation-modal', 'components/modal.html');
  // Toast normalmente é só um container, mas pode ser carregado também se necessário
  // await loadComponent('#toast-container', 'components/toast.html');
}

// Para uso: import { loadAllComponents } from './load-components.js';
// e chame loadAllComponents() antes de inicializar os scripts dos componentes.
