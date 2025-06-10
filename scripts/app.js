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
        
        storage.save('negotiations', negotiations);
    }
}

// ===== INICIALIZAÇÃO =====

// Aguarda carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa aplicação
    window.app = new App();
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Desativado por enquanto, será implementado na próxima fase
        /*
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.error('Erro ao registrar Service Worker:', err));
        */
    });
}