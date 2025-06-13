
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Headers CORS para acesso externo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Servir arquivos estáticos
app.use(express.static('dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Caminho para o arquivo de banco de dados
const DATABASE_FILE = path.join(__dirname, '..', 'database', 'data.json');

// Garantir que o diretório database existe
async function ensureDatabaseDir() {
  const databaseDir = path.dirname(DATABASE_FILE);
  try {
    await fs.access(databaseDir);
    console.log('Database directory exists');
  } catch {
    console.log('Creating database directory...');
    await fs.mkdir(databaseDir, { recursive: true });
  }
}

// Função para ler dados do arquivo
async function readDatabase() {
  try {
    await ensureDatabaseDir();
    const data = await fs.readFile(DATABASE_FILE, 'utf8');
    const parsedData = JSON.parse(data);
    console.log('Database read successfully, keys:', Object.keys(parsedData));
    return parsedData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Database file not found, returning empty data');
      return {};
    } else {
      console.error('Error reading database:', error);
      return {};
    }
  }
}

// Função para escrever dados no arquivo
async function writeDatabase(data) {
  try {
    await ensureDatabaseDir();
    await fs.writeFile(DATABASE_FILE, JSON.stringify(data, null, 2));
    console.log('Database written successfully, keys:', Object.keys(data));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Inicializar database na inicialização do servidor
async function initializeDatabase() {
  try {
    const data = await readDatabase();
    if (!data || Object.keys(data).length === 0) {
      console.log('Initializing database with default data...');
      const initialData = {
        organizations: [
          {
            id: '1',
            name: 'Organização Principal',
            description: 'Organização padrão do sistema',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        teams: [
          {
            id: '1',
            name: 'Desenvolvimento',
            description: 'Time de desenvolvimento de software',
            organization_id: '1',
            manager_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        people: [],
        assets: [],
        licenses: [],
        inventory: []
      };
      
      const success = await writeDatabase(initialData);
      if (success) {
        console.log('Database initialized with default data');
      } else {
        console.error('Failed to initialize database');
      }
    } else {
      console.log('Database already exists with data');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Rotas da API
app.get('/api/database', async (req, res) => {
  try {
    const data = await readDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ error: 'Failed to read database' });
  }
});

app.post('/api/database', async (req, res) => {
  try {
    console.log('Received data to save:', Object.keys(req.body));
    const success = await writeDatabase(req.body);
    if (success) {
      res.json({ success: true, message: 'Database saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save database' });
    }
  } catch (error) {
    console.error('Error saving database:', error);
    res.status(500).json({ error: 'Failed to save database' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    host: '0.0.0.0'
  });
});

// Rota para servir a aplicação React (SPA) - deve vir por último
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Inicializar database e iniciar servidor
initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database file: ${DATABASE_FILE}`);
    console.log(`Access from external: http://[VM_IP]:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
