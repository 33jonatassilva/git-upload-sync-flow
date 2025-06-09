
import { db, initDatabase } from '@/lib/database';
import { Organization, Person, Team, Asset, License, InventoryItem } from '@/types';

export class DatabaseService {
  constructor() {
    initDatabase();
    this.seedDatabase();
  }

  // Seed database with sample data
  private seedDatabase() {
    // Check if data already exists
    const orgCount = db.prepare('SELECT COUNT(*) as count FROM organizations').get() as { count: number };
    if (orgCount.count > 0) return;

    console.log('Seeding database with sample data...');

    // Insert sample organizations
    const orgId1 = crypto.randomUUID();
    const orgId2 = crypto.randomUUID();
    
    const insertOrg = db.prepare(`
      INSERT INTO organizations (id, name, description)
      VALUES (?, ?, ?)
    `);
    
    insertOrg.run(orgId1, 'TechCorp Brasil', 'Empresa de tecnologia líder no mercado brasileiro');
    insertOrg.run(orgId2, 'StartupXYZ', 'Startup inovadora em FinTech');

    // Insert sample teams
    const teamId1 = crypto.randomUUID();
    const teamId2 = crypto.randomUUID();
    const teamId3 = crypto.randomUUID();
    
    const insertTeam = db.prepare(`
      INSERT INTO teams (id, name, description, organization_id)
      VALUES (?, ?, ?, ?)
    `);
    
    insertTeam.run(teamId1, 'Desenvolvimento', 'Equipe de desenvolvimento de software', orgId1);
    insertTeam.run(teamId2, 'Marketing', 'Equipe de marketing e vendas', orgId1);
    insertTeam.run(teamId3, 'Produto', 'Equipe de produto e design', orgId2);

    // Insert sample people
    const people = [
      { id: crypto.randomUUID(), name: 'João Silva', email: 'joao.silva@techcorp.com', position: 'Desenvolvedor Senior', department: 'Tecnologia', organization_id: orgId1, status: 'active' },
      { id: crypto.randomUUID(), name: 'Maria Santos', email: 'maria.santos@techcorp.com', position: 'Product Manager', department: 'Produto', organization_id: orgId1, status: 'active' },
      { id: crypto.randomUUID(), name: 'Pedro Oliveira', email: 'pedro.oliveira@startup.com', position: 'UX Designer', department: 'Design', organization_id: orgId2, status: 'active' },
      { id: crypto.randomUUID(), name: 'Ana Costa', email: 'ana.costa@techcorp.com', position: 'Analista de Marketing', department: 'Marketing', organization_id: orgId1, status: 'inactive' },
      { id: crypto.randomUUID(), name: 'Carlos Ferreira', email: 'carlos.ferreira@startup.com', position: 'DevOps Engineer', department: 'Tecnologia', organization_id: orgId2, status: 'active' }
    ];

    const insertPerson = db.prepare(`
      INSERT INTO people (id, name, email, position, department, organization_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    people.forEach(person => {
      insertPerson.run(person.id, person.name, person.email, person.position, person.department, person.organization_id, person.status);
    });

    // Insert sample assets
    const assets = [
      { id: crypto.randomUUID(), name: 'MacBook Pro 16"', type: 'notebook', model: 'MacBook Pro', serial_number: 'MBP001', status: 'allocated', purchase_date: '2023-01-15', organization_id: orgId1, assigned_to: people[0].id, location: 'São Paulo' },
      { id: crypto.randomUUID(), name: 'Dell Monitor 27"', type: 'monitor', model: 'Dell U2719D', serial_number: 'DL001', status: 'allocated', purchase_date: '2023-02-10', organization_id: orgId1, assigned_to: people[1].id, location: 'São Paulo' },
      { id: crypto.randomUUID(), name: 'iPhone 14 Pro', type: 'other', model: 'iPhone 14 Pro', serial_number: 'IP001', status: 'available', purchase_date: '2023-03-20', organization_id: orgId2, assigned_to: null, location: 'Rio de Janeiro' },
      { id: crypto.randomUUID(), name: 'Adaptador USB-C', type: 'adapter', model: 'Apple USB-C', serial_number: 'AD001', status: 'allocated', purchase_date: '2023-01-25', organization_id: orgId1, assigned_to: people[2].id, location: 'Remoto' }
    ];

    const insertAsset = db.prepare(`
      INSERT INTO assets (id, name, type, model, serial_number, status, purchase_date, organization_id, assigned_to, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    assets.forEach(asset => {
      insertAsset.run(asset.id, asset.name, asset.type, asset.model, asset.serial_number, asset.status, asset.purchase_date, asset.organization_id, asset.assigned_to, asset.location);
    });

    // Insert sample licenses
    const licenses = [
      { id: crypto.randomUUID(), name: 'Microsoft Office 365', type: 'productivity', seats_total: 50, seats_used: 35, expiration_date: '2024-12-31', organization_id: orgId1, cost: 15000.00, vendor: 'Microsoft' },
      { id: crypto.randomUUID(), name: 'Adobe Creative Suite', type: 'design', seats_total: 10, seats_used: 8, expiration_date: '2024-06-30', organization_id: orgId1, cost: 8000.00, vendor: 'Adobe' },
      { id: crypto.randomUUID(), name: 'Slack Pro', type: 'communication', seats_total: 25, seats_used: 22, expiration_date: '2024-03-15', organization_id: orgId2, cost: 2500.00, vendor: 'Slack' },
      { id: crypto.randomUUID(), name: 'GitHub Enterprise', type: 'development', seats_total: 20, seats_used: 15, expiration_date: '2023-12-31', organization_id: orgId1, cost: 12000.00, vendor: 'GitHub' }
    ];

    const insertLicense = db.prepare(`
      INSERT INTO licenses (id, name, type, seats_total, seats_used, expiration_date, organization_id, cost, vendor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    licenses.forEach(license => {
      insertLicense.run(license.id, license.name, license.type, license.seats_total, license.seats_used, license.expiration_date, license.organization_id, license.cost, license.vendor);
    });

    // Insert sample inventory
    const inventory = [
      { id: crypto.randomUUID(), name: 'Cabo USB-C', category: 'Acessórios', quantity: 25, min_quantity: 10, location: 'Estoque SP', organization_id: orgId1, cost_per_unit: 25.90, supplier: 'TechSupplies' },
      { id: crypto.randomUUID(), name: 'Mouse Wireless', category: 'Periféricos', quantity: 15, min_quantity: 5, location: 'Estoque RJ', organization_id: orgId2, cost_per_unit: 89.90, supplier: 'OfficeMax' },
      { id: crypto.randomUUID(), name: 'Teclado Mecânico', category: 'Periféricos', quantity: 8, min_quantity: 3, location: 'Estoque SP', organization_id: orgId1, cost_per_unit: 299.90, supplier: 'GamerStore' },
      { id: crypto.randomUUID(), name: 'Webcam HD', category: 'Equipamentos', quantity: 12, min_quantity: 5, location: 'Estoque Central', organization_id: orgId1, cost_per_unit: 150.00, supplier: 'TechWorld' }
    ];

    const insertInventory = db.prepare(`
      INSERT INTO inventory (id, name, category, quantity, min_quantity, location, organization_id, cost_per_unit, supplier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    inventory.forEach(item => {
      insertInventory.run(item.id, item.name, item.category, item.quantity, item.min_quantity, item.location, item.organization_id, item.cost_per_unit, item.supplier);
    });

    console.log('Database seeded successfully!');
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

  updateOrganization(id: string, org: Partial<Omit<Organization, 'id' | 'createdAt'>>): void {
    const fields = Object.keys(org).map(key => `${key} = ?`).join(', ');
    const values = Object.values(org);
    const stmt = db.prepare(`UPDATE organizations SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteOrganization(id: string): void {
    const stmt = db.prepare('DELETE FROM organizations WHERE id = ?');
    stmt.run(id);
  }

  // People
  getPeople(organizationId?: string): Person[] {
    if (organizationId) {
      const stmt = db.prepare('SELECT * FROM people WHERE organization_id = ? ORDER BY name');
      return stmt.all(organizationId) as Person[];
    }
    const stmt = db.prepare('SELECT * FROM people ORDER BY name');
    return stmt.all() as Person[];
  }

  createPerson(person: Omit<Person, 'id' | 'licenses' | 'assets' | 'teamName'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO people (id, name, email, position, department, organization_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, person.name, person.email, person.position, person.position, person.organizationId, person.status);
    return id;
  }

  updatePerson(id: string, person: Partial<Omit<Person, 'id' | 'licenses' | 'assets' | 'teamName'>>): void {
    const fields = Object.keys(person).map(key => `${key} = ?`).join(', ');
    const values = Object.values(person);
    const stmt = db.prepare(`UPDATE people SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deletePerson(id: string): void {
    const stmt = db.prepare('DELETE FROM people WHERE id = ?');
    stmt.run(id);
  }

  // Assets
  getAssets(organizationId?: string): Asset[] {
    if (organizationId) {
      const stmt = db.prepare(`
        SELECT a.*, p.name as assigned_to_name 
        FROM assets a 
        LEFT JOIN people p ON a.assigned_to = p.id 
        WHERE a.organization_id = ? 
        ORDER BY a.name
      `);
      return stmt.all(organizationId) as Asset[];
    }
    const stmt = db.prepare(`
      SELECT a.*, p.name as assigned_to_name 
      FROM assets a 
      LEFT JOIN people p ON a.assigned_to = p.id 
      ORDER BY a.name
    `);
    return stmt.all() as Asset[];
  }

  createAsset(asset: Omit<Asset, 'id' | 'assignedToName'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO assets (id, name, type, model, serial_number, status, purchase_date, organization_id, assigned_to, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, asset.name, asset.type, asset.type, asset.serialNumber, 
      asset.status, asset.purchaseDate, asset.organizationId, asset.assignedTo, 'Default'
    );
    return id;
  }

  updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'assignedToName'>>): void {
    const fields = Object.keys(asset).map(key => `${key} = ?`).join(', ');
    const values = Object.values(asset);
    const stmt = db.prepare(`UPDATE assets SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteAsset(id: string): void {
    const stmt = db.prepare('DELETE FROM assets WHERE id = ?');
    stmt.run(id);
  }

  // Licenses
  getLicenses(organizationId?: string): License[] {
    if (organizationId) {
      const stmt = db.prepare('SELECT * FROM licenses WHERE organization_id = ? ORDER BY name');
      return stmt.all(organizationId) as License[];
    }
    const stmt = db.prepare('SELECT * FROM licenses ORDER BY name');
    return stmt.all() as License[];
  }

  createLicense(license: Omit<License, 'id' | 'status' | 'assignedTo'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO licenses (id, name, type, seats_total, seats_used, expiration_date, organization_id, cost, vendor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, license.name, license.description, license.totalQuantity, license.usedQuantity,
      license.expirationDate, license.organizationId, license.cost, license.vendor
    );
    return id;
  }

  updateLicense(id: string, license: Partial<Omit<License, 'id' | 'status' | 'assignedTo'>>): void {
    const fields = Object.keys(license).map(key => `${key} = ?`).join(', ');
    const values = Object.values(license);
    const stmt = db.prepare(`UPDATE licenses SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteLicense(id: string): void {
    const stmt = db.prepare('DELETE FROM licenses WHERE id = ?');
    stmt.run(id);
  }

  // Inventory
  getInventory(organizationId?: string): InventoryItem[] {
    if (organizationId) {
      const stmt = db.prepare('SELECT * FROM inventory WHERE organization_id = ? ORDER BY name');
      return stmt.all(organizationId) as InventoryItem[];
    }
    const stmt = db.prepare('SELECT * FROM inventory ORDER BY name');
    return stmt.all() as InventoryItem[];
  }

  createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO inventory (id, name, category, quantity, min_quantity, location, organization_id, cost_per_unit, supplier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, item.name, item.category, item.quantity, item.minQuantity,
      item.location, item.organizationId, item.costPerUnit, item.supplier
    );
    return id;
  }

  updateInventoryItem(id: string, item: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>): void {
    const fields = Object.keys(item).map(key => `${key} = ?`).join(', ');
    const values = Object.values(item);
    const stmt = db.prepare(`UPDATE inventory SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteInventoryItem(id: string): void {
    const stmt = db.prepare('DELETE FROM inventory WHERE id = ?');
    stmt.run(id);
  }

  // Teams
  getTeams(organizationId?: string): Team[] {
    if (organizationId) {
      const stmt = db.prepare(`
        SELECT t.*, COUNT(p.id) as people_count 
        FROM teams t 
        LEFT JOIN people p ON t.id = p.department 
        WHERE t.organization_id = ? 
        GROUP BY t.id 
        ORDER BY t.name
      `);
      return stmt.all(organizationId).map((team: any) => ({
        ...team,
        peopleCount: team.people_count || 0
      })) as Team[];
    }
    const stmt = db.prepare(`
      SELECT t.*, COUNT(p.id) as people_count 
      FROM teams t 
      LEFT JOIN people p ON t.id = p.department 
      GROUP BY t.id 
      ORDER BY t.name
    `);
    return stmt.all().map((team: any) => ({
      ...team,
      peopleCount: team.people_count || 0
    })) as Team[];
  }

  createTeam(team: Omit<Team, 'id' | 'peopleCount' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO teams (id, name, description, organization_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, team.name, team.description, team.organizationId);
    return id;
  }

  updateTeam(id: string, team: Partial<Omit<Team, 'id' | 'peopleCount' | 'createdAt'>>): void {
    const fields = Object.keys(team).map(key => `${key} = ?`).join(', ');
    const values = Object.values(team);
    const stmt = db.prepare(`UPDATE teams SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  deleteTeam(id: string): void {
    const stmt = db.prepare('DELETE FROM teams WHERE id = ?');
    stmt.run(id);
  }
}

export const dbService = new DatabaseService();
