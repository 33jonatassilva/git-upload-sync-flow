
import { db } from '@/lib/database';

export interface DatabaseExport {
  organizations: any[];
  teams: any[];
  people: any[];
  assets: any[];
  licenses: any[];
  inventory: any[];
  exportDate: string;
  version: string;
}

export const configService = {
  exportDatabase: async (): Promise<DatabaseExport> => {
    const organizations = await db.getTableData('organizations');
    const teams = await db.getTableData('teams');
    const people = await db.getTableData('people');
    const assets = await db.getTableData('assets');
    const licenses = await db.getTableData('licenses');
    const inventory = await db.getTableData('inventory');
    
    return {
      organizations: organizations || [],
      teams: teams || [],
      people: people || [],
      assets: assets || [],
      licenses: licenses || [],
      inventory: inventory || [],
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  },

  importDatabase: async (importData: DatabaseExport): Promise<boolean> => {
    try {
      // Validar estrutura básica
      if (!importData.organizations || !Array.isArray(importData.organizations)) {
        throw new Error('Formato inválido: organizations deve ser um array');
      }
      
      if (!importData.teams || !Array.isArray(importData.teams)) {
        throw new Error('Formato inválido: teams deve ser um array');
      }
      
      if (!importData.people || !Array.isArray(importData.people)) {
        throw new Error('Formato inválido: people deve ser um array');
      }
      
      if (!importData.assets || !Array.isArray(importData.assets)) {
        throw new Error('Formato inválido: assets deve ser um array');
      }
      
      if (!importData.licenses || !Array.isArray(importData.licenses)) {
        throw new Error('Formato inválido: licenses deve ser um array');
      }
      
      if (!importData.inventory || !Array.isArray(importData.inventory)) {
        throw new Error('Formato inválido: inventory deve ser um array');
      }

      // Fazer backup dos dados atuais
      const currentData = await configService.exportDatabase();
      localStorage.setItem('app_database_backup', JSON.stringify(currentData));
      
      // Importar novos dados
      await db.saveTableData('organizations', importData.organizations);
      await db.saveTableData('teams', importData.teams);
      await db.saveTableData('people', importData.people);
      await db.saveTableData('assets', importData.assets);
      await db.saveTableData('licenses', importData.licenses);
      await db.saveTableData('inventory', importData.inventory);
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  },

  restoreBackup: async (): Promise<boolean> => {
    try {
      const backupData = localStorage.getItem('app_database_backup');
      if (!backupData) {
        throw new Error('Nenhum backup encontrado');
      }
      
      const parsedBackup = JSON.parse(backupData);
      return await configService.importDatabase(parsedBackup);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  },

  clearAllData: async (): Promise<void> => {
    // Fazer backup antes de limpar
    const currentData = await configService.exportDatabase();
    localStorage.setItem('app_database_backup', JSON.stringify(currentData));
    
    // Limpar dados
    await db.saveTableData('organizations', []);
    await db.saveTableData('teams', []);
    await db.saveTableData('people', []);
    await db.saveTableData('assets', []);
    await db.saveTableData('licenses', []);
    await db.saveTableData('inventory', []);
  },

  downloadJsonFile: (data: any, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  parseJsonFile: (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const parsedData = JSON.parse(result);
            resolve(parsedData);
          } else {
            reject(new Error('Erro ao ler o arquivo'));
          }
        } catch (error) {
          reject(new Error('Arquivo JSON inválido'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      
      reader.readAsText(file);
    });
  }
};
