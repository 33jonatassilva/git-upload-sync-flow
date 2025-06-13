
import { InventoryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/database';

export interface CreateInventoryItemData {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location: string;
  organizationId: string;
  costPerUnit: number;
  supplier: string;
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

const getItemStatus = (quantity: number, minQuantity: number): InventoryItem['status'] => {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= minQuantity) return 'available'; // Could be 'maintenance' based on business logic
  return 'available';
};

export const inventoryService = {
  getAll: async (organizationId: string): Promise<InventoryItem[]> => {
    const items = await db.getTableData('inventory');
    
    return items
      .filter(item => item.organization_id === organizationId)
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minQuantity: item.min_quantity,
        location: item.location,
        organizationId: item.organization_id,
        costPerUnit: item.cost_per_unit,
        supplier: item.supplier,
        status: getItemStatus(item.quantity, item.min_quantity),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getById: async (id: string): Promise<InventoryItem | null> => {
    const items = await db.getTableData('inventory');
    const item = items.find(i => i.id === id);
    
    if (!item) return null;
    
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.min_quantity,
      location: item.location,
      organizationId: item.organization_id,
      costPerUnit: item.cost_per_unit,
      supplier: item.supplier,
      status: getItemStatus(item.quantity, item.min_quantity),
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  },

  create: async (data: CreateInventoryItemData): Promise<InventoryItem> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const items = await db.getTableData('inventory');
    const newItem = {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      min_quantity: data.minQuantity,
      location: data.location,
      organization_id: data.organizationId,
      cost_per_unit: data.costPerUnit,
      supplier: data.supplier,
      created_at: now,
      updated_at: now
    };
    
    items.push(newItem);
    await db.saveTableData('inventory', items);
    
    return {
      id,
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      minQuantity: data.minQuantity,
      location: data.location,
      organizationId: data.organizationId,
      costPerUnit: data.costPerUnit,
      supplier: data.supplier,
      status: getItemStatus(data.quantity, data.minQuantity),
      createdAt: now,
      updatedAt: now
    };
  },

  update: async (id: string, data: UpdateInventoryItemData): Promise<void> => {
    const items = await db.getTableData('inventory');
    const itemIndex = items.findIndex(i => i.id === id);
    
    if (itemIndex === -1) return;
    
    const now = new Date().toISOString();
    const item = items[itemIndex];
    
    if (data.name !== undefined) item.name = data.name;
    if (data.category !== undefined) item.category = data.category;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.minQuantity !== undefined) item.min_quantity = data.minQuantity;
    if (data.location !== undefined) item.location = data.location;
    if (data.costPerUnit !== undefined) item.cost_per_unit = data.costPerUnit;
    if (data.supplier !== undefined) item.supplier = data.supplier;
    item.updated_at = now;
    
    items[itemIndex] = item;
    await db.saveTableData('inventory', items);
  },

  delete: async (id: string): Promise<void> => {
    const items = await db.getTableData('inventory');
    const filteredItems = items.filter(i => i.id !== id);
    await db.saveTableData('inventory', filteredItems);
  }
};
