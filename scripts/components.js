/**
 * Componentes JavaScript para o CRM Imobiliário
 * Classes e componentes reutilizáveis
 */

// ===== SISTEMA DE NOTIFICAÇÕES =====

/**
 * Classe para gerenciar notificações toast
 */
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toasts = new Map();
        this.defaultDuration = 5000;
    }

    /**
     * Exibe uma notificação toast
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo (success, error, warning, info)
     * @param {number} duration - Duração em ms
     * @returns {string} - ID da notificação
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        const id = generateId('toast');
        
        const toast = this.createToastElement(id, message, type);
        this.container.appendChild(toast);
        
        // Animação de entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto-remove após duração especificada
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        this.toasts.set(id, { element: toast, type, message });
        
        return id;
    }

    /**
     * Remove uma notificação específica
     * @param {string} id - ID da notificação
     */
    remove(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;
        
        toast.element.classList.add('removing');
        
        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts.delete(id);
        }, 300);
    }

    /**
     * Cria elemento toast
     * @private
     */
    createToastElement(id, message, type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        const toast = DOMUtils.create('div', {
            className: `toast ${type}`,
            dataset: { id }
        });
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar notificação">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Event listener para fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(id);
        });
        
        return toast;
    }

    /**
     * Métodos de conveniência
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// ===== MODAL MANAGER =====

/**
 * Classe para gerenciar modais
 */
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupEventListeners();
    }

    /**
     * Abre um modal
     * @param {string} modalId - ID do modal
     * @param {Object} options - Opções do modal
     */
    open(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal com ID ${modalId} não encontrado`);
            return;
        }
        
        // Atualiza conteúdo se fornecido
        if (options.title) {
            const titleElement = modal.querySelector('.modal-header h2');
            if (titleElement) titleElement.textContent = options.title;
        }
        
        if (options.content) {
            const contentElement = modal.querySelector('.modal-body');
            if (contentElement) {
                if (typeof options.content === 'string') {
                    contentElement.innerHTML = options.content;
                } else {
                    DOMUtils.clearChildren(contentElement);
                    contentElement.appendChild(options.content);
                }
            }
        }
        
        // Exibe modal
        modal.classList.add('active');
        this.activeModals.add(modalId);
        
        // Foco no primeiro elemento focável
        const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
        
        // Bloqueia scroll do body
        document.body.style.overflow = 'hidden';
    }

    /**
     * Fecha um modal
     * @param {string} modalId - ID do modal
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
        this.activeModals.delete(modalId);
        
        // Restaura scroll se não há mais modais ativos
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }
    }

    /**
     * Configura event listeners globais
     * @private
     */
    setupEventListeners() {
        // Fechar modal ao clicar no backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                const modalId = e.target.id;
                if (modalId) this.close(modalId);
            }
        });
        
        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const lastModal = Array.from(this.activeModals).pop();
                this.close(lastModal);
            }
        });
        
        // Event listeners para botões de fechar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                const modal = e.target.closest('.modal');
                if (modal) this.close(modal.id);
            }
        });
    }

    /**
     * Modal de confirmação
     * @param {string} message - Mensagem de confirmação
     * @param {Object} options - Opções
     * @returns {Promise<boolean>} - Resultado da confirmação
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modalId = 'confirmation-modal';
            const modal = document.getElementById(modalId);
            
            if (!modal) {
                console.error('Modal de confirmação não encontrado');
                resolve(false);
                return;
            }
            
            // Atualiza conteúdo
            const messageElement = modal.querySelector('.modal-body p');
            if (messageElement) messageElement.textContent = message;
            
            // Configura botões
            const confirmBtn = modal.querySelector('.confirm-btn');
            const cancelBtn = modal.querySelector('.cancel-btn');
            
            const handleConfirm = () => {
                this.close(modalId);
                cleanup();
                resolve(true);
            };
            
            const handleCancel = () => {
                this.close(modalId);
                cleanup();
                resolve(false);
            };
            
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            this.open(modalId, {
                title: options.title || 'Confirmar ação'
            });
        });
    }
}

// ===== LOADING MANAGER =====

/**
 * Classe para gerenciar estados de loading
 */
class LoadingManager {
    constructor() {
        this.overlay = document.getElementById('loading-overlay');
        this.activeLoaders = new Set();
    }

    /**
     * Exibe loading global
     * @param {string} message - Mensagem de loading
     * @param {string} id - ID único para o loader
     */
    show(message = 'Carregando...', id = 'default') {
        this.activeLoaders.add(id);
        
        if (this.overlay) {
            const messageElement = this.overlay.querySelector('p');
            if (messageElement) messageElement.textContent = message;
            
            this.overlay.classList.add('active');
        }
    }

    /**
     * Oculta loading global
     * @param {string} id - ID do loader
     */
    hide(id = 'default') {
        this.activeLoaders.delete(id);
        
        // Só oculta se não há mais loaders ativos
        if (this.activeLoaders.size === 0 && this.overlay) {
            this.overlay.classList.remove('active');
        }
    }

    /**
     * Executa função com loading automático
     * @param {Function} fn - Função para executar
     * @param {string} message - Mensagem de loading
     * @returns {Promise} - Resultado da função
     */
    async withLoading(fn, message = 'Processando...') {
        const id = generateId('loader');
        
        try {
            this.show(message, id);
            const result = await fn();
            return result;
        } catch (error) {
            console.error('Erro durante operação com loading:', error);
            throw error;
        } finally {
            this.hide(id);
        }
    }
}

// ===== FORM VALIDATOR =====

/**
 * Classe para validação de formulários
 */
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.rules = new Map();
        this.errors = new Map();
        this.setupEventListeners();
    }

    /**
     * Adiciona regra de validação para um campo
     * @param {string} fieldName - Nome do campo
     * @param {Array} rules - Array de regras
     */
    addRule(fieldName, rules) {
        this.rules.set(fieldName, rules);
    }

    /**
     * Valida um campo específico
     * @param {string} fieldName - Nome do campo
     * @returns {boolean} - Campo válido
     */
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const rules = this.rules.get(fieldName) || [];
        const value = field.value;
        const fieldErrors = [];
        
        for (const rule of rules) {
            if (rule.type === 'required' && !Validators.required(value)) {
                fieldErrors.push(rule.message || 'Campo obrigatório');
            } else if (rule.type === 'cpf' && value && !Validators.cpf(value)) {
                fieldErrors.push(rule.message || 'CPF inválido');
            } else if (rule.type === 'email' && value && !Validators.email(value)) {
                fieldErrors.push(rule.message || 'Email inválido');
            } else if (rule.type === 'phone' && value && !Validators.phone(value)) {
                fieldErrors.push(rule.message || 'Telefone inválido');
            } else if (rule.type === 'cep' && value && !Validators.cep(value)) {
                fieldErrors.push(rule.message || 'CEP inválido');
            } else if (rule.type === 'custom' && rule.validator && !rule.validator(value)) {
                fieldErrors.push(rule.message || 'Valor inválido');
            }
        }
        
        this.updateFieldError(field, fieldErrors);
        
        if (fieldErrors.length > 0) {
            this.errors.set(fieldName, fieldErrors);
            return false;
        } else {
            this.errors.delete(fieldName);
            return true;
        }
    }

    /**
     * Valida todo o formulário
     * @returns {boolean} - Formulário válido
     */
    validate() {
        let isValid = true;
        
        this.rules.forEach((rules, fieldName) => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Atualiza exibição de erro do campo
     * @private
     */
    updateFieldError(field, errors) {
        // Remove erro anterior
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        field.classList.remove('error', 'success');
        
        if (errors.length > 0) {
            field.classList.add('error');
            
            const errorElement = DOMUtils.create('div', {
                className: 'field-error'
            }, errors[0]);
            
            field.parentNode.appendChild(errorElement);
        } else if (field.value) {
            field.classList.add('success');
        }
    }

    /**
     * Configura event listeners
     * @private
     */
    setupEventListeners() {
        // Validação em tempo real
        this.form.addEventListener('input', debounce((e) => {
            const fieldName = e.target.name;
            if (fieldName && this.rules.has(fieldName)) {
                this.validateField(fieldName);
            }
        }, 300));
        
        // Validação no blur
        this.form.addEventListener('blur', (e) => {
            const fieldName = e.target.name;
            if (fieldName && this.rules.has(fieldName)) {
                this.validateField(fieldName);
            }
        }, true);
    }

    /**
     * Obtém todos os erros atuais
     * @returns {Object} - Objeto com erros por campo
     */
    getErrors() {
        return Object.fromEntries(this.errors);
    }

    /**
     * Limpa todos os erros
     */
    clearErrors() {
        this.errors.clear();
        
        this.form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
        
        this.form.querySelectorAll('.error, .success').forEach(field => {
            field.classList.remove('error', 'success');
        });
    }
}

// ===== INPUT MASK =====

/**
 * Classe para aplicar máscaras em inputs
 */
class InputMask {
    constructor() {
        this.masks = {
            cpf: '000.000.000-00',
            phone: ['(00) 0000-0000', '(00) 00000-0000'],
            cep: '00000-000',
            currency: 'R$ 0,00'
        };
    }

    /**
     * Aplica máscara a um input
     * @param {HTMLElement} input - Input element
     * @param {string} maskType - Tipo da máscara
     */
    apply(input, maskType) {
        if (!this.masks[maskType]) {
            console.warn(`Máscara ${maskType} não encontrada`);
            return;
        }
        
        const applyMask = () => {
            switch (maskType) {
                case 'cpf':
                    input.value = this.applyCPFMask(input.value);
                    break;
                case 'phone':
                    input.value = this.applyPhoneMask(input.value);
                    break;
                case 'cep':
                    input.value = this.applyCEPMask(input.value);
                    break;
                case 'currency':
                    input.value = this.applyCurrencyMask(input.value);
                    break;
            }
        };
        
        input.addEventListener('input', applyMask);
        input.addEventListener('paste', (e) => {
            setTimeout(applyMask, 0);
        });
        
        // Aplica máscara no valor inicial
        if (input.value) {
            applyMask();
        }
    }

    /**
     * Aplica máscara de CPF
     * @private
     */
    applyCPFMask(value) {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.substring(0, 11);
        
        return limited
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    /**
     * Aplica máscara de telefone
     * @private
     */
    applyPhoneMask(value) {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.substring(0, 11);
        
        if (limited.length <= 10) {
            return limited
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            return limited
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
    }

    /**
     * Aplica máscara de CEP
     * @private
     */
    applyCEPMask(value) {
        const cleaned = value.replace(/\D/g, '');
        const limited = cleaned.substring(0, 8);
        
        return limited.replace(/(\d{5})(\d)/, '$1-$2');
    }

    /**
     * Aplica máscara de moeda
     * @private
     */
    applyCurrencyMask(value) {
        let cleaned = value.replace(/\D/g, '');
        
        if (cleaned === '') return '';
        
        const number = parseInt(cleaned) / 100;
        
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(number);
    }
}

// ===== EXPORTAÇÃO =====
// Disponibiliza componentes globalmente
window.ToastManager = ToastManager;
window.ModalManager = ModalManager;
window.LoadingManager = LoadingManager;
window.FormValidator = FormValidator;
window.InputMask = InputMask;

// Instâncias globais
window.toast = new ToastManager();
window.modal = new ModalManager();
window.loading = new LoadingManager();
window.inputMask = new InputMask();

console.log('✅ Componentes carregados com sucesso');