// Admin specific JavaScript

// Initialize admin features when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('dashboard-page') && 
        window.location.pathname.includes('admin')) {
        initAdminFeatures();
    }
});

// Initialize admin features
function initAdminFeatures() {
    // Load admin dashboard data
    loadAdminDashboardData();
    
    // Initialize system monitoring
    initSystemMonitoring();
    
    // Initialize user management
    initUserManagement();
    
    // Initialize system alerts
    initSystemAlerts();
}

// Load admin dashboard data
function loadAdminDashboardData() {
    // Load system statistics
    loadSystemStats();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load system status
    loadSystemStatus();
    
    // Load alerts
    loadSystemAlerts();
}

// Load system statistics
function loadSystemStats() {
    const stats = {
        totalUsers: 1247,
        activeCompanies: 89,
        activeJobs: 156,
        totalApplications: 2341,
        onlineUsers: 127,
        pageViews: 2400,
        avgSessionTime: '8m 32s'
    };
    
    // Animate numbers
    Object.keys(stats).forEach(key => {
        if (typeof stats[key] === 'number') {
            animateNumber(key, stats[key]);
        }
    });
}

// Load recent activity
function loadRecentActivity() {
    // This would typically fetch from an API
    // For now, we'll use the static data from HTML
    console.log('Recent activity loaded for admin');
}

// Load system status
function loadSystemStatus() {
    // Simulate system status check
    const statusItems = document.querySelectorAll('.status-item');
    
    statusItems.forEach(item => {
        const statusIcon = item.querySelector('i');
        const statusText = item.querySelector('.status-text');
        
        // Simulate random status for demo
        const isOnline = Math.random() > 0.1; // 90% chance of being online
        
        if (isOnline) {
            statusIcon.classList.add('status-ok');
            statusIcon.classList.remove('status-error', 'status-warning');
            statusText.textContent = 'Online';
            statusText.className = 'status-text ok';
        } else {
            statusIcon.classList.add('status-error');
            statusIcon.classList.remove('status-ok', 'status-warning');
            statusText.textContent = 'Offline';
            statusText.className = 'status-text error';
        }
    });
}

// Load system alerts
function loadSystemAlerts() {
    // This would typically fetch from an API
    console.log('System alerts loaded');
}

// Initialize system monitoring
function initSystemMonitoring() {
    // Monitor system status every 30 seconds
    setInterval(() => {
        checkSystemStatus();
    }, 30000);
    
    // Monitor user activity every minute
    setInterval(() => {
        updateUserActivity();
    }, 60000);
}

// Check system status
function checkSystemStatus() {
    // This would typically make API calls to check system health
    console.log('System status checked');
}

// Update user activity
function updateUserActivity() {
    // This would typically fetch current user activity
    console.log('User activity updated');
}

// Initialize user management
function initUserManagement() {
    // Add event listeners for user management actions
    const userActions = document.querySelectorAll('[data-user-action]');
    
    userActions.forEach(action => {
        action.addEventListener('click', handleUserAction);
    });
}

// Handle user action
function handleUserAction(e) {
    const action = e.target.dataset.userAction;
    const userId = e.target.dataset.userId;
    
    switch (action) {
        case 'block':
            blockUser(userId);
            break;
        case 'unblock':
            unblockUser(userId);
            break;
        case 'delete':
            deleteUser(userId);
            break;
        case 'view':
            viewUser(userId);
            break;
    }
}

// Block user
function blockUser(userId) {
    if (confirm('Tem certeza que deseja bloquear este usuário?')) {
        showAlert('Bloqueando usuário...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showAlert('Usuário bloqueado com sucesso!', 'success');
            updateUserStatus(userId, 'blocked');
        }, 1000);
    }
}

// Unblock user
function unblockUser(userId) {
    showAlert('Desbloqueando usuário...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Usuário desbloqueado com sucesso!', 'success');
        updateUserStatus(userId, 'active');
    }, 1000);
}

// Delete user
function deleteUser(userId) {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
        showAlert('Excluindo usuário...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showAlert('Usuário excluído com sucesso!', 'success');
            removeUserFromTable(userId);
        }, 1000);
    }
}

// View user details
function viewUser(userId) {
    // This would typically open a modal or redirect to user details page
    showAlert('Abrindo detalhes do usuário...', 'info');
}

// Update user status in table
function updateUserStatus(userId, status) {
    const row = document.querySelector(`[data-user-id="${userId}"]`);
    if (row) {
        const statusCell = row.querySelector('.user-status');
        if (statusCell) {
            statusCell.textContent = status === 'blocked' ? 'Bloqueado' : 'Ativo';
            statusCell.className = `user-status ${status}`;
        }
    }
}

// Remove user from table
function removeUserFromTable(userId) {
    const row = document.querySelector(`[data-user-id="${userId}"]`);
    if (row) {
        row.remove();
    }
}

// Initialize system alerts
function initSystemAlerts() {
    // Add event listeners for alert actions
    const alertActions = document.querySelectorAll('[data-alert-action]');
    
    alertActions.forEach(action => {
        action.addEventListener('click', handleAlertAction);
    });
}

// Handle alert action
function handleAlertAction(e) {
    const action = e.target.dataset.alertAction;
    const alertId = e.target.dataset.alertId;
    
    switch (action) {
        case 'resolve':
            resolveAlert(alertId);
            break;
        case 'dismiss':
            dismissAlert(alertId);
            break;
        case 'view':
            viewAlert(alertId);
            break;
    }
}

// Resolve alert
function resolveAlert(alertId) {
    showAlert('Resolvendo alerta...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Alerta resolvido com sucesso!', 'success');
        removeAlert(alertId);
    }, 1000);
}

// Dismiss alert
function dismissAlert(alertId) {
    showAlert('Descartando alerta...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        showAlert('Alerta descartado!', 'success');
        removeAlert(alertId);
    }, 1000);
}

// View alert details
function viewAlert(alertId) {
    // This would typically open a modal or redirect to alert details
    showAlert('Abrindo detalhes do alerta...', 'info');
}

// Remove alert from list
function removeAlert(alertId) {
    const alertItem = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertItem) {
        alertItem.remove();
    }
}

// Generate system report
function generateSystemReport() {
    showAlert('Gerando relatório do sistema...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        showAlert('Relatório gerado com sucesso!', 'success');
        
        // In a real application, this would download the report
        const reportData = {
            timestamp: new Date().toISOString(),
            totalUsers: 1247,
            activeCompanies: 89,
            activeJobs: 156,
            totalApplications: 2341
        };
        
        console.log('System Report:', reportData);
    }, 2000);
}

// Backup system data
function backupSystemData() {
    showAlert('Iniciando backup do sistema...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
        showAlert('Backup concluído com sucesso!', 'success');
    }, 3000);
}

// Clear system cache
function clearSystemCache() {
    if (confirm('Tem certeza que deseja limpar o cache do sistema?')) {
        showAlert('Limpando cache do sistema...', 'info');
        
        // Simulate cache clearing
        setTimeout(() => {
            showAlert('Cache limpo com sucesso!', 'success');
        }, 1500);
    }
}

// Restart system services
function restartSystemServices() {
    if (confirm('Tem certeza que deseja reiniciar os serviços do sistema? Isso pode causar interrupção temporária.')) {
        showAlert('Reiniciando serviços do sistema...', 'info');
        
        // Simulate service restart
        setTimeout(() => {
            showAlert('Serviços reiniciados com sucesso!', 'success');
        }, 5000);
    }
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

// Export functions for global use
window.generateSystemReport = generateSystemReport;
window.backupSystemData = backupSystemData;
window.clearSystemCache = clearSystemCache;
window.restartSystemServices = restartSystemServices;
