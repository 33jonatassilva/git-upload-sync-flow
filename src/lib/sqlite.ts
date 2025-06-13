
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', '..', 'database', 'app.sqlite');

// Criar instância do banco
let db: Database.Database;

// Função para inicializar o banco de dados
export const initDatabase = () => {
  try {
    db = new Database(dbPath);
    
    // Habilitar foreign keys
    db.pragma('foreign_keys = ON');
    
    // Criar tabelas se não existirem
    createTables();
    
    // Inserir dados iniciais se necessário
    insertInitialData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Função para criar as tabelas
const createTables = () => {
  const createOrganizationsTable = `
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  const createTeamsTable = `
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organization_id TEXT NOT NULL,
      manager_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
  `;

  const createPeopleTable = `
    CREATE TABLE IF NOT EXISTS people (
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
    )
  `;

  const createAssetsTable = `
    CREATE TABLE IF NOT EXISTS assets (
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
    )
  `;

  const createLicensesTable = `
    CREATE TABLE IF NOT EXISTS licenses (
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
    )
  `;

  const createInventoryTable = `
    CREATE TABLE IF NOT EXISTS inventory (
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
    )
  `;

  db.exec(createOrganizationsTable);
  db.exec(createTeamsTable);
  db.exec(createPeopleTable);
  db.exec(createAssetsTable);
  db.exec(createLicensesTable);
  db.exec(createInventoryTable);
};

// Função para inserir dados iniciais
const insertInitialData = () => {
  const countOrgs = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as { count: number };
  
  if (countOrgs.count === 0) {
    const now = new Date().toISOString();
    
    // Inserir organização inicial
    const insertOrg = db.prepare(`
      INSERT INTO organizations (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertOrg.run('1', 'Organização Principal', 'Organização padrão do sistema', now, now);
    
    // Inserir time inicial
    const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, description, organization_id, manager_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertTeam.run('1', 'Desenvolvimento', 'Time de desenvolvimento de software', '1', null, now, now);
    
    console.log('Initial data inserted');
  }
};

// Exportar instância do banco
export const getDatabase = () => {
  if (!db) {
    initDatabase();
  }
  return db;
};

export default getDatabase;
