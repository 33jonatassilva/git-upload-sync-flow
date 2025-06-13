
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const Database = require('better-sqlite3');

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

// Configuração do banco SQLite
const DATABASE_FILE = path.join(__dirname, '..', 'database', 'app.sqlite');
let db;

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

// Inicializar banco SQLite
async function initializeDatabase() {
  try {
    await ensureDatabaseDir();
    
    db = new Database(DATABASE_FILE);
    db.pragma('foreign_keys = ON');
    
    // Criar tabelas
    createTables();
    
    // Inserir dados iniciais
    insertInitialData();
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    process.exit(1);
  }
}

// Criar tabelas
function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organization_id TEXT NOT NULL,
      manager_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      organization_id TEXT NOT NULL,
      team_id TEXT,
      manager_id TEXT,
      subordinates TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      status TEXT NOT NULL,
      condition TEXT NOT NULL,
      value REAL NOT NULL,
      purchase_date TEXT NOT NULL,
      assigned_to TEXT,
      organization_id TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES people (id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      expiration_date TEXT NOT NULL,
      total_quantity INTEGER NOT NULL,
      used_quantity INTEGER DEFAULT 0,
      cost REAL,
      vendor TEXT,
      organization_id TEXT NOT NULL,
      assigned_to TEXT DEFAULT '[]',
      license_code TEXT,
      individual_codes TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      min_quantity INTEGER NOT NULL,
      location TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      cost_per_unit REAL NOT NULL,
      supplier TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    )`
  ];
  
  tables.forEach(sql => {
    db.exec(sql);
  });
}

// Inserir dados iniciais
function insertInitialData() {
  const countOrgs = db.prepare('SELECT COUNT(*) as count FROM organizations').get();
  
  if (countOrgs.count === 0) {
    const now = new Date().toISOString();
    
    const insertOrg = db.prepare(`
      INSERT INTO organizations (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertOrg.run('1', 'Organização Principal', 'Organização padrão do sistema', now, now);
    
    const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, description, organization_id, manager_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertTeam.run('1', 'Desenvolvimento', 'Time de desenvolvimento de software', '1', null, now, now);
    
    console.log('Initial data inserted into SQLite database');
  }
}

// Rotas da API para cada tabela
const tables = ['organizations', 'teams', 'people', 'assets', 'licenses', 'inventory'];

tables.forEach(table => {
  // GET - obter todos os registros da tabela
  app.get(`/api/database/${table}`, (req, res) => {
    try {
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      const rows = stmt.all();
      res.json(rows);
    } catch (error) {
      console.error(`Error reading ${table}:`, error);
      res.status(500).json({ error: `Failed to read ${table}` });
    }
  });
  
  // POST - salvar dados na tabela (substitui todos os dados)
  app.post(`/api/database/${table}`, async (req, res) => {
    try {
      const data = req.body;
      
      if (!Array.isArray(data)) {
        return res.status(400).json({ error: 'Data must be an array' });
      }
      
      // Limpar tabela
      db.prepare(`DELETE FROM ${table}`).run();
      
      // Inserir novos dados
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
        
        const transaction = db.transaction((records) => {
          for (const record of records) {
            const values = columns.map(col => record[col]);
            stmt.run(...values);
          }
        });
        
        transaction(data);
      }
      
      res.json({ success: true, message: `${table} updated successfully` });
    } catch (error) {
      console.error(`Error saving ${table}:`, error);
      res.status(500).json({ error: `Failed to save ${table}` });
    }
  });
});

// Rota para obter dados completos do banco
app.get('/api/database', (req, res) => {
  try {
    const result = {};
    tables.forEach(table => {
      const stmt = db.prepare(`SELECT * FROM ${table}`);
      result[table] = stmt.all();
    });
    res.json(result);
  } catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ error: 'Failed to read database' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    host: '0.0.0.0',
    database: 'SQLite'
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
