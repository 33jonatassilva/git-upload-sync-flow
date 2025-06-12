
@echo off
echo 🛠️ Iniciando ambiente de desenvolvimento...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose -f docker-compose.dev.yml down

REM Build e start dos containers de desenvolvimento
echo 🔨 Fazendo build e iniciando containers de desenvolvimento...
docker-compose -f docker-compose.dev.yml up --build

echo.
echo ✅ Ambiente de desenvolvimento iniciado!
echo 📱 Aplicação disponível em: http://localhost:8080
echo 🔄 Hot reload ativo - mudanças no código serão refletidas automaticamente
pause
