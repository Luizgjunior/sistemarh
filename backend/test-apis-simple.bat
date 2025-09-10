@echo off
echo ========================================
echo 🚀 Testando APIs do RH Pro
echo ========================================
echo.

echo 1. Testando Health Check...
curl -s http://localhost:3000/api/health
echo.
echo.

echo 2. Registrando Usuario Candidato...
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"João Silva\",\"email\":\"joao.teste@email.com\",\"password\":\"123456\",\"userType\":\"candidato\"}"
echo.
echo.

echo 3. Login Admin...
curl -s -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@rhpro.com\",\"password\":\"admin123\",\"userType\":\"admin\"}"
echo.
echo.

echo 4. Registrando Empresa...
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"TechCorp Ltda\",\"email\":\"contato.teste@techcorp.com\",\"password\":\"123456\",\"userType\":\"empresa\",\"companyInfo\":{\"cnpj\":\"12.345.678/0001-90\",\"description\":\"Empresa de tecnologia\"}}"
echo.
echo.

echo 5. Listando Vagas...
curl -s http://localhost:3000/api/jobs
echo.
echo.

echo ========================================
echo ✅ Testes concluidos!
echo ========================================
pause
