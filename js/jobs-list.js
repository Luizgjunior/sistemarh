// Jobs List integrado com APIs
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 6;
let currentFilters = {};
let currentSort = 'recent';

// Initialize jobs list when page loads
document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('jobsList')) {
        await initJobsList();
    }
});

// Initialize jobs list
async function initJobsList() {
    try {
        showLoading(true);
        
        // Load jobs from API
        await loadJobsFromAPI();
        
        // Initialize search
        initSearch();
        
        // Initialize filters
        initFilters();
        
        // Initialize pagination
        initPagination();
        
        console.log('✅ Lista de vagas inicializada');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar lista de vagas:', error);
        showNotification('Erro ao carregar vagas. Tente recarregar a página.', 'error');
    } finally {
        showLoading(false);
    }
}

// Load jobs from API
async function loadJobsFromAPI(page = 1, filters = {}) {
    try {
        const response = await api.getJobs(page, 50, filters); // Load more jobs for client-side filtering
        
        if (response.success) {
            allJobs = response.jobs.map(job => ({
                id: job.id,
                title: job.title,
                company: job.companyName || 'Empresa',
                location: job.location,
                workMode: translateWorkMode(job.workMode),
                contractType: translateContractType(job.contractType),
                experience: translateExperience(job.experience),
                salaryMin: job.salaryMin || 0,
                salaryMax: job.salaryMax || 0,
                salaryPeriod: job.salaryPeriod || 'mensal',
                description: job.description,
                requirements: job.requirements,
                benefits: job.benefits || [],
                skills: job.skills || [],
                category: translateCategory(job.category),
                postedAt: job.createdAt,
                isActive: job.status === 'ativa',
                urgency: job.urgency,
                vacancies: job.vacancies,
                additionalInfo: job.additionalInfo
            }));
            
            filteredJobs = [...allJobs];
            currentPage = 1;
            loadJobs();
            
            return response;
        } else {
            throw new Error(response.message || 'Erro ao carregar vagas');
        }
        
    } catch (error) {
        console.error('Erro ao carregar vagas da API:', error);
        
        // Fallback: Load sample data
        allJobs = getSampleJobs();
        filteredJobs = [...allJobs];
        loadJobs();
        
        showNotification('Usando dados de exemplo. Verifique a conexão com o servidor.', 'info');
        throw error;
    }
}

// Translate fields from API
function translateWorkMode(mode) {
    const map = {
        'presencial': 'Presencial',
        'remoto': 'Remoto',
        'hibrido': 'Híbrido'
    };
    return map[mode] || mode;
}

function translateContractType(type) {
    const map = {
        'clt': 'CLT',
        'pj': 'PJ',
        'estagio': 'Estágio',
        'freelancer': 'Freelancer',
        'temporario': 'Temporário'
    };
    return map[type] || type;
}

function translateExperience(exp) {
    const map = {
        'estagiario': 'Estagiário',
        'junior': 'Júnior',
        'pleno': 'Pleno',
        'senior': 'Sênior',
        'especialista': 'Especialista'
    };
    return map[exp] || exp;
}

function translateCategory(cat) {
    const map = {
        'tecnologia': 'Tecnologia',
        'design': 'Design',
        'marketing': 'Marketing',
        'vendas': 'Vendas',
        'rh': 'Recursos Humanos',
        'financeiro': 'Financeiro',
        'operacoes': 'Operações',
        'outros': 'Outros'
    };
    return map[cat] || cat;
}

// Load jobs
function loadJobs() {
    const jobsList = document.getElementById('jobsList');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!jobsList) return;
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = filteredJobs.length;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const jobsToShow = filteredJobs.slice(startIndex, endIndex);
    
    // Clear existing jobs
    jobsList.innerHTML = '';
    
    // Show message if no jobs
    if (jobsToShow.length === 0) {
        jobsList.innerHTML = `
            <div class="no-jobs">
                <i class="fas fa-search"></i>
                <h3>Nenhuma vaga encontrada</h3>
                <p>Tente ajustar os filtros ou termos de busca</p>
                <button class="btn btn-primary" onclick="clearFilters()">Limpar Filtros</button>
            </div>
        `;
        return;
    }
    
    // Create job cards
    jobsToShow.forEach(job => {
        const jobCard = createJobCard(job);
        jobsList.appendChild(jobCard);
    });
    
    // Update pagination
    updatePagination();
}

// Create job card
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    
    // Format salary
    const salaryDisplay = job.salaryMin && job.salaryMax 
        ? `R$ ${job.salaryMin.toLocaleString()} - R$ ${job.salaryMax.toLocaleString()}`
        : job.salaryMin 
        ? `A partir de R$ ${job.salaryMin.toLocaleString()}`
        : 'Salário a combinar';
    
    // Get urgency class
    const urgencyClass = job.urgency === 'alta' || job.urgency === 'critica' ? 'urgent' : '';
    
    card.innerHTML = `
        <div class="job-header">
            <h3 class="job-title">${job.title}</h3>
            <div class="job-badges">
                <span class="job-type">${job.contractType}</span>
                ${job.urgency === 'alta' || job.urgency === 'critica' ? '<span class="urgent-badge">Urgente</span>' : ''}
            </div>
        </div>
        <div class="job-company">${job.company}</div>
        <div class="job-location">
            <i class="fas fa-map-marker-alt"></i>
            ${job.location} - ${job.workMode}
        </div>
        <div class="job-salary">
            <i class="fas fa-dollar-sign"></i>
            ${salaryDisplay}
        </div>
        <div class="job-description">${job.description.substring(0, 150)}...</div>
        <div class="job-skills">
            ${job.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            ${job.skills.length > 3 ? `<span class="skill-tag more">+${job.skills.length - 3}</span>` : ''}
        </div>
        <div class="job-actions">
            <button class="btn btn-primary btn-sm" onclick="viewJobDetails(${job.id})">
                Ver Detalhes
            </button>
            <button class="btn btn-secondary btn-sm" onclick="toggleSaveJob(${job.id}, this)">
                <i class="fas fa-heart"></i> <span>Salvar</span>
            </button>
        </div>
        <div class="job-meta">
            <span class="job-experience">${job.experience}</span>
            <span class="job-posted">Publicado em ${formatDate(job.postedAt)}</span>
            ${job.vacancies > 1 ? `<span class="job-vacancies">${job.vacancies} vagas</span>` : ''}
        </div>
    `;
    
    if (urgencyClass) {
        card.classList.add(urgencyClass);
    }
    
    return card;
}

// View job details
async function viewJobDetails(jobId) {
    try {
        showLoading(true);
        
        // Get job details from API
        const response = await api.getJobById(jobId);
        
        if (!response.success) {
            throw new Error(response.message || 'Erro ao carregar detalhes da vaga');
        }
        
        const job = response.job;
        
        const modal = document.getElementById('jobModal');
        const modalTitle = document.getElementById('modalJobTitle');
        const modalContent = document.getElementById('modalJobContent');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = job.title;
            
            // Format salary
            const salaryDisplay = job.salaryMin && job.salaryMax 
                ? `R$ ${job.salaryMin.toLocaleString()} - R$ ${job.salaryMax.toLocaleString()}`
                : job.salaryMin 
                ? `A partir de R$ ${job.salaryMin.toLocaleString()}`
                : 'Salário a combinar';
            
            modalContent.innerHTML = `
                <div class="job-details">
                    <div class="job-info">
                        <div class="job-company-info">
                            <h3>${job.companyName || 'Empresa'}</h3>
                            <div class="job-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${job.location} - ${translateWorkMode(job.workMode)}
                            </div>
                            <div class="job-salary">
                                <i class="fas fa-dollar-sign"></i>
                                ${salaryDisplay}
                            </div>
                            <div class="job-contract">
                                <i class="fas fa-briefcase"></i>
                                ${translateContractType(job.contractType)} - ${translateExperience(job.experience)}
                            </div>
                            ${job.urgency === 'alta' || job.urgency === 'critica' ? 
                                '<div class="job-urgency"><i class="fas fa-exclamation-triangle"></i> Vaga Urgente</div>' : ''
                            }
                        </div>
                    </div>
                    
                    <div class="job-description-section">
                        <h4>Descrição da Vaga</h4>
                        <p>${job.description}</p>
                    </div>
                    
                    <div class="job-requirements-section">
                        <h4>Requisitos</h4>
                        <p>${job.requirements}</p>
                    </div>
                    
                    ${job.skills && job.skills.length > 0 ? `
                        <div class="job-skills-section">
                            <h4>Habilidades Necessárias</h4>
                            <div class="skills-list">
                                ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${job.benefits && job.benefits.length > 0 ? `
                        <div class="job-benefits-section">
                            <h4>Benefícios</h4>
                            <ul class="benefits-list">
                                ${job.benefits.map(benefit => `<li><i class="fas fa-check"></i> ${benefit}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${job.additionalInfo ? `
                        <div class="job-additional-section">
                            <h4>Informações Adicionais</h4>
                            <p>${job.additionalInfo}</p>
                        </div>
                    ` : ''}
                    
                    <div class="job-actions-modal">
                        <button class="btn btn-primary" onclick="applyToJob(${job.id})">
                            <i class="fas fa-paper-plane"></i> Candidatar-se
                        </button>
                        <button class="btn btn-secondary" onclick="toggleSaveJob(${job.id})">
                            <i class="fas fa-heart"></i> Salvar Vaga
                        </button>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao carregar detalhes da vaga:', error);
        showNotification(error.message || 'Erro ao carregar detalhes da vaga', 'error');
    } finally {
        showLoading(false);
    }
}

// Apply to job
async function applyToJob(jobId) {
    try {
        if (!api.isLoggedIn()) {
            showNotification('Você precisa estar logado para se candidatar', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        const user = api.getUser();
        if (user.userType !== 'candidato') {
            showNotification('Apenas candidatos podem se candidatar a vagas', 'error');
            return;
        }
        
        // Create application via API
        const response = await api.applyToJob({
            jobId: jobId,
            cover_letter: 'Candidatura realizada através da plataforma RH Pro.'
        });
        
        if (response.success) {
            showNotification('Candidatura realizada com sucesso!', 'success');
            closeJobModal();
        } else {
            throw new Error(response.message || 'Erro ao realizar candidatura');
        }
        
    } catch (error) {
        console.error('Erro na candidatura:', error);
        showNotification(error.message || 'Erro ao realizar candidatura', 'error');
    }
}

// Toggle save job
function toggleSaveJob(jobId, buttonElement = null) {
    if (!api.isLoggedIn()) {
        showNotification('Você precisa estar logado para salvar vagas', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return;
    }
    
    // Get saved jobs from localStorage
    let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    
    // Check if job is already saved
    const isAlreadySaved = savedJobs.includes(jobId);
    
    if (isAlreadySaved) {
        // Remove from saved jobs
        savedJobs = savedJobs.filter(id => id !== jobId);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        showNotification('Vaga removida dos salvos', 'info');
        
        if (buttonElement) {
            buttonElement.innerHTML = '<i class="fas fa-heart"></i> <span>Salvar</span>';
            buttonElement.classList.remove('saved');
        }
    } else {
        // Add to saved jobs
        savedJobs.push(jobId);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        showNotification('Vaga salva com sucesso!', 'success');
        
        if (buttonElement) {
            buttonElement.innerHTML = '<i class="fas fa-heart"></i> <span>Salvo</span>';
            buttonElement.classList.add('saved');
        }
    }
}

// Close job modal
function closeJobModal() {
    const modal = document.getElementById('jobModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            searchJobs();
        }, 300));
    }
}

// Search jobs
function searchJobs() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    filteredJobs = allJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
    
    // Apply other filters
    applyCurrentFilters();
    
    currentPage = 1;
    loadJobs();
}

// Initialize filters
function initFilters() {
    // Filters are already initialized in HTML with onchange events
}

// Apply filters
function applyFilters() {
    const locationFilter = document.getElementById('locationFilter');
    const contractFilter = document.getElementById('contractFilter');
    const experienceFilter = document.getElementById('experienceFilter');
    const workModeFilter = document.getElementById('workModeFilter');
    
    currentFilters = {
        location: locationFilter?.value || '',
        contract: contractFilter?.value || '',
        experience: experienceFilter?.value || '',
        workMode: workModeFilter?.value || ''
    };
    
    applyCurrentFilters();
    currentPage = 1;
    loadJobs();
}

// Apply current filters
function applyCurrentFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    filteredJobs = allJobs.filter(job => {
        // Search filter
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
        
        // Location filter
        if (currentFilters.location) {
            if (currentFilters.location === 'remoto') {
                if (job.workMode !== 'Remoto') return false;
            } else {
                const locationMap = {
                    'sao-paulo': 'São Paulo',
                    'rio-de-janeiro': 'Rio de Janeiro',
                    'belo-horizonte': 'Belo Horizonte',
                    'brasilia': 'Brasília',
                    'porto-alegre': 'Porto Alegre'
                };
                const filterLocation = locationMap[currentFilters.location] || currentFilters.location;
                if (!job.location.includes(filterLocation)) return false;
            }
        }
        
        // Contract filter
        if (currentFilters.contract && job.contractType !== currentFilters.contract.toUpperCase()) {
            return false;
        }
        
        // Experience filter
        if (currentFilters.experience) {
            const expMap = {
                'junior': 'Júnior',
                'pleno': 'Pleno',
                'senior': 'Sênior',
                'estagiario': 'Estagiário'
            };
            if (job.experience !== expMap[currentFilters.experience]) return false;
        }
        
        // Work mode filter
        if (currentFilters.workMode) {
            const workModeMap = {
                'presencial': 'Presencial',
                'remoto': 'Remoto',
                'hibrido': 'Híbrido'
            };
            if (job.workMode !== workModeMap[currentFilters.workMode]) return false;
        }
        
        return true;
    });
}

// Clear filters
function clearFilters() {
    const filters = ['locationFilter', 'contractFilter', 'experienceFilter', 'workModeFilter'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    currentFilters = {};
    filteredJobs = [...allJobs];
    currentPage = 1;
    loadJobs();
}

// Sort jobs
function sortJobs() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    currentSort = sortBy;
    
    switch (sortBy) {
        case 'recent':
            filteredJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
            break;
        case 'salary-high':
            filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
            break;
        case 'salary-low':
            filteredJobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
            break;
        case 'company':
            filteredJobs.sort((a, b) => a.company.localeCompare(b.company));
            break;
        case 'title':
            filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    currentPage = 1;
    loadJobs();
}

// Initialize pagination
function initPagination() {
    // Pagination is initialized in loadJobs()
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Anterior
        </button>`;
    }
    
    // Page numbers (show max 5 pages)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">
            Próximo <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    loadJobs();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Refresh jobs from API
async function refreshJobs() {
    await loadJobsFromAPI();
    showNotification('Lista de vagas atualizada!', 'success');
}

// Get sample jobs for fallback
function getSampleJobs() {
    return [
        {
            id: 1,
            title: "Desenvolvedor Frontend",
            company: "TechCorp",
            location: "São Paulo, SP",
            workMode: "Híbrido",
            contractType: "CLT",
            experience: "Pleno",
            salaryMin: 8000,
            salaryMax: 12000,
            description: "Buscamos um desenvolvedor frontend experiente para trabalhar com React, TypeScript e Node.js. Você fará parte de uma equipe inovadora e terá a oportunidade de trabalhar em projetos desafiadores.",
            requirements: "Experiência com React, TypeScript, Node.js, Git, metodologias ágeis. Conhecimento em testes automatizados é um diferencial.",
            benefits: ["Vale Refeição", "Plano de Saúde", "Home Office", "Gympass"],
            skills: ["React", "TypeScript", "Node.js", "Git"],
            postedAt: "2024-01-15",
            isActive: true,
            urgency: 'media',
            vacancies: 1
        }
        // Add more sample jobs as needed
    ];
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Debounce function
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

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('jobModal');
    if (e.target === modal) {
        closeJobModal();
    }
});

// Export functions for global use
window.viewJobDetails = viewJobDetails;
window.closeJobModal = closeJobModal;
window.applyToJob = applyToJob;
window.toggleSaveJob = toggleSaveJob;
window.searchJobs = searchJobs;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.sortJobs = sortJobs;
window.goToPage = goToPage;
window.refreshJobs = refreshJobs;