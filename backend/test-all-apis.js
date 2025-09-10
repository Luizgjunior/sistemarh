// Script completo para testar todas as APIs
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let userToken = '';
let companyToken = '';
let adminToken = '';
let jobId = '';

// Função para fazer requests HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Função de delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Testar Health Check
async function testHealthCheck() {
  console.log('\n🔍 Testando Health Check...');
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Health Check - OK');
      console.log('📊 Status:', response.data.status);
      console.log('🗄️  Database:', response.data.database);
    } else {
      console.log('❌ Health Check - Falhou');
      console.log('Status:', response.statusCode);
    }
  } catch (error) {
    console.log('❌ Erro no Health Check:', error.message);
  }
}

// 2. Testar Registro de Usuários
async function testUserRegistration() {
  console.log('\n👤 Testando Registro de Usuários...');

  // Registrar candidato
  try {
    const candidateData = {
      name: 'João Silva',
      email: 'joao@teste.com',
      password: '123456',
      userType: 'candidato',
      candidateInfo: {
        phone: '(11) 99999-9999'
      }
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, candidateData);
    
    if (response.statusCode === 201) {
      console.log('✅ Registro Candidato - OK');
      userToken = response.data.token;
    } else {
      console.log('❌ Registro Candidato - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro no registro candidato:', error.message);
  }

  // Registrar empresa
  try {
    const companyData = {
      name: 'TechCorp Ltda',
      email: 'contato@techcorp.com',
      password: '123456',
      userType: 'empresa',
      companyInfo: {
        cnpj: '12.345.678/0001-90',
        description: 'Empresa de tecnologia'
      }
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, companyData);
    
    if (response.statusCode === 201) {
      console.log('✅ Registro Empresa - OK');
      companyToken = response.data.token;
    } else {
      console.log('❌ Registro Empresa - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro no registro empresa:', error.message);
  }
}

// 3. Testar Login
async function testLogin() {
  console.log('\n🔐 Testando Login...');

  try {
    const loginData = {
      email: 'admin@rhpro.com',
      password: 'admin123',
      userType: 'admin'
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, loginData);
    
    if (response.statusCode === 200) {
      console.log('✅ Login Admin - OK');
      adminToken = response.data.token;
    } else {
      console.log('❌ Login Admin - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro no login:', error.message);
  }
}

// 4. Testar Verificação de Token
async function testTokenVerification() {
  console.log('\n🎟️  Testando Verificação de Token...');

  if (!adminToken) {
    console.log('❌ Sem token para testar');
    return;
  }

  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Verificação Token - OK');
      console.log('👤 Usuário:', response.data.user.name);
    } else {
      console.log('❌ Verificação Token - Falhou');
    }
  } catch (error) {
    console.log('❌ Erro na verificação:', error.message);
  }
}

// 5. Testar Criação de Vaga
async function testJobCreation() {
  console.log('\n💼 Testando Criação de Vaga...');

  if (!companyToken) {
    console.log('❌ Sem token de empresa para testar');
    return;
  }

  try {
    const jobData = {
      title: 'Desenvolvedor Frontend',
      description: 'Vaga para desenvolvedor frontend com experiência em React. Trabalhar em projetos inovadores com tecnologias modernas. Desenvolver interfaces responsivas e user-friendly.',
      requirements: 'Experiência com React, TypeScript, HTML, CSS. Conhecimento em Git e metodologias ágeis é desejável. Experiência mínima de 2 anos.',
      location: 'São Paulo, SP',
      work_mode: 'hibrido',
      contract_type: 'clt',
      experience_level: 'pleno',
      category: 'tecnologia',
      salary_min: 8000,
      salary_max: 12000,
      benefits: ['Vale Refeição', 'Plano de Saúde', 'Home Office'],
      skills: ['React', 'TypeScript', 'JavaScript']
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${companyToken}`
      }
    };

    const response = await makeRequest(options, jobData);
    
    if (response.statusCode === 201) {
      console.log('✅ Criação Vaga - OK');
      console.log('🆔 Job ID:', response.data.job.id);
      jobId = response.data.job.id;
    } else {
      console.log('❌ Criação Vaga - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro na criação de vaga:', error.message);
  }
}

// 6. Testar Listagem de Vagas
async function testJobListing() {
  console.log('\n📋 Testando Listagem de Vagas...');

  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs?page=1&limit=5',
      method: 'GET'
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Listagem Vagas - OK');
      console.log('📊 Total:', response.data.total);
      console.log('📄 Páginas:', response.data.pages);
      console.log('💼 Vagas encontradas:', response.data.jobs.length);
    } else {
      console.log('❌ Listagem Vagas - Falhou');
    }
  } catch (error) {
    console.log('❌ Erro na listagem:', error.message);
  }
}

// 7. Testar Candidatura
async function testJobApplication() {
  console.log('\n📝 Testando Candidatura...');

  if (!userToken || !jobId) {
    console.log('❌ Sem token de usuário ou job ID para testar');
    return;
  }

  try {
    const applicationData = {
      jobId: jobId,
      cover_letter: 'Sou um desenvolvedor apaixonado por tecnologia e gostaria muito de fazer parte da equipe.'
    };

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/applications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    };

    const response = await makeRequest(options, applicationData);
    
    if (response.statusCode === 201) {
      console.log('✅ Candidatura - OK');
      console.log('📋 Status:', response.data.application.status);
    } else {
      console.log('❌ Candidatura - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro na candidatura:', error.message);
  }
}

// 8. Testar Listagem de Usuários (Admin)
async function testUserListing() {
  console.log('\n👥 Testando Listagem de Usuários (Admin)...');

  if (!adminToken) {
    console.log('❌ Sem token de admin para testar');
    return;
  }

  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/users?page=1&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    };

    const response = await makeRequest(options);
    
    if (response.statusCode === 200) {
      console.log('✅ Listagem Usuários - OK');
      console.log('👤 Total usuários:', response.data.total);
    } else {
      console.log('❌ Listagem Usuários - Falhou');
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Erro na listagem de usuários:', error.message);
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando Testes das APIs do RH Pro');
  console.log('======================================');

  // Aguardar servidor inicializar
  console.log('⏳ Aguardando servidor inicializar...');
  await delay(3000);

  await testHealthCheck();
  await delay(1000);

  await testUserRegistration();
  await delay(1000);

  await testLogin();
  await delay(1000);

  await testTokenVerification();
  await delay(1000);

  await testJobCreation();
  await delay(1000);

  await testJobListing();
  await delay(1000);

  await testJobApplication();
  await delay(1000);

  await testUserListing();

  console.log('\n✅ Testes concluídos!');
  console.log('======================================');
  
  // Mostrar resumo dos tokens obtidos
  console.log('\n📋 Resumo dos Tokens:');
  console.log('🔑 User Token:', userToken ? 'Obtido' : 'Não obtido');
  console.log('🔑 Company Token:', companyToken ? 'Obtido' : 'Não obtido');
  console.log('🔑 Admin Token:', adminToken ? 'Obtido' : 'Não obtido');
  console.log('💼 Job ID:', jobId || 'Não criado');
}

// Executar testes
runAllTests().catch(console.error);
