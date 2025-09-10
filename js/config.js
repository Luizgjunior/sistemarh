// Configuração da API
const API_CONFIG = {
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : `${window.location.protocol}//${window.location.host}/api`,
    FRONTEND_URL: window.location.origin,
    ENDPOINTS: {
        // Auth
        HEALTH: '/health',
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ME: '/auth/me',
        
        // Users
        USERS: '/users',
        USER_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        
        // Jobs
        JOBS: '/jobs',
        JOB_BY_ID: '/jobs',
        
        // Applications
        APPLICATIONS: '/applications',
        MY_APPLICATIONS: '/applications/my',
        JOB_APPLICATIONS: '/applications/job'
    }
};

// Classe para gerenciar chamadas à API
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.token = this.getToken();
    }

    // Gerenciamento de token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('rhpro_token', token);
        } else {
            localStorage.removeItem('rhpro_token');
        }
    }

    getToken() {
        return localStorage.getItem('rhpro_token');
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('rhpro_token');
        localStorage.removeItem('rhpro_user');
    }

    // Gerenciamento de usuário
    setUser(user) {
        localStorage.setItem('rhpro_user', JSON.stringify(user));
    }

    getUser() {
        const user = localStorage.getItem('rhpro_user');
        return user ? JSON.parse(user) : null;
    }

    clearUser() {
        localStorage.removeItem('rhpro_user');
    }

    // Headers padrão
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Método genérico para fazer requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };

        try {
            console.log(`🔗 API Request: ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log(`✅ API Response: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`❌ API Error: ${error.message}`);
            
            // Se token expirou, limpar dados do usuário
            if (error.message.includes('Token') || error.message.includes('401')) {
                this.clearToken();
                this.clearUser();
                // Redirecionar para login se não estiver na página de login
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/login.html';
                }
            }
            
            throw error;
        }
    }

    // === MÉTODOS DE AUTENTICAÇÃO ===

    async healthCheck() {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.HEALTH, {
            method: 'GET',
            auth: false
        });
    }

    async register(userData) {
        const data = await this.makeRequest(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false
        });

        if (data.success && data.token) {
            this.setToken(data.token);
            this.setUser(data.user);
        }

        return data;
    }

    async login(credentials) {
        const data = await this.makeRequest(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
            auth: false
        });

        if (data.success && data.token) {
            this.setToken(data.token);
            this.setUser(data.user);
        }

        return data;
    }

    async getMe() {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.ME, {
            method: 'GET'
        });
    }

    logout() {
        this.clearToken();
        this.clearUser();
        window.location.href = '/login.html';
    }

    // === MÉTODOS DE USUÁRIOS ===

    async getUsers(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.USERS}?${params}`, {
            method: 'GET'
        });
    }

    async getUserProfile(userId) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/${userId}`, {
            method: 'GET'
        });
    }

    async updateUserProfile(userId, profileData) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async changePassword(passwordData) {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }

    // === MÉTODOS DE VAGAS ===

    async getJobs(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.JOBS}?${params}`, {
            method: 'GET',
            auth: false // Vagas públicas
        });
    }

    async getJobById(jobId) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.JOB_BY_ID}/${jobId}`, {
            method: 'GET',
            auth: false
        });
    }

    async createJob(jobData) {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.JOBS, {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async updateJob(jobId, jobData) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.JOB_BY_ID}/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(jobId) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.JOB_BY_ID}/${jobId}`, {
            method: 'DELETE'
        });
    }

    // === MÉTODOS DE CANDIDATURAS ===

    async applyToJob(applicationData) {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.APPLICATIONS, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async getMyApplications() {
        return await this.makeRequest(API_CONFIG.ENDPOINTS.MY_APPLICATIONS, {
            method: 'GET'
        });
    }

    async getJobApplications(jobId) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.JOB_APPLICATIONS}/${jobId}`, {
            method: 'GET'
        });
    }

    async updateApplicationStatus(applicationId, status) {
        return await this.makeRequest(`${API_CONFIG.ENDPOINTS.APPLICATIONS}/${applicationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // === MÉTODOS UTILITÁRIOS ===

    isLoggedIn() {
        return !!this.token && !!this.getUser();
    }

    getUserType() {
        const user = this.getUser();
        return user ? user.userType : null;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    requireUserType(requiredType) {
        if (!this.requireAuth()) return false;
        
        const userType = this.getUserType();
        if (userType !== requiredType) {
            alert(`Acesso negado. Esta área é exclusiva para ${requiredType}.`);
            this.redirectToDashboard();
            return false;
        }
        return true;
    }

    redirectToDashboard() {
        const userType = this.getUserType();
        switch (userType) {
            case 'admin':
                window.location.href = '/pages/dashboard-admin.html';
                break;
            case 'empresa':
                window.location.href = '/pages/dashboard-empresa.html';
                break;
            case 'candidato':
                window.location.href = '/pages/dashboard-candidato.html';
                break;
            default:
                window.location.href = '/login.html';
        }
    }
}

// Instância global da API
const api = new ApiService();

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Função para mostrar loading
function showLoading(show = true) {
    let loader = document.querySelector('.api-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'api-loader';
            loader.innerHTML = '<div class="spinner"></div><span>Carregando...</span>';
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// CSS para notificações e loader
const apiStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 10000;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    .notification-success {
        border-left: 4px solid #4CAF50;
        color: #2E7D32;
    }

    .notification-error {
        border-left: 4px solid #f44336;
        color: #C62828;
    }

    .notification-info {
        border-left: 4px solid #2196F3;
        color: #1565C0;
    }

    .notification button {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        margin-left: 12px;
        color: inherit;
        opacity: 0.7;
    }

    .notification button:hover {
        opacity: 1;
    }

    .api-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        flex-direction: column;
        color: white;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Adicionar estilos ao documento
if (!document.querySelector('#api-styles')) {
    const style = document.createElement('style');
    style.id = 'api-styles';
    style.textContent = apiStyles;
    document.head.appendChild(style);
}

console.log('🚀 ApiService carregado e pronto para uso!');
console.log('📡 Base URL:', API_CONFIG.BASE_URL);
console.log('🔑 Token salvo:', !!api.getToken());
console.log('👤 Usuário logado:', !!api.getUser());
