
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/database';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  location: string;
  organizationId: string;
}

export interface CreateInventoryItemData {
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  location: string;
  organizationId: string;
}

export interface UpdateInventoryItemData {
  name?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  supplier?: string;
  location?: string;
}

export const inventoryService = {
  getAll: async (organizationId: string): Promise<InventoryItem[]> => {
    const inventory = await db.getTableData('inventory');
    
    return inventory
      .filter(item => item.organization_id === organizationId)
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalValue: item.quantity * item.unit_price,
        supplier: item.supplier,
        location: item.location,
        organizationId: item.organization_id
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<InventoryItem | null> => {
    const inventory = await db.getTableData('inventory');
    const item = inventory.find(i => i.id === id);
    
    if (!item) return null;
    
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalValue: item.quantity * item.unit_price,
      supplier: item.supplier,
      location: item.location,
      organizationId: item.organization_id
    };
  },

  create: async (data: CreateInventoryItemData): Promise<InventoryItem> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const inventory = await db.getTableData('inventory');
    
    const newItem = {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit_price: data.unitPrice,
      supplier: data.supplier,
      location: data.location,
      organization_id: data.organizationId,
      created_at: now,
      updated_at: now
    };
    
    inventory.push(newItem);
    await db.saveTableData('inventory', inventory);
    
    return {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalValue: data.quantity * data.unitPrice,
      supplier: data.supplier,
      location: data.location,
      organizationId: data.organizationId
    };
  },

  update: async (id: string, data: UpdateInventoryItemData): Promise<void> => {
    const inventory = await db.getTableData('inventory');
    const itemIndex = inventory.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    const now = new Date().toISOString();
    const item = inventory[itemIndex];
    
    if (data.name !== undefined) item.name = data.name;
    if (data.category !== undefined) item.category = data.category;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.unitPrice !== undefined) item.unit_price = data.unitPrice;
    if (data.supplier !== undefined) item.supplier = data.supplier;
    if (data.location !== undefined) item.location = data.location;
    item.updated_at = now;
    
    inventory[itemIndex] = item;
    await db.saveTableData('inventory', inventory);
  },

  delete: async (id: string): Promise<void> => {
    const inventory = await db.getTableData('inventory');
    const filteredInventory = inventory.filter(i => i.id !== id);
    await db.saveTableData('inventory', filteredInventory);
  }
};
