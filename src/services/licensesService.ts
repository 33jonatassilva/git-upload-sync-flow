
import { db } from '@/lib/database';
import { License } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateLicenseData {
  name: string;
  description?: string;
  expirationDate: string;
  totalQuantity: number;
  cost?: number;
  vendor?: string;
  organizationId: string;
}

export interface UpdateLicenseData {
  name?: string;
  description?: string;
  expirationDate?: string;
  totalQuantity?: number;
  cost?: number;
  vendor?: string;
}

const calculateLicenseStatus = (expirationDate: string): License['status'] => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'active';
};

export const licensesService = {
  getAll: async (organizationId: string): Promise<License[]> => {
    const licenses = await db.getTableData('licenses');
    
    return licenses
      .filter(license => license.organization_id === organizationId)
      .map(license => ({
        id: license.id,
        name: license.name,
        description: license.description,
        expirationDate: license.expiration_date,
        totalQuantity: license.total_quantity,
        usedQuantity: license.used_quantity || 0,
        cost: license.cost,
        vendor: license.vendor,
        status: calculateLicenseStatus(license.expiration_date),
        assignedTo: license.assigned_to ? JSON.parse(license.assigned_to) : [],
        licenseCode: license.license_code,
        individualCodes: license.individual_codes ? JSON.parse(license.individual_codes) : {},
        organizationId: license.organization_id
      }))
      .sort((a, b) => new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime());
  },

  getById: async (id: string): Promise<License | null> => {
    const licenses = await db.getTableData('licenses');
    const license = licenses.find(l => l.id === id);
    
    if (!license) return null;
    
    return {
      id: license.id,
      name: license.name,
      description: license.description,
      expirationDate: license.expiration_date,
      totalQuantity: license.total_quantity,
      usedQuantity: license.used_quantity || 0,
      cost: license.cost,
      vendor: license.vendor,
      status: calculateLicenseStatus(license.expiration_date),
      assignedTo: license.assigned_to ? JSON.parse(license.assigned_to) : [],
      licenseCode: license.license_code,
      individualCodes: license.individual_codes ? JSON.parse(license.individual_codes) : {},
      organizationId: license.organization_id
    };
  },

  create: async (data: CreateLicenseData): Promise<License> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const licenses = await db.getTableData('licenses');
    const newLicense = {
      id,
      name: data.name,
      description: data.description || null,
      expiration_date: data.expirationDate,
      total_quantity: data.totalQuantity,
      used_quantity: 0,
      cost: data.cost || null,
      vendor: data.vendor || null,
      organization_id: data.organizationId,
      assigned_to: JSON.stringify([]),
      individual_codes: JSON.stringify({}),
      created_at: now,
      updated_at: now
    };
    
    licenses.push(newLicense);
    await db.saveTableData('licenses', licenses);
    
    return {
      id,
      name: data.name,
      description: data.description,
      expirationDate: data.expirationDate,
      totalQuantity: data.totalQuantity,
      usedQuantity: 0,
      cost: data.cost,
      vendor: data.vendor,
      status: calculateLicenseStatus(data.expirationDate),
      assignedTo: [],
      individualCodes: {},
      organizationId: data.organizationId
    };
  },

  update: async (id: string, data: UpdateLicenseData): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const licenseIndex = licenses.findIndex(l => l.id === id);
    
    if (licenseIndex === -1) return;
    
    const now = new Date().toISOString();
    const license = licenses[licenseIndex];
    
    if (data.name !== undefined) license.name = data.name;
    if (data.description !== undefined) license.description = data.description;
    if (data.expirationDate !== undefined) license.expiration_date = data.expirationDate;
    if (data.totalQuantity !== undefined) license.total_quantity = data.totalQuantity;
    if (data.cost !== undefined) license.cost = data.cost;
    if (data.vendor !== undefined) license.vendor = data.vendor;
    license.updated_at = now;
    
    licenses[licenseIndex] = license;
    await db.saveTableData('licenses', licenses);
  },

  delete: async (id: string): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const filteredLicenses = licenses.filter(l => l.id !== id);
    await db.saveTableData('licenses', filteredLicenses);
  },

  assignToUser: async (licenseId: string, userId: string): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const licenseIndex = licenses.findIndex(l => l.id === licenseId);
    
    if (licenseIndex === -1) return;
    
    const license = licenses[licenseIndex];
    const assignedTo = license.assigned_to ? JSON.parse(license.assigned_to) : [];
    
    if (!assignedTo.includes(userId) && assignedTo.length < license.total_quantity) {
      assignedTo.push(userId);
      license.assigned_to = JSON.stringify(assignedTo);
      license.used_quantity = assignedTo.length;
      license.updated_at = new Date().toISOString();
      
      licenses[licenseIndex] = license;
      await db.saveTableData('licenses', licenses);
    }
  },

  unassignFromUser: async (licenseId: string, userId: string): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const licenseIndex = licenses.findIndex(l => l.id === licenseId);
    
    if (licenseIndex === -1) return;
    
    const license = licenses[licenseIndex];
    const assignedTo = license.assigned_to ? JSON.parse(license.assigned_to) : [];
    const filteredAssigned = assignedTo.filter((id: string) => id !== userId);
    
    // Remove código individual da pessoa
    const individualCodes = license.individual_codes ? JSON.parse(license.individual_codes) : {};
    delete individualCodes[userId];
    
    license.assigned_to = JSON.stringify(filteredAssigned);
    license.individual_codes = JSON.stringify(individualCodes);
    license.used_quantity = filteredAssigned.length;
    license.updated_at = new Date().toISOString();
    
    licenses[licenseIndex] = license;
    await db.saveTableData('licenses', licenses);
  },

  updateLicenseCode: async (licenseId: string, licenseCode: string): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const licenseIndex = licenses.findIndex(l => l.id === licenseId);
    
    if (licenseIndex === -1) return;
    
    const license = licenses[licenseIndex];
    license.license_code = licenseCode;
    license.updated_at = new Date().toISOString();
    
    licenses[licenseIndex] = license;
    await db.saveTableData('licenses', licenses);
  },

  updateIndividualCode: async (licenseId: string, userId: string, code: string): Promise<void> => {
    const licenses = await db.getTableData('licenses');
    const licenseIndex = licenses.findIndex(l => l.id === licenseId);
    
    if (licenseIndex === -1) return;
    
    const license = licenses[licenseIndex];
    const individualCodes = license.individual_codes ? JSON.parse(license.individual_codes) : {};
    
    if (code.trim()) {
      individualCodes[userId] = code.trim();
    } else {
      delete individualCodes[userId];
    }
    
    license.individual_codes = JSON.stringify(individualCodes);
    license.updated_at = new Date().toISOString();
    
    licenses[licenseIndex] = license;
    await db.saveTableData('licenses', licenses);
  }
};
