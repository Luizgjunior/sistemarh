// Job Form specific JavaScript

// Initialize job form when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('jobForm')) {
        initJobForm();
    }
});

// Initialize job form
function initJobForm() {
    // Add form validation
    initFormValidation();
    
    // Add real-time validation
    initRealTimeValidation();
    
    // Add form submission handler
    initFormSubmission();
    
    // Add draft saving
    initDraftSaving();
    
    // Add skill tags functionality
    initSkillTags();
}

// Initialize form validation
function initFormValidation() {
    const form = document.getElementById('jobForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateJobForm()) {
            submitJobForm();
        }
    });
}

// Validate job form
function validateJobForm() {
    let isValid = true;
    const errors = [];
    
    // Clear previous errors
    clearAllFieldErrors();
    
    // Required fields validation
    const requiredFields = [
        'title', 'category', 'description', 'requirements', 
        'location', 'workMode', 'contractType', 'experience'
    ];
    
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field && !field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        }
    });
    
    // Salary validation
    const salaryMin = document.getElementById('jobSalaryMin');
    const salaryMax = document.getElementById('jobSalaryMax');
    
    if (salaryMin.value && salaryMax.value) {
        if (parseFloat(salaryMin.value) > parseFloat(salaryMax.value)) {
            showFieldError(salaryMin, 'Salário mínimo não pode ser maior que o máximo');
            isValid = false;
        }
    }
    
    // Date validation
    const startDate = document.getElementById('jobStartDate');
    const endDate = document.getElementById('jobEndDate');
    
    if (startDate.value && endDate.value) {
        if (new Date(startDate.value) > new Date(endDate.value)) {
            showFieldError(endDate, 'Data de encerramento deve ser posterior à data de início');
            isValid = false;
        }
    }
    
    // Description length validation
    const description = document.getElementById('jobDescription');
    if (description.value.length < 100) {
        showFieldError(description, 'Descrição deve ter pelo menos 100 caracteres');
        isValid = false;
    }
    
    // Requirements length validation
    const requirements = document.getElementById('jobRequirements');
    if (requirements.value.length < 50) {
        showFieldError(requirements, 'Requisitos devem ter pelo menos 50 caracteres');
        isValid = false;
    }
    
    return isValid;
}

// Submit job form
function submitJobForm() {
    const form = document.getElementById('jobForm');
    const formData = new FormData(form);
    
    // Convert form data to object
    const jobData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        benefits: formData.get('benefits'),
        location: formData.get('location'),
        workMode: formData.get('workMode'),
        contractType: formData.get('contractType'),
        experience: formData.get('experience'),
        salaryMin: formData.get('salaryMin'),
        salaryMax: formData.get('salaryMax'),
        salaryPeriod: formData.get('salaryPeriod'),
        vacancies: formData.get('vacancies') || 1,
        urgency: formData.get('urgency'),
        skills: formData.get('skills'),
        additionalInfo: formData.get('additionalInfo'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        isActive: formData.get('isActive') === 'on',
        allowRemote: formData.get('allowRemote') === 'on',
        benefitsList: formData.getAll('benefits')
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="loading"></i> Publicando...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showAlert('Vaga publicada com sucesso!', 'success');
        
        // Redirect to jobs list
        setTimeout(() => {
            window.location.href = 'vagas-empresa.html';
        }, 2000);
    }, 2000);
}

// Initialize real-time validation
function initRealTimeValidation() {
    const inputs = document.querySelectorAll('#jobForm input, #jobForm select, #jobForm textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    
    // Clear previous error
    clearFieldError(field);
    
    // Required field validation
    const requiredFields = [
        'title', 'category', 'description', 'requirements', 
        'location', 'workMode', 'contractType', 'experience'
    ];
    
    if (requiredFields.includes(fieldName) && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    // Specific validations
    switch (fieldName) {
        case 'title':
            if (value.length < 5) {
                showFieldError(field, 'Título deve ter pelo menos 5 caracteres');
                return false;
            }
            break;
            
        case 'description':
            if (value.length > 0 && value.length < 100) {
                showFieldError(field, 'Descrição deve ter pelo menos 100 caracteres');
                return false;
            }
            break;
            
        case 'requirements':
            if (value.length > 0 && value.length < 50) {
                showFieldError(field, 'Requisitos devem ter pelo menos 50 caracteres');
                return false;
            }
            break;
            
        case 'salaryMin':
        case 'salaryMax':
            if (value && (isNaN(value) || parseFloat(value) < 0)) {
                showFieldError(field, 'Valor deve ser um número positivo');
                return false;
            }
            break;
    }
    
    return true;
}

// Initialize form submission
function initFormSubmission() {
    const form = document.getElementById('jobForm');
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateJobForm()) {
            submitJobForm();
        }
    });
}

// Initialize draft saving
function initDraftSaving() {
    // Auto-save draft every 30 seconds
    setInterval(() => {
        saveDraft();
    }, 30000);
    
    // Save draft when user leaves page
    window.addEventListener('beforeunload', function() {
        saveDraft();
    });
}

// Save draft
function saveDraft() {
    const form = document.getElementById('jobForm');
    const formData = new FormData(form);
    
    const draftData = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        benefits: formData.get('benefits'),
        location: formData.get('location'),
        workMode: formData.get('workMode'),
        contractType: formData.get('contractType'),
        experience: formData.get('experience'),
        salaryMin: formData.get('salaryMin'),
        salaryMax: formData.get('salaryMax'),
        salaryPeriod: formData.get('salaryPeriod'),
        vacancies: formData.get('vacancies'),
        urgency: formData.get('urgency'),
        skills: formData.get('skills'),
        additionalInfo: formData.get('additionalInfo'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        isActive: formData.get('isActive') === 'on',
        allowRemote: formData.get('allowRemote') === 'on',
        benefitsList: formData.getAll('benefits'),
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('jobDraft', JSON.stringify(draftData));
    
    // Show save indicator
    showSaveIndicator();
}

// Load draft
function loadDraft() {
    const draftData = localStorage.getItem('jobDraft');
    
    if (draftData) {
        const draft = JSON.parse(draftData);
        
        // Populate form fields
        Object.keys(draft).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = draft[key];
                } else {
                    field.value = draft[key] || '';
                }
            }
        });
        
        // Handle benefits checkboxes
        if (draft.benefitsList) {
            draft.benefitsList.forEach(benefit => {
                const checkbox = document.querySelector(`input[value="${benefit}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        showAlert('Rascunho carregado com sucesso!', 'info');
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('jobDraft');
    showAlert('Rascunho removido!', 'info');
}

// Initialize skill tags
function initSkillTags() {
    const skillsInput = document.getElementById('jobSkills');
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skills-container';
    skillsContainer.style.marginTop = '0.5rem';
    
    skillsInput.parentNode.insertBefore(skillsContainer, skillsInput.nextSibling);
    
    skillsInput.addEventListener('input', function() {
        const skills = this.value.split(',').map(skill => skill.trim()).filter(skill => skill);
        
        // Clear existing tags
        skillsContainer.innerHTML = '';
        
        // Create skill tags
        skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = skill;
            tag.innerHTML += ' <i class="fas fa-times" onclick="removeSkill(this)"></i>';
            skillsContainer.appendChild(tag);
        });
    });
}

// Remove skill tag
function removeSkill(icon) {
    const tag = icon.parentNode;
    const skillText = tag.textContent.replace(' ×', '');
    
    // Remove from input
    const skillsInput = document.getElementById('jobSkills');
    const skills = skillsInput.value.split(',').map(skill => skill.trim());
    const updatedSkills = skills.filter(skill => skill !== skillText);
    skillsInput.value = updatedSkills.join(', ');
    
    // Remove tag
    tag.remove();
}

// Show save indicator
function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.innerHTML = '<i class="fas fa-save"></i> Rascunho salvo';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    // Show indicator
    setTimeout(() => {
        indicator.style.opacity = '1';
    }, 100);
    
    // Hide indicator
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }, 2000);
}

// Show field error
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--danger-color);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    formGroup.appendChild(errorElement);
}

// Clear field error
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    field.classList.remove('error');
    
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Clear all field errors
function clearAllFieldErrors() {
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
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
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.clearDraft = clearDraft;
window.removeSkill = removeSkill;
