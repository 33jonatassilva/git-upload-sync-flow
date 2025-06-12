FROM node:18-slim

WORKDIR /app

# Instalar dependências do sistema para better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production

# Copiar código-fonte
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p database

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
