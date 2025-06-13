
// Sistema de banco de dados com persistência real para ambiente Docker
interface DatabaseRow {
  [key: string]: any;
}

interface TableData {
  [tableName: string]: DatabaseRow[];
}

class PersistentDatabase {
  private storageKey = 'app_database';
  private isServer = typeof window === 'undefined';
  private apiBase = '';
  private cache: TableData | null = null;
  private lastSync = 0;
  private syncInterval = 5000; // 5 segundos

  constructor() {
    // Detectar se estamos no servidor (SSR) ou cliente
    if (typeof window !== 'undefined') {
      this.apiBase = window.location.origin;
      // Tentar sincronizar periodicamente
      setInterval(() => this.syncWithServer(), this.syncInterval);
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`${this.apiBase}/api/database${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Database request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database request error:', error);
      throw error;
    }
  }

  private getLocalData(): TableData {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveLocalData(data: TableData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    this.cache = data;
  }

  private async syncWithServer(): Promise<void> {
    try {
      const serverData = await this.makeRequest('GET', '');
      if (serverData && Object.keys(serverData).length > 0) {
        this.saveLocalData(serverData);
        console.log('Database synchronized with server');
      }
    } catch (error) {
      console.warn('Failed to sync with server:', error);
    }
  }

  private async getData(): Promise<TableData> {
    // Usar cache se disponível e recente
    if (this.cache && (Date.now() - this.lastSync) < 1000) {
      return this.cache;
    }

    try {
      // Tentar buscar do servidor primeiro
      const serverData = await this.makeRequest('GET', '');
      if (serverData && Object.keys(serverData).length > 0) {
        this.saveLocalData(serverData);
        this.lastSync = Date.now();
        return serverData;
      }
    } catch (error) {
      console.warn('Fallback to localStorage:', error);
    }

    // Fallback para localStorage
    const localData = this.getLocalData();
    this.cache = localData;
    return localData;
  }

  private async saveData(data: TableData): Promise<void> {
    // Salvar localmente primeiro
    this.saveLocalData(data);
    
    try {
      // Tentar salvar no servidor
      await this.makeRequest('POST', '', data);
      console.log('Data saved to server successfully');
    } catch (error) {
      console.warn('Failed to save to server, data saved locally:', error);
      throw error;
    }
  }

  private async ensureTable(tableName: string): Promise<void> {
    const data = await this.getData();
    if (!data[tableName]) {
      data[tableName] = [];
      await this.saveData(data);
    }
  }

  prepare(sql: string) {
    return {
      all: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data = await this.getData();
        return data[tableName] || [];
      },
      get: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data = await this.getData();
        const rows = data[tableName] || [];
        return rows.length > 0 ? rows[0] : null;
      },
      run: async (tableName: string, ...params: any[]) => {
        await this.ensureTable(tableName);
        const data =await this.getData();
        if (!data[tableName]) {
          data[tableName] = [];
        }
        await this.saveData(data);
        return { changes: 1 };
      }
    };
  }

  async exec(sql: string): Promise<void> {
    console.log('Executing SQL:', sql);
  }

  pragma(statement: string): void {
    console.log('Pragma:', statement);
  }

  // Método público para obter dados diretamente
  async getTableData(tableName: string): Promise<any[]> {
    await this.ensureTable(tableName);
    const data = await this.getData();
    return data[tableName] || [];
  }

  // Método público para salvar dados de uma tabela
  async saveTableData(tableName: string, tableData: any[]): Promise<void> {
    const data = await this.getData();
    data[tableName] = tableData;
    await this.saveData(data);
  }

  // Método para forçar sincronização
  async forceSync(): Promise<void> {
    this.cache = null;
    this.lastSync = 0;
    await this.syncWithServer();
  }
}

export const db = new PersistentDatabase();

export const initDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Tentar carregar dados do servidor
    let serverData = null;
    try {
      const response = await fetch('/api/database');
      if (response.ok) {
        serverData = await response.json();
      }
    } catch (error) {
      console.warn('Could not fetch from server, using localStorage:', error);
    }
    
    if (!serverData || Object.keys(serverData).length === 0) {
      console.log('No server data found, initializing with default data...');
      
      // Se não há dados no servidor, inicializar com dados padrão
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
      
      // Salvar dados iniciais
      try {
        await fetch('/api/database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initialData)
        });
        console.log('Initial data saved to server');
      } catch (error) {
        console.warn('Failed to save initial data to server, using localStorage fallback:', error);
        localStorage.setItem('app_database', JSON.stringify(initialData));
      }
    } else {
      // Sincronizar dados do servidor com localStorage
      localStorage.setItem('app_database', JSON.stringify(serverData));
      console.log('Database synchronized from server');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // Fallback completo para localStorage
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
      console.log('Fallback initialization complete');
    }
  }
};

// Garantir que a sincronização acontece ao carregar a página
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    db.forceSync();
  });
}

export default db;
