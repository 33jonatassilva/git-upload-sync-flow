
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para better-sqlite3
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório de banco de dados
RUN mkdir -p database

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
