// Sistema de Autenticação integrado com APIs
let currentUser = null;

// Verificar se usuário está logado
function checkAuth() {
    return api.isLoggedIn();
}

// Obter usuário atual
function getCurrentUser() {
    return api.getUser();
}

// Verificar se API está funcionando
async function checkApiHealth() {
    try {
        await api.healthCheck();
        console.log('✅ API está funcionando');
        return true;
    } catch (error) {
        console.error('❌ API não está funcionando:', error);
        showNotification('Erro de conexão com o servidor. Tente novamente mais tarde.', 'error');
        return false;
    }
}

// Fazer login
async function performLogin(email, password, userType) {
    try {
        showLoading(true);
        
        // Validações básicas
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        // Fazer login via API
        const response = await api.login({
            email: email.trim(),
            password: password,
            userType: userType
        });

        currentUser = response.user;
        showNotification(`Bem-vindo(a), ${currentUser.name}!`, 'success');
        
        return response;
        
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification(error.message || 'Erro ao fazer login', 'error');
        throw error;
    } finally {
        showLoading(false);
    }
}

// Fazer logout
function logout() {
    api.logout();
}

// Registrar usuário
async function performRegister(userData) {
    try {
        showLoading(true);
        
        // Validações
        if (!userData.name || !userData.email || !userData.password) {
            throw new Error('Todos os campos são obrigatórios');
        }

        if (userData.password.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        if (userData.password !== userData.confirmPassword) {
            throw new Error('As senhas não coincidem');
        }

        // Registrar via API
        const response = await api.register({
            name: userData.name.trim(),
            email: userData.email.trim(),
            password: userData.password,
            userType: userData.userType,
            companyInfo: userData.companyInfo,
            candidateInfo: userData.candidateInfo
        });

        currentUser = response.user;
        showNotification(`Conta criada com sucesso! Bem-vindo(a), ${currentUser.name}!`, 'success');
        
        return response;
        
    } catch (error) {
        console.error('Erro no registro:', error);
        showNotification(error.message || 'Erro ao criar conta', 'error');
        throw error;
    } finally {
        showLoading(false);
    }
}

// Verificar se usuário tem permissão
function hasPermission(requiredType) {
    const user = getCurrentUser();
    if (!user) return false;
    return user.userType === requiredType;
}

// Redirecionar para dashboard apropriado
function redirectToDashboard(userType = null) {
    if (userType) {
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
    } else {
        api.redirectToDashboard();
    }
}

// Verificar dados do usuário atual via API
async function refreshUserData() {
    try {
        if (!api.isLoggedIn()) return null;
        
        const response = await api.getMe();
        if (response.success && response.user) {
            api.setUser(response.user);
            currentUser = response.user;
            return response.user;
        }
    } catch (error) {
        console.error('Erro ao atualizar dados do usuário:', error);
        // Se der erro, limpar dados e redirecionar para login
        api.clearToken();
        api.clearUser();
        if (!window.location.pathname.includes('login')) {
            window.location.href = '/login.html';
        }
    }
    return null;
}

// Enhanced form validation for auth forms
function validateAuthForm(form) {
    let isValid = true;
    
    // Clear previous errors
    clearAllFieldErrors(form);
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate name (for registration)
    if (form.id === 'registerForm' && data.name) {
        if (data.name.length < 2) {
            showFieldError(form.querySelector('input[name="name"]'), 'Nome deve ter pelo menos 2 caracteres');
            isValid = false;
        }
    }
    
    // Validate email
    if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFieldError(form.querySelector('input[name="email"]'), 'Digite um e-mail válido');
            isValid = false;
        }
    }
    
    // Validate password
    if (data.password) {
        if (data.password.length < 6) {
            showFieldError(form.querySelector('input[name="password"]'), 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
    }
    
    // Validate password confirmation
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        showFieldError(form.querySelector('input[name="confirmPassword"]'), 'As senhas não coincidem');
        isValid = false;
    }
    
    // Validate user type
    if (data.userType && !data.userType) {
        showFieldError(form.querySelector('select[name="userType"]'), 'Selecione o tipo de usuário');
        isValid = false;
    }
    
    // Validate terms acceptance (for registration)
    if (form.id === 'registerForm' && !data.terms) {
        showFieldError(form.querySelector('input[name="terms"]'), 'Você deve aceitar os termos de uso');
        isValid = false;
    }
    
    return isValid;
}

// Clear all field errors in a form
function clearAllFieldErrors(form) {
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const errorInputs = form.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

// Enhanced login handler
async function handleLogin(e) {
    e.preventDefault();
    
    if (!validateAuthForm(e.target)) {
        return;
    }
    
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        userType: formData.get('userType'),
        remember: formData.get('remember') === 'on'
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="loading"></i> Entrando...';
    submitBtn.disabled = true;
    
    try {
        await performLogin(loginData.email, loginData.password, loginData.userType);
        
        // Redirect based on user type
        setTimeout(() => {
            redirectToDashboard(loginData.userType);
        }, 1000);
        
    } catch (error) {
        // Error is already handled in performLogin
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Enhanced register handler
async function handleRegister(e) {
    e.preventDefault();
    
    if (!validateAuthForm(e.target)) {
        return;
    }
    
    const formData = new FormData(e.target);
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        userType: formData.get('userType')
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="loading"></i> Criando conta...';
    submitBtn.disabled = true;
    
    try {
        await performRegister(registerData);
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(registerData.userType);
        }, 1500);
        
    } catch (error) {
        // Error is already handled in performRegister
    } finally {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Check if user is already logged in
async function checkAuthStatus() {
    if (api.isLoggedIn()) {
        try {
            // Verify token is still valid
            currentUser = await refreshUserData();
            if (currentUser) {
                // Auto-redirect to dashboard if on login page
                if (window.location.pathname.includes('login') || window.location.pathname === '/') {
                    redirectToDashboard(currentUser.userType);
                }
            }
        } catch (error) {
            // Token is invalid, will be cleared in refreshUserData
        }
    }
}

// Password strength indicator
function initPasswordStrength() {
    const passwordInputs = document.querySelectorAll('input[name="password"]');
    
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const strength = calculatePasswordStrength(this.value);
            updatePasswordStrengthIndicator(this, strength);
        });
    });
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 5);
}

// Update password strength indicator
function updatePasswordStrengthIndicator(input, strength) {
    let indicator = input.parentElement.querySelector('.password-strength');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.style.marginTop = '0.25rem';
        input.parentElement.appendChild(indicator);
    }
    
    const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Muito boa'];
    const strengthColors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
    
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background-color: ${strengthColors[strength - 1] || '#e5e7eb'};"></div>
        </div>
        <span class="strength-text" style="color: ${strengthColors[strength - 1] || '#6b7280'};">
            ${strengthLabels[strength - 1] || 'Digite uma senha'}
        </span>
    `;
}

// Atualizar interface para usuário logado
function updateUIForLoggedUser() {
    if (!currentUser) currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // Atualizar elementos da interface que mostram dados do usuário
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userTypeElements = document.querySelectorAll('.user-type');
    
    userNameElements.forEach(el => el.textContent = currentUser.name || '');
    userEmailElements.forEach(el => el.textContent = currentUser.email || '');
    userTypeElements.forEach(el => {
        const type = currentUser.userType;
        switch(type) {
            case 'admin':
                el.textContent = 'Administrador';
                break;
            case 'empresa':
                el.textContent = 'Empresa';
                break;
            case 'candidato':
                el.textContent = 'Candidato';
                break;
            default:
                el.textContent = '';
        }
    });

    // Mostrar/ocultar elementos baseado no tipo de usuário
    const adminElements = document.querySelectorAll('.admin-only');
    const empresaElements = document.querySelectorAll('.empresa-only');
    const candidatoElements = document.querySelectorAll('.candidato-only');
    
    adminElements.forEach(el => {
        el.style.display = hasPermission('admin') ? 'block' : 'none';
    });
    
    empresaElements.forEach(el => {
        el.style.display = hasPermission('empresa') ? 'block' : 'none';
    });
    
    candidatoElements.forEach(el => {
        el.style.display = hasPermission('candidato') ? 'block' : 'none';
    });
}

// Check URL parameters for user type pre-selection
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se API está funcionando
    const apiWorking = await checkApiHealth();
    
    if (apiWorking) {
        // Check auth status
        await checkAuthStatus();
    }
    
    // Update UI if logged in
    updateUIForLoggedUser();
    
    // URL parameter handling
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');
    
    if (userType) {
        // Pre-select user type in forms
        const userTypeSelects = document.querySelectorAll('select[name="userType"]');
        userTypeSelects.forEach(select => {
            select.value = userType;
        });
        
        // Switch to appropriate tab
        if (userType === 'empresa' || userType === 'candidato') {
            switchTab('register');
        }
    }
    
    // Initialize password strength indicators
    initPasswordStrength();
    
    // Add real-time validation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                validateInput(this);
            }
        });
    });
});

// Add CSS for password strength indicator
const style = document.createElement('style');
style.textContent = `
    .password-strength {
        margin-top: 0.25rem;
    }
    
    .strength-bar {
        width: 100%;
        height: 4px;
        background-color: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 0.25rem;
    }
    
    .strength-fill {
        height: 100%;
        transition: width 0.3s ease, background-color 0.3s ease;
    }
    
    .strength-text {
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .field-error {
        color: var(--danger-color);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
    
    .error {
        border-color: var(--danger-color) !important;
    }
`;
document.head.appendChild(style);

// Export functions for global use
window.logout = logout;
window.checkAuthStatus = checkAuthStatus;
window.redirectToDashboard = redirectToDashboard;
window.getCurrentUser = getCurrentUser;
window.hasPermission = hasPermission;
window.updateUIForLoggedUser = updateUIForLoggedUser;