// Exemplo de teste unitário simples para navegação e tema
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../scripts/app.js';

describe('App Navegação e Tema', () => {
  let app;
  beforeEach(() => {
    document.body.innerHTML = `
      <aside id="sidebar"></aside>
      <button id="toggle-sidebar"></button>
      <button id="theme-toggle"><i></i></button>
      <nav><a class="nav-item" data-section="dashboard"></a></nav>
      <main><section class="content-section" id="dashboard-section"></section></main>
      <input class="search-input" />
      <div class="breadcrumb"><ul></ul></div>
      <div id="ai-assistant"></div>
    `;
    app = new App();
  });

  it('deve alternar tema', () => {
    const initialTheme = app.state.isDarkTheme;
    app.toggleTheme();
    expect(app.state.isDarkTheme).not.toBe(initialTheme);
  });

  it('deve navegar para leads', () => {
    app.navigateTo('leads');
    expect(app.state.currentSection).toBe('leads');
  });
});
