
import { getDatabase } from './sqlite';

interface DatabaseRow {
  [key: string]: any;
}

interface TableData {
  [tableName: string]: DatabaseRow[];
}

class SQLiteDatabase {
  private db: any;

  constructor() {
    // No client-side, vamos usar uma implementação de fallback
    if (typeof window !== 'undefined') {
      console.warn('SQLite not available in browser, using API fallback');
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await fetch(`/api/database${endpoint}`, {
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

  async getTableData(tableName: string): Promise<any[]> {
    try {
      const data = await this.makeRequest('GET', `/${tableName}`);
      return data || [];
    } catch (error) {
      console.error(`Error getting table data for ${tableName}:`, error);
      return [];
    }
  }

  async saveTableData(tableName: string, tableData: any[]): Promise<void> {
    try {
      await this.makeRequest('POST', `/${tableName}`, tableData);
    } catch (error) {
      console.error(`Error saving table data for ${tableName}:`, error);
      throw error;
    }
  }

  prepare(sql: string) {
    return {
      all: async (tableName: string, ...params: any[]) => {
        return await this.getTableData(tableName);
      },
      get: async (tableName: string, ...params: any[]) => {
        const data = await this.getTableData(tableName);
        return data.length > 0 ? data[0] : null;
      },
      run: async (tableName: string, ...params: any[]) => {
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
}

export const db = new SQLiteDatabase();

export const initDatabase = async () => {
  try {
    console.log('Initializing database connection...');
    
    // Testar conexão com a API
    const response = await fetch('/api/health');
    if (response.ok) {
      console.log('Database API connection established');
    } else {
      console.warn('Database API not available');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

export default db;
