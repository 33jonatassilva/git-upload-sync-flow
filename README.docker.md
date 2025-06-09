
# Docker Setup

## Pré-requisitos

Certifique-se de ter Docker e Docker Compose instalados:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Desenvolvimento

Para rodar o projeto em desenvolvimento com Docker:

```bash
# Build e start dos containers
docker-compose -f docker-compose.dev.yml up --build

# Ou em background
docker-compose -f docker-compose.dev.yml up -d --build
```

A aplicação estará disponível em `http://localhost:8080`

### Desenvolvimento com Hot Reload

O container de desenvolvimento está configurado com:
- Volume de código source mapeado para hot reload
- Banco SQLite persistido
- Node modules otimizados para performance

## Produção

Para rodar em produção:

```bash
# Build e start
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

## Comandos úteis

```bash
# Ver logs em tempo real
docker-compose logs -f app

# Ver logs do desenvolvimento
docker-compose -f docker-compose.dev.yml logs -f app

# Parar containers
docker-compose down

# Parar containers de desenvolvimento
docker-compose -f docker-compose.dev.yml down

# Limpar volumes (apaga dados do banco)
docker-compose down -v

# Rebuild sem cache
docker-compose build --no-cache

# Entrar no container
docker-compose exec app sh

# Instalar nova dependência (no desenvolvimento)
docker-compose -f docker-compose.dev.yml exec app npm install <package>
```

## Banco de dados

O banco SQLite será criado automaticamente em `./database/app.db` quando a aplicação for iniciada.

### Dados de exemplo

Na primeira execução, o sistema irá popular o banco com dados de exemplo:
- 2 organizações
- 3 times
- 5 pessoas
- 4 ativos
- 4 licenças
- 4 itens de inventário

### Backup do banco

```bash
# Fazer backup
docker cp $(docker-compose ps -q app):/app/database/app.db ./backup-$(date +%Y%m%d).db

# Restaurar backup
docker cp ./backup-20231201.db $(docker-compose ps -q app):/app/database/app.db
```

## Resolução de problemas

### Erro de permissão no banco
```bash
# Recriar volume do banco
docker-compose down -v
docker-compose up --build
```

### Problemas com dependências
```bash
# Limpar node_modules e reinstalar
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs app

# Verificar se as portas estão livres
netstat -tulpn | grep :8080
```

## Performance

Para melhor performance em desenvolvimento:
- Use volumes nomeados para node_modules
- Configure .dockerignore para excluir arquivos desnecessários
- Use bind mounts apenas para código source

## Estrutura de volumes

```
./database/     -> /app/database/     (banco SQLite)
./src/         -> /app/src/           (código fonte)
./public/      -> /app/public/        (arquivos estáticos)
```

```
