
import { db } from '@/lib/database';
import { InventoryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateInventoryItemData {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  costPerUnit: number;
  supplier: string;
  organizationId: string;
}

export interface UpdateInventoryItemData {
  name?: string;
  category?: string;
  quantity?: number;
  minQuantity?: number;
  location?: string;
  costPerUnit?: number;
  supplier?: string;
}

// Helper para acessar dados do localStorage
const getTableData = (tableName: string): any[] => {
  const data = localStorage.getItem('app_database');
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed[tableName] || [];
};

const saveTableData = (tableName: string, tableData: any[]): void => {
  const data = localStorage.getItem('app_database');
  const parsed = data ? JSON.parse(data) : {};
  parsed[tableName] = tableData;
  localStorage.setItem('app_database', JSON.stringify(parsed));
};

export const inventoryService = {
  getAll: (organizationId: string): InventoryItem[] => {
    const inventory = getTableData('inventory');
    
    return inventory
      .filter(item => item.organization_id === organizationId)
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.min_quantity,
        location: item.location,
        costPerUnit: item.cost_per_unit,
        supplier: item.supplier,
        organizationId: item.organization_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getById: (id: string): InventoryItem | null => {
    const inventory = getTableData('inventory');
    const item = inventory.find(i => i.id === id);
    
    if (!item) return null;
    
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.min_quantity,
      location: item.location,
      costPerUnit: item.cost_per_unit,
      supplier: item.supplier,
      organizationId: item.organization_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  create: (data: CreateInventoryItemData): InventoryItem => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const inventory = getTableData('inventory');
    const newItem = {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      min_quantity: data.minQuantity,
      location: data.location,
      cost_per_unit: data.costPerUnit,
      supplier: data.supplier,
      organization_id: data.organizationId,
      created_at: now,
      updated_at: now
    };
    
    inventory.push(newItem);
    saveTableData('inventory', inventory);
    
    return {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      minQuantity: data.minQuantity,
      location: data.location,
      costPerUnit: data.costPerUnit,
      supplier: data.supplier,
      organizationId: data.organizationId,
      createdAt: now,
      updatedAt: now
    };
  },

  update: (id: string, data: UpdateInventoryItemData): void => {
    const inventory = getTableData('inventory');
    const itemIndex = inventory.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    const now = new Date().toISOString();
    const item = inventory[itemIndex];
    
    if (data.name !== undefined) item.name = data.name;
    if (data.category !== undefined) item.category = data.category;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.minQuantity !== undefined) item.min_quantity = data.minQuantity;
    if (data.location !== undefined) item.location = data.location;
    if (data.costPerUnit !== undefined) item.cost_per_unit = data.costPerUnit;
    if (data.supplier !== undefined) item.supplier = data.supplier;
    item.updated_at = now;
    
    inventory[itemIndex] = item;
    saveTableData('inventory', inventory);
  },

  delete: (id: string): void => {
    const inventory = getTableData('inventory');
    const filteredInventory = inventory.filter(i => i.id !== id);
    saveTableData('inventory', filteredInventory);
  },

  getLowStock: (organizationId: string): InventoryItem[] => {
    return inventoryService.getAll(organizationId)
      .filter(item => item.quantity <= item.minQuantity);
  },

  updateQuantity: (id: string, quantity: number): void => {
    const inventory = getTableData('inventory');
    const itemIndex = inventory.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    const item = inventory[itemIndex];
    item.quantity = quantity;
    item.updated_at = new Date().toISOString();
    
    inventory[itemIndex] = item;
    saveTableData('inventory', inventory);
  }
};
