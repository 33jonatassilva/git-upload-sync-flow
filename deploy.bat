
@echo off
echo 🚀 Iniciando deploy do Infra Tools...

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Perguntar sobre limpeza de imagens antigas
set /p cleanup="Deseja limpar imagens antigas? (y/N): "
if /i "%cleanup%"=="y" (
    echo 🧹 Limpando imagens antigas...
    docker system prune -f
)

REM Build e start dos containers
echo 🔨 Fazendo build e iniciando containers...
docker-compose up --build -d

REM Verificar se os containers estão rodando
echo 🔍 Verificando status dos containers...
docker-compose ps

echo.
echo ✅ Deploy concluído!
echo 📱 Aplicação disponível em: http://localhost:8080
echo 📊 Para ver logs: docker-compose logs -f app
echo 🛑 Para parar: docker-compose down
pause
