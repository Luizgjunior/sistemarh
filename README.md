# 🏢 RH Pro - Sistema Completo de Recursos Humanos

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Luizgjunior/sistemarh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

Sistema moderno e completo para gestão de recursos humanos com frontend responsivo e backend robusto.

## 🚀 Demo Online

**🌐 [Acesse a Demo](https://sistemarh.vercel.app)**

- **Admin**: `admin@rhpro.com` / `admin123`
- **Teste o sistema completo diretamente no browser!**

## ✨ Características

### 🎯 **Funcionalidades Principais**
- ✅ **Gestão de Vagas** - Criação, edição e publicação de vagas
- ✅ **Sistema de Candidaturas** - Processo completo de candidatura
- ✅ **Dashboards Dinâmicos** - Para empresas, candidatos e admin
- ✅ **Autenticação JWT** - Sistema seguro de login
- ✅ **Interface Responsiva** - Funciona em desktop e mobile
- ✅ **Busca e Filtros** - Sistema avançado de filtros
- ✅ **Gestão de Usuários** - Controle completo de permissões

### 🛠 **Tecnologias**

#### **Frontend**
- HTML5, CSS3, JavaScript ES6+
- Design responsivo com Flexbox/Grid
- Font Awesome para ícones
- Animações CSS suaves

#### **Backend**
- Node.js + Express.js
- SQLite3 (banco de dados)
- JWT para autenticação
- bcryptjs para criptografia
- Helmet para segurança
- CORS configurado

## 🚀 Instalação e Uso

### **Pré-requisitos**
- Node.js >= 18.0.0
- npm ou yarn

### **1. Clone o Repositório**
```bash
git clone https://github.com/Luizgjunior/sistemarh.git
cd sistemarh
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure o Ambiente**
```bash
# Copie o arquivo de exemplo
cp env.example backend/config.env

# Edite as configurações se necessário
# O sistema funciona com as configurações padrão
```

### **4. Inicie o Servidor**
```bash
npm start
```

### **5. Acesse o Sistema**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/health
- **Admin**: `admin@rhpro.com` / `admin123`

## 🌐 Deploy na Vercel

### **Deploy Automático**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Luizgjunior/sistemarh)

### **Deploy Manual**
```bash
# 1. Instale a CLI da Vercel
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel --prod
```

### **Configuração de Ambiente na Vercel**
No painel da Vercel, configure estas variáveis:
```
JWT_SECRET=seu_jwt_secret_super_seguro
NODE_ENV=production
```

## 📁 Estrutura do Projeto

```
sistemarh/
├── 📄 index.html              # Página inicial
├── 📄 login.html              # Login/Registro  
├── 📄 suporte.html            # Suporte
├── 📄 teste-integracao.html   # Testes da API
├── 📁 css/
│   └── style.css              # Estilos principais
├── 📁 js/
│   ├── config.js              # Configuração da API
│   ├── auth.js                # Sistema de autenticação
│   ├── jobs-list.js           # Lista de vagas
│   ├── dashboard.js           # Dashboards
│   └── main.js                # JavaScript principal
├── 📁 pages/
│   ├── dashboard-empresa.html # Dashboard da empresa
│   ├── dashboard-candidato.html # Dashboard do candidato
│   ├── dashboard-admin.html   # Dashboard do admin
│   ├── criar-vaga.html        # Criação de vagas
│   └── vagas-publicas.html    # Lista pública de vagas
└── 📁 backend/
    ├── start.js               # Entrada do servidor
    ├── server.js              # Configuração Express
    ├── 📁 config/
    │   └── database.js        # Configuração SQLite
    ├── 📁 models/
    │   ├── User.js            # Model de usuários
    │   ├── Job.js             # Model de vagas
    │   └── Application.js     # Model de candidaturas
    ├── 📁 routes/
    │   ├── auth.js            # Rotas de autenticação
    │   ├── users.js           # Rotas de usuários
    │   ├── jobs.js            # Rotas de vagas
    │   └── applications.js    # Rotas de candidaturas
    └── 📁 middleware/
        ├── auth.js            # Middleware de autenticação
        └── errorHandler.js    # Tratamento de erros
```

## 🔌 API Endpoints

### **Autenticação**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário atual

### **Vagas**
- `GET /api/jobs` - Listar vagas (público)
- `POST /api/jobs` - Criar vaga (empresa)
- `GET /api/jobs/:id` - Detalhes da vaga
- `PUT /api/jobs/:id` - Atualizar vaga
- `DELETE /api/jobs/:id` - Deletar vaga

### **Candidaturas**
- `POST /api/applications` - Candidatar-se
- `GET /api/applications/my` - Minhas candidaturas
- `GET /api/applications/job/:jobId` - Candidatos da vaga

### **Usuários**
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/profile/:id` - Perfil do usuário
- `PUT /api/users/profile/:id` - Atualizar perfil

## 👥 Tipos de Usuário

### **🏢 Empresa**
- Criar e gerenciar vagas
- Ver candidatos
- Dashboard com estatísticas
- Gerenciar perfil da empresa

### **👤 Candidato**
- Buscar e filtrar vagas
- Candidatar-se a vagas
- Acompanhar candidaturas
- Gerenciar perfil

### **⚙️ Admin**
- Controle total do sistema
- Gerenciar usuários
- Estatísticas globais
- Moderação de conteúdo

## 🔒 Segurança

- ✅ **JWT Authentication** - Tokens seguros
- ✅ **Password Hashing** - bcryptjs
- ✅ **Rate Limiting** - Proteção contra spam
- ✅ **Helmet.js** - Headers de segurança
- ✅ **CORS** - Configuração adequada
- ✅ **Validation** - Validação de dados

## 🧪 Testes

### **Teste Local**
```bash
# Inicie o servidor
npm start

# Acesse os testes
http://localhost:3000/teste-integracao.html
```

### **Teste das APIs**
O arquivo `teste-integracao.html` permite testar:
- ✅ Conectividade com a API
- ✅ Sistema de autenticação
- ✅ CRUD de vagas
- ✅ Sistema de candidaturas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- 🖥️ **Desktop** (1200px+)
- 💻 **Laptop** (768px - 1199px)
- 📱 **Tablet** (576px - 767px)
- 📱 **Mobile** (< 576px)

## 🎨 Design

- **Interface Moderna** - Design clean e profissional
- **UX Intuitiva** - Navegação simples e eficiente
- **Feedback Visual** - Notificações e estados de loading
- **Acessibilidade** - Cores contrastantes e navegação por teclado

## 🔧 Desenvolvimento

### **Estrutura de Desenvolvimento**
```bash
# Modo desenvolvimento com hot-reload
npm run dev

# Build para produção
npm run build

# Verificar sintaxe
npm run test
```

### **Contribuindo**
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Luiz G. Junior**
- GitHub: [@Luizgjunior](https://github.com/Luizgjunior)
- Email: contato@rhpro.com

## 🙏 Agradecimentos

- Font Awesome pelos ícones
- Google Fonts pela tipografia Inter
- Comunidade Node.js pelas ferramentas

---

<div align="center">

**🚀 [Deploy na Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Luizgjunior/sistemarh) | 📖 [Documentação](https://github.com/Luizgjunior/sistemarh#readme) | 🐛 [Reportar Bug](https://github.com/Luizgjunior/sistemarh/issues)**

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐

</div>