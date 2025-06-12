
#!/bin/bash

echo "🛠️ Iniciando ambiente de desenvolvimento..."

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.dev.yml down

# Build e start dos containers de desenvolvimento
echo "🔨 Fazendo build e iniciando containers de desenvolvimento..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Ambiente de desenvolvimento iniciado!"
echo "📱 Aplicação disponível em: http://localhost:8080"
echo "🔄 Hot reload ativo - mudanças no código serão refletidas automaticamente"
