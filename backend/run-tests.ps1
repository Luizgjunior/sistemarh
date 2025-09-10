# Script PowerShell para executar testes das APIs
Write-Host "🚀 Executando Testes das APIs RH Pro" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Aguardar um pouco
Start-Sleep -Seconds 2

Write-Host "`n1. 🔍 Testando Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ OK - Status: $($response.status)" -ForegroundColor Green
    Write-Host "   📊 Database: $($response.database)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. 👤 Testando Registro de Usuário..." -ForegroundColor Yellow
try {
    $userData = @{
        name = "João Silva"
        email = "joao.teste@email.com"
        password = "123456"
        userType = "candidato"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $userData -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ OK - Usuário criado: $($response.user.name)" -ForegroundColor Green
    $userToken = $response.token
    Write-Host "   🎟️  Token obtido: $(if($userToken) { 'Sim' } else { 'Não' })" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. 🔐 Testando Login Admin..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@rhpro.com"
        password = "admin123"
        userType = "admin"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ OK - Login realizado: $($response.user.name)" -ForegroundColor Green
    $adminToken = $response.token
    Write-Host "   🎟️  Token obtido: $(if($adminToken) { 'Sim' } else { 'Não' })" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. 🏢 Testando Registro de Empresa..." -ForegroundColor Yellow
try {
    $companyData = @{
        name = "TechCorp Ltda"
        email = "contato.teste@techcorp.com"
        password = "123456"
        userType = "empresa"
        companyInfo = @{
            cnpj = "12.345.678/0001-90"
            description = "Empresa de tecnologia"
        }
    } | ConvertTo-Json -Depth 3

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $companyData -ContentType "application/json" -ErrorAction Stop
    Write-Host "   ✅ OK - Empresa criada: $($response.user.name)" -ForegroundColor Green
    $companyToken = $response.token
    Write-Host "   🎟️  Token obtido: $(if($companyToken) { 'Sim' } else { 'Não' })" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. 💼 Testando Criação de Vaga..." -ForegroundColor Yellow
if ($companyToken) {
    try {
        $jobData = @{
            title = "Desenvolvedor Frontend"
            description = "Vaga para desenvolvedor frontend com experiência em React. Trabalhar em projetos inovadores com tecnologias modernas. Desenvolver interfaces responsivas e user-friendly."
            requirements = "Experiência com React, TypeScript, HTML, CSS. Conhecimento em Git e metodologias ágeis é desejável. Experiência mínima de 2 anos."
            location = "São Paulo, SP"
            work_mode = "hibrido"
            contract_type = "clt"
            experience_level = "pleno"
            category = "tecnologia"
            salary_min = 8000
            salary_max = 12000
            benefits = @("Vale Refeição", "Plano de Saúde", "Home Office")
            skills = @("React", "TypeScript", "JavaScript")
        } | ConvertTo-Json -Depth 3

        $headers = @{
            "Authorization" = "Bearer $companyToken"
            "Content-Type" = "application/json"
        }

        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method POST -Body $jobData -Headers $headers -ErrorAction Stop
        Write-Host "   ✅ OK - Vaga criada: $($response.job.title)" -ForegroundColor Green
        $jobId = $response.job.id
        Write-Host "   🆔 Job ID: $jobId" -ForegroundColor Cyan
    } catch {
        Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Sem token de empresa" -ForegroundColor Red
}

Write-Host "`n6. 📋 Testando Listagem de Vagas..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method GET -ErrorAction Stop
    Write-Host "   ✅ OK - Vagas encontradas: $($response.jobs.Count)" -ForegroundColor Green
    Write-Host "   📊 Total: $($response.total)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n7. 📝 Testando Candidatura..." -ForegroundColor Yellow
if ($userToken -and $jobId) {
    try {
        $applicationData = @{
            jobId = $jobId
            cover_letter = "Sou um desenvolvedor apaixonado por tecnologia e gostaria muito de fazer parte da equipe."
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $userToken"
            "Content-Type" = "application/json"
        }

        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/applications" -Method POST -Body $applicationData -Headers $headers -ErrorAction Stop
        Write-Host "   ✅ OK - Candidatura realizada" -ForegroundColor Green
        Write-Host "   📋 Status: $($response.application.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "   ❌ Falha: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Sem token de usuário ou job ID" -ForegroundColor Red
}

# Resumo
Write-Host "`n📋 Resumo dos Testes:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "🔑 User Token: $(if($userToken) { '✅ Obtido' } else { '❌ Falhou' })" -ForegroundColor $(if($userToken) { 'Green' } else { 'Red' })
Write-Host "🔑 Admin Token: $(if($adminToken) { '✅ Obtido' } else { '❌ Falhou' })" -ForegroundColor $(if($adminToken) { 'Green' } else { 'Red' })
Write-Host "🔑 Company Token: $(if($companyToken) { '✅ Obtido' } else { '❌ Falhou' })" -ForegroundColor $(if($companyToken) { 'Green' } else { 'Red' })
Write-Host "💼 Job ID: $(if($jobId) { '✅ Criado' } else { '❌ Falhou' })" -ForegroundColor $(if($jobId) { 'Green' } else { 'Red' })

if ($adminToken) {
    Write-Host "`n💡 Token do admin para testes adicionais:" -ForegroundColor Yellow
    Write-Host "   $($adminToken.Substring(0, [Math]::Min(50, $adminToken.Length)))..." -ForegroundColor Cyan
}

Write-Host "`n✅ Testes concluídos!" -ForegroundColor Green
