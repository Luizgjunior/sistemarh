// Teste manual das APIs com curl simulado
const { spawn } = require('child_process');

console.log('🚀 Testando APIs do RH Pro');
console.log('=========================\n');

// Função para testar Health Check
async function testHealthCheck() {
  console.log('1. 🔍 Testando Health Check...');
  
  try {
    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ OK - Status:', data.status);
      console.log('   📊 Database:', data.database);
    } else {
      console.log('   ❌ Falha - Status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();
}

// Função para testar registro
async function testRegister() {
  console.log('2. 👤 Testando Registro de Usuário...');
  
  const userData = {
    name: 'João Silva',
    email: 'joao.teste@email.com',
    password: '123456',
    userType: 'candidato'
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ OK - Usuário criado:', data.user.name);
      console.log('   🎟️  Token obtido:', data.token ? 'Sim' : 'Não');
      return data.token;
    } else {
      console.log('   ❌ Falha:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();
  return null;
}

// Função para testar login admin
async function testAdminLogin() {
  console.log('3. 🔐 Testando Login Admin...');
  
  const loginData = {
    email: 'admin@rhpro.com',
    password: 'admin123',
    userType: 'admin'
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ OK - Login realizado:', data.user.name);
      console.log('   🎟️  Token obtido:', data.token ? 'Sim' : 'Não');
      return data.token;
    } else {
      console.log('   ❌ Falha:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();
  return null;
}

// Função para testar listagem de vagas
async function testJobListing() {
  console.log('4. 📋 Testando Listagem de Vagas...');
  
  try {
    const response = await fetch('http://localhost:3000/api/jobs');
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ OK - Vagas encontradas:', data.jobs?.length || 0);
      console.log('   📊 Total:', data.total || 0);
    } else {
      console.log('   ❌ Falha:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();
}

// Função para testar criação de empresa
async function testCompanyRegister() {
  console.log('5. 🏢 Testando Registro de Empresa...');
  
  const companyData = {
    name: 'TechCorp Ltda',
    email: 'contato.teste@techcorp.com',
    password: '123456',
    userType: 'empresa',
    companyInfo: {
      cnpj: '12.345.678/0001-90',
      description: 'Empresa de tecnologia'
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companyData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ OK - Empresa criada:', data.user.name);
      console.log('   🎟️  Token obtido:', data.token ? 'Sim' : 'Não');
      return data.token;
    } else {
      console.log('   ❌ Falha:', data.message);
    }
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
  console.log();
  return null;
}

// Função principal
async function runTests() {
  // Aguardar um pouco para garantir que servidor esteja pronto
  console.log('⏳ Aguardando servidor...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  await testHealthCheck();
  
  const userToken = await testRegister();
  const adminToken = await testAdminLogin();
  const companyToken = await testCompanyRegister();
  
  await testJobListing();
  
  console.log('📋 Resumo dos Testes:');
  console.log('===================');
  console.log('🔑 User Token:', userToken ? '✅ Obtido' : '❌ Falhou');
  console.log('🔑 Admin Token:', adminToken ? '✅ Obtido' : '❌ Falhou');
  console.log('🔑 Company Token:', companyToken ? '✅ Obtido' : '❌ Falhou');
  
  if (adminToken) {
    console.log('\n💡 Você pode usar o token do admin para testar outras APIs:');
    console.log('   Authorization: Bearer', adminToken.substring(0, 20) + '...');
  }
}

// Verificar se fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Este script requer Node.js 18+ ou você pode instalar node-fetch');
  console.log('💡 Alternativa: use o arquivo test-api.http com REST Client no VS Code');
  process.exit(1);
}

runTests().catch(console.error);
