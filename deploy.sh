
#!/bin/bash

echo "🚀 Iniciando deploy do Infra Tools..."

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Limpar imagens antigas (opcional)
read -p "Deseja limpar imagens antigas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpando imagens antigas..."
    docker system prune -f
fi

# Build e start dos containers
echo "🔨 Fazendo build e iniciando containers..."
docker-compose up --build -d

# Verificar se os containers estão rodando
echo "🔍 Verificando status dos containers..."
docker-compose ps

echo "✅ Deploy concluído!"
echo "📱 Aplicação disponível em: http://localhost:8080"
echo "📊 Para ver logs: docker-compose logs -f app"
echo "🛑 Para parar: docker-compose down"
