
import { db, initDatabase } from '@/lib/database';
import { Organization, Person, Team, Asset, License, InventoryItem } from '@/types';

export class DatabaseService {
  constructor() {
    initDatabase();
  }

  // Organizations
  getOrganizations(): Organization[] {
    const stmt = db.prepare('SELECT * FROM organizations ORDER BY name');
    return stmt.all() as Organization[];
  }

  createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO organizations (id, name, description)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, org.name, org.description);
    return id;
  }

  // People
  getPeople(organizationId: string): Person[] {
    const stmt = db.prepare('SELECT * FROM people WHERE organization_id = ? ORDER BY name');
    return stmt.all(organizationId) as Person[];
  }

  createPerson(person: Omit<Person, 'id' | 'licenses' | 'assets' | 'teamName'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO people (id, name, email, position, organization_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, person.name, person.email, person.position, person.organizationId, person.status);
    return id;
  }

  // Assets
  getAssets(organizationId: string): Asset[] {
    const stmt = db.prepare('SELECT * FROM assets WHERE organization_id = ? ORDER BY name');
    return stmt.all(organizationId) as Asset[];
  }

  createAsset(asset: Omit<Asset, 'id' | 'assignedToName'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO assets (id, name, type, serial_number, status, purchase_date, organization_id, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, asset.name, asset.type, asset.serialNumber, 
      asset.status, asset.purchaseDate, asset.organizationId, asset.assignedTo
    );
    return id;
  }

  // Licenses
  getLicenses(organizationId: string): License[] {
    const stmt = db.prepare('SELECT * FROM licenses WHERE organization_id = ? ORDER BY name');
    return stmt.all(organizationId) as License[];
  }

  // Inventory
  getInventory(organizationId: string): InventoryItem[] {
    const stmt = db.prepare('SELECT * FROM inventory WHERE organization_id = ? ORDER BY name');
    return stmt.all(organizationId) as InventoryItem[];
  }
}

export const dbService = new DatabaseService();
