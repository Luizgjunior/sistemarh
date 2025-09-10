# Backend RH Pro

Backend completo para o sistema de RH desenvolvido com Node.js, Express e MongoDB.

## 🚀 Configuração Inicial

### 1. Pré-requisitos
- Node.js (versão 14 ou superior)
- MongoDB (local ou Atlas)
- npm ou yarn

### 2. Configuração do Ambiente

1. **Renomeie o arquivo de configuração:**
   ```bash
   cp config.env .env
   ```

2. **Configure as variáveis de ambiente no arquivo .env:**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/rhpro
   JWT_SECRET=seu_jwt_secret_super_seguro_aqui_12345
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5500
   MAX_FILE_SIZE=5000000
   UPLOAD_PATH=./uploads
   ```

### 3. Instalação do MongoDB

#### Opção 1: MongoDB Local
1. Baixe e instale o MongoDB Community Server
2. Inicie o serviço MongoDB
3. Use a URI: `mongodb://localhost:27017/rhpro`

#### Opção 2: MongoDB Atlas (Cloud - Gratuito)
1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie um cluster gratuito
3. Configure acesso de rede (0.0.0.0/0 para desenvolvimento)
4. Obtenha a string de conexão
5. Atualize MONGODB_URI no .env

### 4. Executar o Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração do MongoDB
├── middleware/
│   ├── auth.js              # Autenticação JWT
│   └── errorHandler.js      # Tratamento de erros
├── models/
│   ├── User.js              # Model de usuário
│   ├── Job.js               # Model de vaga
│   └── Application.js       # Model de candidatura
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── users.js             # Rotas de usuários
│   ├── jobs.js              # Rotas de vagas
│   └── applications.js      # Rotas de candidaturas
├── uploads/                 # Arquivos enviados
├── server.js                # Servidor principal
├── package.json             # Dependências
└── README.md               # Este arquivo
```

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/verify-token` - Verificar token

### Usuários
- `GET /api/users/profile/:id` - Obter perfil
- `PUT /api/users/profile/:id` - Atualizar perfil
- `GET /api/users` - Listar usuários (admin)
- `PUT /api/users/:id/status` - Ativar/desativar (admin)
- `DELETE /api/users/:id` - Excluir usuário (admin)
- `POST /api/users/change-password` - Alterar senha

### Vagas
- `GET /api/jobs` - Listar vagas (público)
- `GET /api/jobs/:id` - Obter vaga por ID
- `POST /api/jobs` - Criar vaga (empresa)
- `PUT /api/jobs/:id` - Atualizar vaga (empresa)
- `DELETE /api/jobs/:id` - Excluir vaga (empresa/admin)
- `GET /api/jobs/company/:companyId` - Vagas da empresa
- `PATCH /api/jobs/:id/status` - Alterar status (empresa)

### Candidaturas
- `POST /api/applications` - Candidatar-se (candidato)
- `GET /api/applications/my` - Minhas candidaturas (candidato)
- `GET /api/applications/job/:jobId` - Candidatos da vaga (empresa)
- `PUT /api/applications/:id/status` - Atualizar status (empresa)
- `GET /api/applications/:id` - Detalhes da candidatura
- `DELETE /api/applications/:id` - Cancelar candidatura (candidato)
- `GET /api/applications/company/stats` - Estatísticas (empresa)

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Para endpoints protegidos, inclua o token no header:

```
Authorization: Bearer seu_jwt_token_aqui
```

## 👥 Tipos de Usuário

1. **Candidato**: Pode buscar vagas, se candidatar e gerenciar perfil
2. **Empresa**: Pode criar vagas, gerenciar candidatos e visualizar estatísticas
3. **Admin**: Acesso total ao sistema, pode gerenciar usuários e vagas

## 🧪 Testando a API

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "123456",
    "userType": "candidato"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "123456",
    "userType": "candidato"
  }'
```

## 🔧 Solução de Problemas

### Erro de Conexão MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no .env
- Para Atlas, verifique as configurações de rede

### Erro de Autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme se o token está sendo enviado no header correto

### Erro de CORS
- Verifique se FRONTEND_URL está correto no .env
- Para desenvolvimento, use: `http://localhost:5500`

## 📚 Próximos Passos

1. **Integrar com Frontend**: Conectar as APIs com o frontend existente
2. **Upload de Arquivos**: Implementar upload de currículos e fotos
3. **Sistema de E-mail**: Configurar envio de notificações
4. **Testes**: Implementar testes automatizados
5. **Deploy**: Configurar para produção

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente de produção
2. Use um serviço como Heroku, Railway ou DigitalOcean
3. Configure MongoDB Atlas para produção
4. Implemente HTTPS e configurações de segurança adicionais
