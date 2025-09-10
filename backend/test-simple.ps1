Write-Host "Testando APIs do RH Pro" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

Start-Sleep -Seconds 1

Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "OK - Status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Registro Usuario..." -ForegroundColor Yellow
try {
    $userData = '{"name":"João Silva","email":"joao.teste@email.com","password":"123456","userType":"candidato"}'
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $userData -ContentType "application/json"
    Write-Host "OK - Usuario: $($response.user.name)" -ForegroundColor Green
    $userToken = $response.token
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Login Admin..." -ForegroundColor Yellow
try {
    $loginData = '{"email":"admin@rhpro.com","password":"admin123","userType":"admin"}'
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "OK - Admin: $($response.user.name)" -ForegroundColor Green
    $adminToken = $response.token
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Listagem Vagas..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/jobs" -Method GET
    Write-Host "OK - Vagas: $($response.jobs.Count)" -ForegroundColor Green
} catch {
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nResumo:" -ForegroundColor Green
Write-Host "User Token: $(if($userToken) { 'OK' } else { 'FALHA' })" -ForegroundColor $(if($userToken) { 'Green' } else { 'Red' })
Write-Host "Admin Token: $(if($adminToken) { 'OK' } else { 'FALHA' })" -ForegroundColor $(if($adminToken) { 'Green' } else { 'Red' })

Write-Host "`nTestes concluidos!" -ForegroundColor Green
