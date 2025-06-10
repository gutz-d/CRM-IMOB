/**
 * Funções utilitárias para o CRM Imobiliário
 * Seguindo boas práticas de JavaScript moderno (ES6+)
 */

// ===== GERENCIAMENTO DE DADOS =====

/**
 * Classe para gerenciar localStorage com validação e tipo seguro
 */
class StorageManager {
    constructor(prefix = 'crm_') {
        this.prefix = prefix;
    }

    /**
     * Salva dados no localStorage com validação
     * @param {string} key - Chave para armazenamento
     * @param {any} data - Dados para salvar
     * @returns {boolean} - Sucesso da operação
     */
    save(key, data) {
        try {
            const prefixedKey = this.prefix + key;
            const serializedData = JSON.stringify({
                data,
                timestamp: Date.now(),
                version: '1.0'
            });
            localStorage.setItem(prefixedKey, serializedData);
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    /**
     * Recupera dados do localStorage com validação
     * @param {string} key - Chave para recuperar
     * @param {any} defaultValue - Valor padrão se não encontrado
     * @returns {any} - Dados recuperados ou valor padrão
     */
    load(key, defaultValue = null) {
        try {
            const prefixedKey = this.prefix + key;
            const stored = localStorage.getItem(prefixedKey);
            
            if (!stored) return defaultValue;
            
            const parsed = JSON.parse(stored);
            
            // Validação de estrutura
            if (!parsed.data || !parsed.timestamp) {
                console.warn('Dados corrompidos encontrados para a chave:', key);
                return defaultValue;
            }
            
            return parsed.data;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave para remover
     */
    remove(key) {
        try {
            const prefixedKey = this.prefix + key;
            localStorage.removeItem(prefixedKey);
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
        }
    }

    /**
     * Limpa todos os dados do CRM
     */
    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
        }
    }
}

// ===== FORMATAÇÃO E VALIDAÇÃO =====

/**
 * Utilitários para formatação de dados
 */
const Formatters = {
    /**
     * Formata CPF com máscara
     * @param {string} cpf - CPF sem formatação
     * @returns {string} - CPF formatado
     */
    cpf(cpf) {
        if (!cpf) return '';
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    /**
     * Formata telefone com máscara
     * @param {string} phone - Telefone sem formatação
     * @returns {string} - Telefone formatado
     */
    phone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        return phone;
    },

    /**
     * Formata CEP com máscara
     * @param {string} cep - CEP sem formatação
     * @returns {string} - CEP formatado
     */
    cep(cep) {
        if (!cep) return '';
        const cleaned = cep.replace(/\D/g, '');
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    },

    /**
     * Formata valor monetário
     * @param {number} value - Valor numérico
     * @returns {string} - Valor formatado em BRL
     */
    currency(value) {
        if (value === null || value === undefined) return 'R$ 0,00';
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Formata data para exibição
     * @param {Date|string} date - Data para formatar
     * @returns {string} - Data formatada
     */
    date(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) return '';
        
        return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    },

    /**
     * Formata data e hora para exibição
     * @param {Date|string} date - Data para formatar
     * @returns {string} - Data e hora formatadas
     */
    datetime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) return '';
        
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    },

    /**
     * Formata tempo relativo (ex: "há 5 minutos")
     * @param {Date|string} date - Data para comparar
     * @returns {string} - Tempo relativo formatado
     */
    timeAgo(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        
        return this.date(dateObj);
    }
};

/**
 * Utilitários para validação
 */
const Validators = {
    /**
     * Valida CPF
     * @param {string} cpf - CPF para validar
     * @returns {boolean} - CPF válido
     */
    cpf(cpf) {
        if (!cpf) return false;
        
        const cleaned = cpf.replace(/\D/g, '');
        
        if (cleaned.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleaned)) return false;
        
        // Validação dos dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned.charAt(i)) * (10 - i);
        }
        
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cleaned.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned.charAt(i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        
        return remainder === parseInt(cleaned.charAt(10));
    },

    /**
     * Valida email
     * @param {string} email - Email para validar
     * @returns {boolean} - Email válido
     */
    email(email) {
        if (!email) return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Valida telefone brasileiro
     * @param {string} phone - Telefone para validar
     * @returns {boolean} - Telefone válido
     */
    phone(phone) {
        if (!phone) return false;
        
        const cleaned = phone.replace(/\D/g, '');
        
        // Aceita 10 dígitos (fixo) ou 11 dígitos (celular)
        return cleaned.length === 10 || cleaned.length === 11;
    },

    /**
     * Valida CEP
     * @param {string} cep - CEP para validar
     * @returns {boolean} - CEP válido
     */
    cep(cep) {
        if (!cep) return false;
        
        const cleaned = cep.replace(/\D/g, '');
        return cleaned.length === 8;
    },

    /**
     * Valida se campo é obrigatório
     * @param {any} value - Valor para validar
     * @returns {boolean} - Campo preenchido
     */
    required(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }
};

// ===== UTILITÁRIOS DOM =====

/**
 * Utilitários para manipulação do DOM
 */
const DOMUtils = {
    /**
     * Cria elemento com atributos e conteúdo
     * @param {string} tag - Tag do elemento
     * @param {Object} attributes - Atributos do elemento
     * @param {string|Node} content - Conteúdo do elemento
     * @returns {HTMLElement} - Elemento criado
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else {
                element.appendChild(content);
            }
        }
        
        return element;
    },

    /**
     * Remove todos os filhos de um elemento
     * @param {HTMLElement} element - Elemento para limpar
     */
    clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Adiciona classe com animação suave
     * @param {HTMLElement} element - Elemento
     * @param {string} className - Classe a adicionar
     */
    addClassWithAnimation(element, className) {
        element.classList.add(className);
        element.offsetHeight; // Force reflow
    },

    /**
     * Remove classe com animação suave
     * @param {HTMLElement} element - Elemento
     * @param {string} className - Classe a remover
     */
    removeClassWithAnimation(element, className) {
        element.classList.remove(className);
    }
};

// ===== DEBOUNCE E THROTTLE =====

/**
 * Debounce - Executa função apenas após período de inatividade
 * @param {Function} func - Função para executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - Limita execuções por período de tempo
 * @param {Function} func - Função para executar
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} - Função com throttle aplicado
 */
function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== GERAÇÃO DE IDs =====

/**
 * Gera ID único
 * @param {string} prefix - Prefixo do ID
 * @returns {string} - ID único gerado
 */
function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gera código de referência para imóveis
 * @param {string} type - Tipo do imóvel (AP, CA, TE, etc.)
 * @returns {string} - Código de referência
 */
function generatePropertyCode(type = 'IM') {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `${type}-${timestamp}${random}`;
}

// ===== EXPORTAÇÃO =====
// Disponibiliza utilitários globalmente
window.StorageManager = StorageManager;
window.Formatters = Formatters;
window.Validators = Validators;
window.DOMUtils = DOMUtils;
window.debounce = debounce;
window.throttle = throttle;
window.generateId = generateId;
window.generatePropertyCode = generatePropertyCode;

// Instância global do gerenciador de storage
window.storage = new StorageManager('crm_imobi_');

console.log('✅ Utils carregados com sucesso');