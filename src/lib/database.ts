
// Simulação de banco de dados usando localStorage para compatibilidade com browser
interface DatabaseRow {
  [key: string]: any;
}

interface TableData {
  [tableName: string]: DatabaseRow[];
}

class MockDatabase {
  private storageKey = 'app_database';

  private getData(): TableData {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveData(data: TableData): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private ensureTable(tableName: string): void {
    const data = this.getData();
    if (!data[tableName]) {
      data[tableName] = [];
      this.saveData(data);
    }
  }

  prepare(sql: string) {
    return {
      all: (tableName: string, ...params: any[]) => {
        this.ensureTable(tableName);
        const data = this.getData();
        return data[tableName] || [];
      },
      get: (tableName: string, ...params: any[]) => {
        this.ensureTable(tableName);
        const data = this.getData();
        const rows = data[tableName] || [];
        return rows.length > 0 ? rows[0] : null;
      },
      run: (tableName: string, ...params: any[]) => {
        this.ensureTable(tableName);
        // Para INSERT, UPDATE, DELETE - implementação básica
        const data = this.getData();
        if (!data[tableName]) {
          data[tableName] = [];
        }
        this.saveData(data);
        return { changes: 1 };
      }
    };
  }

  exec(sql: string): void {
    // Implementação básica para CREATE TABLE statements
    console.log('Executing SQL:', sql);
  }

  pragma(statement: string): void {
    console.log('Pragma:', statement);
  }
}

export const db = new MockDatabase();

export const initDatabase = () => {
  // Inicializar dados de exemplo se não existirem
  const data = localStorage.getItem('app_database');
  if (!data) {
    const initialData: TableData = {
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
    
    localStorage.setItem('app_database', JSON.stringify(initialData));
  }
  
  console.log('Database initialized successfully');
};

export default db;
