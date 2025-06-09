
# Docker Setup

## Desenvolvimento

Para rodar o projeto em desenvolvimento com Docker:

```bash
# Build e start dos containers
docker-compose -f docker-compose.dev.yml up --build

# Ou em background
docker-compose -f docker-compose.dev.yml up -d --build
```

A aplicação estará disponível em `http://localhost:8080`

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
# Ver logs
docker-compose logs -f app

# Parar containers
docker-compose down

# Limpar volumes
docker-compose down -v

# Rebuild sem cache
docker-compose build --no-cache
```

## Banco de dados

O banco SQLite será criado automaticamente em `./database/app.db` quando a aplicação for iniciada.

O banco é persistido através de um volume Docker.
