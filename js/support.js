// Support page specific JavaScript

// Initialize support page when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initSupportPage();
});

// Initialize support page
function initSupportPage() {
    // Initialize FAQ functionality
    initFAQ();
    
    // Initialize chat widget
    initChatWidget();
    
    // Initialize contact form if present
    initContactForm();
}

// Initialize FAQ functionality
function initFAQ() {
    // FAQ category switching
    const categoryButtons = document.querySelectorAll('.faq-category');
    const categoryContents = document.querySelectorAll('.faq-category-content');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active category button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active category content
            categoryContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `faq-${category}`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // FAQ item toggle
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const icon = question.querySelector('i');
            
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    
                    otherAnswer.style.maxHeight = null;
                    otherIcon.style.transform = 'rotate(0deg)';
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
                item.classList.remove('active');
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
                item.classList.add('active');
            }
        });
    });
}

// Initialize chat widget
function initChatWidget() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    const chatInput = document.getElementById('chatInput');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Toggle chat widget
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatWidget && chatToggle) {
        const isVisible = chatWidget.style.display === 'block';
        
        if (isVisible) {
            closeChat();
        } else {
            openChat();
        }
    }
}

// Open chat widget
function openChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatWidget && chatToggle) {
        chatWidget.style.display = 'block';
        chatToggle.style.display = 'none';
        
        // Focus on input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }
}

// Close chat widget
function closeChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');
    
    if (chatWidget && chatToggle) {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'block';
    }
}

// Send message in chat
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessageToChat(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addMessageToChat(botResponse, 'bot');
    }, 1000);
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get bot response based on user message
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based responses
    if (lowerMessage.includes('cadastro') || lowerMessage.includes('registro')) {
        return 'Para se cadastrar, clique no botão "Entrar" no menu superior e selecione "Cadastro". Escolha o tipo de conta e preencha os dados solicitados.';
    }
    
    if (lowerMessage.includes('senha') || lowerMessage.includes('login')) {
        return 'Se você esqueceu sua senha, clique em "Esqueceu a senha?" na página de login e informe seu e-mail. Você receberá um link para redefinir sua senha.';
    }
    
    if (lowerMessage.includes('vaga') || lowerMessage.includes('candidatar')) {
        return 'Para se candidatar a uma vaga, navegue pela lista de vagas, clique na vaga de seu interesse e depois em "Candidatar-se". Certifique-se de que seu perfil está completo.';
    }
    
    if (lowerMessage.includes('perfil') || lowerMessage.includes('curriculo')) {
        return 'Para atualizar seu perfil, acesse seu dashboard e clique em "Meu Perfil". Lá você pode atualizar suas informações e fazer upload do seu currículo.';
    }
    
    if (lowerMessage.includes('empresa') || lowerMessage.includes('contratar')) {
        return 'Para empresas, você pode criar vagas, gerenciar candidatos e acompanhar o processo seletivo através do dashboard da empresa.';
    }
    
    if (lowerMessage.includes('problema') || lowerMessage.includes('erro') || lowerMessage.includes('bug')) {
        return 'Se você está enfrentando problemas técnicos, por favor descreva o erro que está ocorrendo e eu tentarei ajudá-lo. Você também pode enviar um e-mail para suporte@rhpro.com.';
    }
    
    if (lowerMessage.includes('preço') || lowerMessage.includes('custo') || lowerMessage.includes('gratuito')) {
        return 'O RH Pro oferece um plano gratuito com funcionalidades básicas. Para empresas que precisam de recursos avançados, oferecemos planos premium. Entre em contato conosco para mais informações.';
    }
    
    if (lowerMessage.includes('contato') || lowerMessage.includes('telefone') || lowerMessage.includes('email')) {
        return 'Você pode entrar em contato conosco por e-mail (suporte@rhpro.com), WhatsApp (11) 99999-9999 ou telefone (11) 3333-4444. Nossa equipe está disponível de segunda a sexta, das 9h às 18h.';
    }
    
    // Default response
    return 'Obrigado pela sua mensagem! Nossa equipe de suporte analisará sua dúvida e retornará em breve. Você também pode enviar um e-mail para suporte@rhpro.com para uma resposta mais detalhada.';
}

// Initialize contact form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmission();
        });
    }
}

// Handle contact form submission
function handleContactFormSubmission() {
    const formData = new FormData(document.getElementById('contactForm'));
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        category: formData.get('category')
    };
    
    // Show loading state
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showAlert('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        
        // Reset form
        document.getElementById('contactForm').reset();
    }, 2000);
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(alertContainer, mainContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alertContainer.remove();
        }, 5000);
    }
}

// Smooth scroll to FAQ section
function scrollToFAQ() {
    const faqSection = document.getElementById('faq');
    if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Search FAQ
function searchFAQ(searchTerm) {
    const faqItems = document.querySelectorAll('.faq-item');
    const searchTermLower = searchTerm.toLowerCase();
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(searchTermLower) || answer.includes(searchTermLower)) {
            item.style.display = 'block';
            item.classList.add('search-highlight');
        } else {
            item.style.display = 'none';
            item.classList.remove('search-highlight');
        }
    });
}

// Clear FAQ search
function clearFAQSearch() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.style.display = 'block';
        item.classList.remove('search-highlight');
    });
}

// Export functions for global use
window.toggleChat = toggleChat;
window.openChat = openChat;
window.closeChat = closeChat;
window.sendMessage = sendMessage;
window.scrollToFAQ = scrollToFAQ;
window.searchFAQ = searchFAQ;
window.clearFAQSearch = clearFAQSearch;
