/**
 * App principal do CRM Imobiliário
 * Responsável pela inicialização e comportamentos principais da aplicação
 */

// ===== APP CONTROLLER =====

/**
 * Classe principal do aplicativo
 */
class App {
    constructor() {
        // Estado da aplicação
        this.state = {
            currentSection: 'dashboard',
            sidebarCollapsed: false,
            isDarkTheme: true,
            data: {
                leads: [],
                clients: [],
                properties: [],
                negotiations: []
            }
        };

        // Armazena referências para elementos principais
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            toggleSidebar: document.getElementById('toggle-sidebar'),
            themeToggle: document.getElementById('theme-toggle'),
            navItems: document.querySelectorAll('.nav-item'),
            contentSections: document.querySelectorAll('.content-section'),
            searchInput: document.querySelector('.search-input'),
            breadcrumb: document.querySelector('.breadcrumb'),
            aiChat: document.getElementById('ai-assistant')
        };

        // Inicializa
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        this.loadState();
        this.setupEventListeners();
        this.applyTheme();
        this.navigateTo(this.state.currentSection);
        this.initMockData();
        
        // Exibe toast de boas vindas
        setTimeout(() => {
            toast.info('Bem-vindo ao CRM Imobiliário');
        }, 1000);
        
        console.log('✅ CRM Imobiliário inicializado');
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Toggle sidebar
        this.elements.toggleSidebar.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Toggle theme
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navegação entre seções
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.navigateTo(section);
            });
        });

        // Busca global
        this.elements.searchInput.addEventListener('keyup', debounce((e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        }, 300));

        // Botões de IA
        document.querySelector('.voice-btn').addEventListener('click', () => {
            this.toggleVoiceAssistant();
        });
        
        document.querySelector('.chat-btn').addEventListener('click', () => {
            this.toggleChatAssistant();
        });

        // Event listeners para seções específicas
        this.setupDashboardListeners();
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Alt+S = Toggle Sidebar
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.toggleSidebar();
            }
            
            // Alt+T = Toggle Theme
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Alt+1-9 = Navegação rápida
            if (e.altKey && /^[1-9]$/.test(e.key)) {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                const navItems = Array.from(this.elements.navItems);
                if (navItems[index]) {
                    const section = navItems[index].getAttribute('data-section');
                    this.navigateTo(section);
                }
            }
        });
        
        // Navegação por teclado nos menus
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, idx) => {
          item.setAttribute('tabindex', '0');
          item.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              navItems[(idx + 1) % navItems.length].focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              navItems[(idx - 1 + navItems.length) % navItems.length].focus();
            }
          });
        });
    }

    /**
     * Configura listeners específicos do dashboard
     */
    setupDashboardListeners() {
        // Botões de seleção de data
        const dateButtons = document.querySelectorAll('.date-btn');
        dateButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                dateButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateDashboardData(btn.textContent.trim());
            });
        });
    }

    /**
     * Alterna estado da sidebar
     */
    toggleSidebar() {
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
        this.elements.sidebar.classList.toggle('collapsed', this.state.sidebarCollapsed);
        this.saveState();
    }

    /**
     * Alterna entre temas claro/escuro
     */
    toggleTheme() {
        this.state.isDarkTheme = !this.state.isDarkTheme;
        this.applyTheme();
        this.saveState();
    }

    /**
     * Aplica o tema atual
     */
    applyTheme() {
        document.body.classList.toggle('theme-dark', this.state.isDarkTheme);
        document.body.classList.toggle('theme-light', !this.state.isDarkTheme);
        
        // Atualiza ícone do botão
        const themeIcon = this.elements.themeToggle.querySelector('i');
        themeIcon.className = this.state.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
    }

    /**
     * Navega para uma seção específica
     * @param {string} section - ID da seção
     */
    navigateTo(section) {
        if (!section) return;
        
        // Atualiza estado
        this.state.currentSection = section;
        this.saveState();
        
        // Atualiza navegação
        this.elements.navItems.forEach(item => {
            const itemSection = item.getAttribute('data-section');
            item.classList.toggle('active', itemSection === section);
        });
        
        // Atualiza conteúdo
        this.elements.contentSections.forEach(content => {
            const id = content.id.replace('-section', '');
            content.classList.toggle('active', id === section);
        });
        
        // Atualiza breadcrumb
        this.updateBreadcrumb(section);
        
        // Carrega dados específicos da seção
        this.loadSectionData(section);
    }

    /**
     * Atualiza breadcrumb
     * @param {string} section - Seção atual
     */
    updateBreadcrumb(section) {
        const breadcrumbList = this.elements.breadcrumb.querySelector('ul');
        
        // Nome formatado da seção
        const sectionNames = {
            dashboard: 'Dashboard',
            leads: 'Leads',
            clientes: 'Clientes',
            imoveis: 'Imóveis',
            negociacoes: 'Negociações',
            financeiro: 'Financeiro',
            relatorios: 'Relatórios',
            configuracoes: 'Configurações'
        };
        
        breadcrumbList.innerHTML = `
            <li><a href="#dashboard">Início</a></li>
            <li><span class="current-page">${sectionNames[section] || section}</span></li>
        `;
    }

    /**
     * Carrega dados específicos da seção
     * @param {string} section - Seção atual
     */
    loadSectionData(section) {
        // Carrega dados específicos para cada seção
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'leads':
                // Implementação futura
                break;
            case 'clientes':
                // Implementação futura
                break;
            case 'imoveis':
                // Implementação futura
                break;
            case 'negociacoes':
                // Implementação futura
                break;
        }
    }

    /**
     * Carrega dados do dashboard
     */
    loadDashboardData() {
        // Poderia carregar de uma API real
        // Por enquanto, usamos dados de demonstração
        this.updateDashboardData('Mês');
    }

    /**
     * Atualiza dados do dashboard com base no período
     * @param {string} period - Período selecionado
     */
    updateDashboardData(period) {
        console.log(`Atualizando dashboard para período: ${period}`);
        // Aqui viria lógica para carregar dados específicos do período
    }

    /**
     * Executa busca global
     * @param {string} query - Termo de busca
     */
    performSearch(query) {
        if (!query || query.trim() === '') return;
        
        loading.show('Buscando...');
        
        // Simulando busca
        setTimeout(() => {
            loading.hide();
            toast.info(`Busca por "${query}" realizada`);
            console.log(`Busca por: ${query}`);
        }, 1000);
    }

    /**
     * Alterna assistente de voz
     */
    toggleVoiceAssistant() {
        const voiceBtn = document.querySelector('.voice-btn');
        voiceBtn.classList.toggle('active');
        
        if (voiceBtn.classList.contains('active')) {
            toast.info('Assistente de voz ativado. Diga seu comando.', 3000);
            // Aqui viria integração com Web Speech API
        } else {
            toast.info('Assistente de voz desativado', 2000);
        }
    }

    /**
     * Alterna assistente de chat
     */
    toggleChatAssistant() {
        this.elements.aiChat.classList.toggle('active');
        
        if (this.elements.aiChat.classList.contains('active')) {
            const input = this.elements.aiChat.querySelector('input');
            if (input) input.focus();
        }
    }

    /**
     * Carrega estado da aplicação
     */
    loadState() {
        const savedState = storage.load('app_state');
        
        if (savedState) {
            this.state = {
                ...this.state,
                ...savedState
            };
        }
    }

    /**
     * Salva estado da aplicação
     */
    saveState() {
        storage.save('app_state', {
            currentSection: this.state.currentSection,
            sidebarCollapsed: this.state.sidebarCollapsed,
            isDarkTheme: this.state.isDarkTheme
        });
    }

    /**
     * Inicializa dados de demonstração
     */
    initMockData() {
        // Carrega dados existentes ou cria novos
        const leads = storage.load('leads', []);
        const clients = storage.load('clients', []);
        const properties = storage.load('properties', []);
        const negotiations = storage.load('negotiations', []);
        
        // Se não há dados, cria demonstração
        if (leads.length === 0) this.createMockLeads();
        if (clients.length === 0) this.createMockClients();
        if (properties.length === 0) this.createMockProperties();
        if (negotiations.length === 0) this.createMockNegotiations();
        
        // Atualiza estado
        this.state.data = {
            leads: storage.load('leads', []),
            clients: storage.load('clients', []),
            properties: storage.load('properties', []),
            negotiations: storage.load('negotiations', [])
        };
    }

    /**
     * Cria leads de demonstração
     * @private
     */
    createMockLeads() {
        const leads = [
            {
                id: generateId('lead'),
                name: 'Maria Oliveira',
                email: 'maria.oliveira@email.com',
                phone: '11987654321',
                source: 'Site',
                status: 'Novo',
                score: 85,
                createdAt: new Date(Date.now() - 5 * 60000).toISOString()
            },
            {
                id: generateId('lead'),
                name: 'João Silva',
                email: 'joao.silva@email.com',
                phone: '11912345678',
                source: 'Facebook',
                status: 'Qualificado',
                score: 92,
                createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
            },
            {
                id: generateId('lead'),
                name: 'Ana Pereira',
                email: 'ana.pereira@email.com',
                phone: '11955443322',
                source: 'Indicação',
                status: 'Em contato',
                score: 78,
                createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
            }
        ];
        
        storage.save('leads', leads);
    }

    /**
     * Cria clientes de demonstração
     * @private
     */
    createMockClients() {
        const clients = [
            {
                id: generateId('client'),
                name: 'Carlos Eduardo Souza',
                cpf: '12345678900',
                email: 'carlos.souza@email.com',
                phone: '11987651234',
                address: 'Rua das Flores, 123 - São Paulo/SP',
                type: 'Comprador',
                status: 'Ativo',
                createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
            },
            {
                id: generateId('client'),
                name: 'Patricia Almeida',
                cpf: '98765432100',
                email: 'patricia.almeida@email.com',
                phone: '11976543210',
                address: 'Av. Paulista, 1000 - São Paulo/SP',
                type: 'Vendedor',
                status: 'Ativo',
                createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
            }
        ];
        
        storage.save('clients', clients);
    }

    /**
     * Cria imóveis de demonstração
     * @private
     */
    createMockProperties() {
        const properties = [
            {
                id: generateId('property'),
                code: generatePropertyCode('AP'),
                title: 'Apartamento em Botafogo',
                type: 'Apartamento',
                bedrooms: 3,
                bathrooms: 2,
                area: 120,
                price: 850000,
                address: 'Rua Voluntários da Pátria, 123 - Botafogo, Rio de Janeiro/RJ',
                status: 'Disponível',
                createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
            },
            {
                id: generateId('property'),
                code: generatePropertyCode('CA'),
                title: 'Casa em Alphaville',
                type: 'Casa',
                bedrooms: 4,
                bathrooms: 3,
                area: 250,
                price: 1500000,
                address: 'Alameda dos Araçás, 456 - Alphaville, Barueri/SP',
                status: 'Disponível',
                createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
            }
        ];
        
        storage.save('properties', properties);
    }

    /**
     * Cria negociações de demonstração
     * @private
     */
    createMockNegotiations() {
        const clients = storage.load('clients', []);
        const properties = storage.load('properties', []);
        
        if (clients.length === 0 || properties.length === 0) return;
        
        const negotiations = [
            {
                id: generateId('negotiation'),
                clientId: clients[0].id,
                propertyId: properties[0].id,
                status: 'Em andamento',
                value: 820000,
                notes: 'Cliente interessado, solicitou visita',
                stage: 'Visita',
                createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
            },
            {
                id: generateId('negotiation'),
                clientId: clients[1].id,
                propertyId: properties[1].id,
                status: 'Proposta',
                value: 1450000,
                notes: 'Proposta feita, aguardando resposta do vendedor',
                stage: 'Proposta',
                createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
            }
        ];
        
        storage.save('negotiations', negotiations); // corrigido de 'negociations'
    }
}

// ========== CLIENTES FORM =============
function validarCPF(cpf) {
  cpf = cpf.replace(/[\D]/g, '');
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function maskCPF(v) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

function maskPhone(v) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
}

function maskCEP(v) {
  v = v.replace(/\D/g, "");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
}

function maskMoney(v) {
  v = v.replace(/\D/g, "");
  v = (v/100).toFixed(2) + '';
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return 'R$ ' + v;
}

function updateProgress() {
  const sections = document.querySelectorAll('#clientForm .form-section');
  let completed = 0;
  sections.forEach(s => {
    const inputs = s.querySelectorAll('input,select');
    let valid = true;
    inputs.forEach(inp => { if (inp.required && !inp.value) valid = false; });
    if (valid) completed++;
  });
  const progress = (completed / sections.length) * 100;
  document.getElementById('progressBar').style.width = `${progress}%`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('clientForm');
  if (!form) return;

  // Máscaras
  form.cpf.addEventListener('input', e => {
    e.target.value = maskCPF(e.target.value);
  });
  form.telefone.addEventListener('input', e => {
    e.target.value = maskPhone(e.target.value);
  });
  form.cep.addEventListener('input', e => {
    e.target.value = maskCEP(e.target.value);
  });
  form['renda-principal'].addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    e.target.value = maskMoney(v);
  });

  // Validação CPF
  form.cpf.addEventListener('blur', e => {
    if (!validarCPF(e.target.value)) {
      e.target.setCustomValidity('CPF inválido');
      e.target.reportValidity();
    } else {
      e.target.setCustomValidity('');
    }
  });

  // Validação nome completo
  form.nomeCompleto.addEventListener('blur', e => {
    const val = e.target.value.trim().split(' ');
    if (val.length < 2) {
      e.target.setCustomValidity('Digite o nome completo (mínimo 2 palavras)');
      e.target.reportValidity();
    } else {
      e.target.setCustomValidity('');
    }
  });

  // Validação CEP + ViaCEP
  form.cep.addEventListener('blur', async e => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        form.logradouro.value = data.logradouro || '';
        form.bairro.value = data.bairro || '';
        form.cidade.value = data.localidade || '';
        form.uf.value = data.uf || '';
      }
    }
  });

  // Estado civil -> cônjuge
  form.estadoCivil.addEventListener('change', e => {
    const conjuge = document.getElementById('conjugeFields');
    if (e.target.value === 'casado') {
      conjuge.style.display = '';
    } else {
      conjuge.style.display = 'none';
    }
  });

  // Colapsos
  document.querySelectorAll('.form-section.collapsible h2').forEach(h2 => {
    h2.addEventListener('click', e => {
      const section = h2.parentElement;
      section.classList.toggle('collapsed');
    });
  });

  // Progresso
  form.addEventListener('input', updateProgress);
  form.addEventListener('change', updateProgress);
  updateProgress();

  // Auto-save
  setInterval(() => {
    const formData = new FormData(form);
    localStorage.setItem('clientDraft', JSON.stringify(Object.fromEntries(formData)));
  }, 30000);

  // Tooltips
  document.querySelectorAll('.tooltip-icon').forEach(icon => {
    icon.addEventListener('mouseenter', e => {
      const tip = document.createElement('div');
      tip.className = 'tooltip-popup';
      tip.textContent = icon.title;
      document.body.appendChild(tip);
      const rect = icon.getBoundingClientRect();
      tip.style.left = rect.left + 'px';
      tip.style.top = (rect.bottom + 5) + 'px';
      icon._tip = tip;
    });
    icon.addEventListener('mouseleave', e => {
      if (icon._tip) document.body.removeChild(icon._tip);
      icon._tip = null;
    });
  });
});

// ===== INICIALIZAÇÃO =====

// Aguarda carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa aplicação
    window.app = new App();
});

// Importando e inicializando os componentes Sidebar e Header
import { initSidebar } from '../components/sidebar.js';
import { initHeader } from '../components/header.js';
import { initModal } from '../components/modal.js';
import { initFooter } from '../components/footer.js';
import { loadAllComponents } from './load-components.js';

// Aguarda carregar componentes antes de inicializar app e componentes
window.addEventListener('DOMContentLoaded', async () => {
  await loadAllComponents();
  // Inicializa aplicação e componentes após injeção do HTML
  window.app = new App();
  if (typeof initSidebar === 'function') initSidebar();
  if (typeof initHeader === 'function') initHeader();
  if (typeof initModal === 'function') initModal();
  if (typeof initFooter === 'function') initFooter();
});

// Service Worker para PWA (Progressive Web App)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      reg => console.log('Service Worker registrado:', reg.scope),
      err => console.warn('Service Worker falhou:', err)
    );
  });
}

// Alternância de tema com persistência
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('theme-dark');
  document.body.classList.toggle('theme-light');
  localStorage.setItem('theme', document.body.classList.contains('theme-dark') ? 'dark' : 'light');
});
// Carregar tema salvo
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${savedTheme}`);
  }
});

// Detectar e aplicar dark mode automático baseado no SO do usuário
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.add('theme-light');
    }
  }
});

// Sidebar responsiva para mobile
window.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    // Fechar sidebar ao clicar fora em mobile
    window.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && e.target !== toggleSidebarBtn) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
});

// Fechar modais e overlays com ESC
const modal = document.getElementById('confirmation-modal');
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modal?.classList.remove('open');
    sidebar?.classList.remove('open');
  }
});

// Foco visível customizado para elementos interativos
const style = document.createElement('style');
style.innerHTML = `
  .focus-visible {
    outline: 2px solid #005fcc !important;
    outline-offset: 2px;
  }
`;
document.head.appendChild(style);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});
document.addEventListener('focusin', (e) => {
  if (document.body.classList.contains('user-is-tabbing')) {
    e.target.classList.add('focus-visible');
  }
});
document.addEventListener('focusout', (e) => {
  e.target.classList.remove('focus-visible');
});

// Lazy loading para imagens (exemplo para imagens futuras)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (!img.hasAttribute('src')) {
      img.src = img.dataset.src;
    }
  });
});

// Exemplo de uso da sanitização em campos de busca
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    e.target.value = sanitizeInput(e.target.value);
  });
}

// Exemplo de uso da validação em um campo de busca
if (searchInput) {
  searchInput.addEventListener('blur', (e) => {
    if (!validateRequired(e.target.value)) {
      showToast('O campo de busca não pode ficar vazio.', 'warning');
    }
  });
}

// Exemplo de uso de aria-live para feedback dinâmico
const toastContainer = document.getElementById('toast-container');
if (toastContainer) {
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('role', 'status');
}

// Exemplo de autocomplete simples para busca global
const suggestions = ['Leads', 'Clientes', 'Imóveis', 'Negociações', 'Financeiro', 'Relatórios', 'Configurações'];
if (searchInput) {
  const datalist = document.createElement('datalist');
  datalist.id = 'search-suggestions';
  suggestions.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    datalist.appendChild(option);
  });
  document.body.appendChild(datalist);
  searchInput.setAttribute('list', 'search-suggestions');
}