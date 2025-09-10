// Dashboard integrado com APIs

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    if (document.body.classList.contains('dashboard-page')) {
        await initDashboard();
    }
});

// Initialize dashboard
async function initDashboard() {
    try {
        // Check authentication
        if (!api.requireAuth()) {
            return;
        }
        
        showLoading(true);
        
        // Load dashboard data
        await loadDashboardData();
        
        // Initialize user menu
        initUserMenu();
        
        // Initialize real-time updates
        initRealTimeUpdates();
        
        // Initialize charts if present
        initCharts();
        
        // Update UI for logged user
        updateUIForLoggedUser();
        
        console.log('✅ Dashboard inicializado');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        showNotification('Erro ao carregar dashboard. Tente recarregar a página.', 'error');
    } finally {
        showLoading(false);
    }
}

// Load dashboard data based on user type
async function loadDashboardData() {
    const userData = api.getUser();
    
    if (!userData) {
        api.logout();
        return;
    }
    
    // Load data based on user type
    switch (userData.userType) {
        case 'empresa':
            await loadEmpresaData();
            break;
        case 'candidato':
            await loadCandidatoData();
            break;
        case 'admin':
            await loadAdminData();
            break;
        default:
            showNotification('Tipo de usuário inválido', 'error');
            api.logout();
    }
}

// Get user data from storage
function getUserData() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Load empresa dashboard data
function loadEmpresaData() {
    const stats = {
        totalJobs: 24,
        totalCandidates: 156,
        interviews: 8,
        hired: 3
    };
    
    // Animate numbers
    animateNumber('totalJobs', stats.totalJobs);
    animateNumber('totalCandidates', stats.totalCandidates);
    animateNumber('interviews', stats.interviews);
    animateNumber('hired', stats.hired);
    
    // Load recent activity
    loadRecentActivity();
}

// Load candidato dashboard data
function loadCandidatoData() {
    const stats = {
        totalApplications: 12,
        pendingApplications: 5,
        interviews: 2,
        offers: 1
    };
    
    // Animate numbers
    animateNumber('totalApplications', stats.totalApplications);
    animateNumber('pendingApplications', stats.pendingApplications);
    animateNumber('interviews', stats.interviews);
    animateNumber('offers', stats.offers);
    
    // Load recent applications
    loadRecentApplications();
    
    // Load recommended jobs
    loadRecommendedJobs();
}

// Load admin dashboard data
function loadAdminData() {
    const stats = {
        totalUsers: 1247,
        activeCompanies: 89,
        activeJobs: 156,
        totalApplications: 2341
    };
    
    // Animate numbers
    animateNumber('totalUsers', stats.totalUsers);
    animateNumber('activeCompanies', stats.activeCompanies);
    animateNumber('activeJobs', stats.activeJobs);
    animateNumber('totalApplications', stats.totalApplications);
    
    // Load system status
    loadSystemStatus();
    
    // Load recent activity
    loadRecentActivity();
}

// Animate number counting
function animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 30);
}

// Load recent activity
function loadRecentActivity() {
    // This would typically fetch from an API
    // For now, we'll use the static data from HTML
    console.log('Recent activity loaded');
}

// Load recent applications for candidates
function loadRecentApplications() {
    // This would typically fetch from an API
    console.log('Recent applications loaded');
}

// Load recommended jobs for candidates
function loadRecommendedJobs() {
    // This would typically fetch from an API
    console.log('Recommended jobs loaded');
}

// Load system status for admin
function loadSystemStatus() {
    // This would typically fetch from an API
    console.log('System status loaded');
}

// Initialize user menu
function initUserMenu() {
    const userAvatar = document.querySelector('.user-avatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}

// Toggle user menu
function toggleUserMenu() {
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.classList.toggle('active');
    }
}

// Initialize real-time updates
function initRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        updateDashboardStats();
    }, 30000);
}

// Update dashboard stats
function updateDashboardStats() {
    // This would typically fetch fresh data from an API
    console.log('Dashboard stats updated');
}

// Initialize charts
function initCharts() {
    // Chart initialization would go here
    // For now, we'll just add placeholder functionality
    console.log('Charts initialized');
}

// Handle job application
function applyToJob(jobId) {
    const userData = getUserData();
    
    if (!userData) {
        showAlert('Você precisa estar logado para se candidatar a uma vaga', 'error');
        return;
    }
    
    if (userData.userType !== 'candidato') {
        showAlert('Apenas candidatos podem se candidatar a vagas', 'error');
        return;
    }
    
    // Show loading state
    showAlert('Candidatando-se à vaga...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Candidatura realizada com sucesso!', 'success');
        
        // Update UI
        updateApplicationStatus(jobId, 'applied');
    }, 1500);
}

// Update application status in UI
function updateApplicationStatus(jobId, status) {
    const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
    if (jobCard) {
        const applyBtn = jobCard.querySelector('.btn-primary');
        if (applyBtn) {
            applyBtn.textContent = 'Candidatado';
            applyBtn.classList.remove('btn-primary');
            applyBtn.classList.add('btn-success');
            applyBtn.disabled = true;
        }
    }
}

// Handle save job
function saveJob(jobId) {
    const userData = getUserData();
    
    if (!userData) {
        showAlert('Você precisa estar logado para salvar uma vaga', 'error');
        return;
    }
    
    // Show loading state
    showAlert('Salvando vaga...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Vaga salva com sucesso!', 'success');
        
        // Update UI
        updateSaveStatus(jobId, 'saved');
    }, 1000);
}

// Update save status in UI
function updateSaveStatus(jobId, status) {
    const jobCard = document.querySelector(`[data-job-id="${jobId}"]`);
    if (jobCard) {
        const saveBtn = jobCard.querySelector('.btn-secondary');
        if (saveBtn) {
            saveBtn.textContent = 'Salvo';
            saveBtn.classList.remove('btn-secondary');
            saveBtn.classList.add('btn-success');
            saveBtn.disabled = true;
        }
    }
}

// Handle candidate status update
function updateCandidateStatus(candidateId, newStatus) {
    // Show loading state
    showAlert('Atualizando status...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Status atualizado com sucesso!', 'success');
        
        // Update UI
        updateStatusInTable(candidateId, newStatus);
    }, 1000);
}

// Update status in table
function updateStatusInTable(candidateId, newStatus) {
    const row = document.querySelector(`[data-candidate-id="${candidateId}"]`);
    if (row) {
        const statusCell = row.querySelector('.status-badge');
        if (statusCell) {
            statusCell.textContent = getStatusText(newStatus);
            statusCell.className = `status-badge status-${newStatus}`;
        }
    }
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'new': 'Novo',
        'review': 'Em Análise',
        'interview': 'Entrevista',
        'approved': 'Aprovado',
        'rejected': 'Reprovado'
    };
    return statusMap[status] || status;
}

// Handle job status update
function updateJobStatus(jobId, newStatus) {
    // Show loading state
    showAlert('Atualizando status da vaga...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Status da vaga atualizado!', 'success');
        
        // Update UI
        updateJobStatusInTable(jobId, newStatus);
    }, 1000);
}

// Update job status in table
function updateJobStatusInTable(jobId, newStatus) {
    const row = document.querySelector(`[data-job-id="${jobId}"]`);
    if (row) {
        const statusCell = row.querySelector('.status-badge');
        if (statusCell) {
            statusCell.textContent = getJobStatusText(newStatus);
            statusCell.className = `status-badge status-${newStatus}`;
        }
    }
}

// Get job status text
function getJobStatusText(status) {
    const statusMap = {
        'active': 'Ativa',
        'paused': 'Pausada',
        'closed': 'Fechada',
        'draft': 'Rascunho'
    };
    return statusMap[status] || status;
}

// Mark all alerts as read (admin)
function markAllAsRead() {
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        item.classList.add('read');
    });
    
    showAlert('Todos os alertas foram marcados como lidos', 'success');
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    
    // Insert at the top of the dashboard content
    const dashboardContent = document.querySelector('.dashboard-content');
    if (dashboardContent) {
        dashboardContent.insertBefore(alertContainer, dashboardContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alertContainer.remove();
        }, 5000);
    }
}

// Export functions for global use
window.toggleUserMenu = toggleUserMenu;
window.applyToJob = applyToJob;
window.saveJob = saveJob;
window.updateCandidateStatus = updateCandidateStatus;
window.updateJobStatus = updateJobStatus;
window.markAllAsRead = markAllAsRead;
