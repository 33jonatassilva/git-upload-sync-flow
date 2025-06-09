
import { db } from '@/lib/database';
import { Team } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTeamData {
  name: string;
  description?: string;
  organizationId: string;
  managerId?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
  managerId?: string;
}

export const teamsService = {
  getAll: (organizationId: string): Team[] => {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        COUNT(p.id) as peopleCount
      FROM teams t
      LEFT JOIN people p ON t.id = p.team_id AND p.status = 'active'
      WHERE t.organization_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    
    const rows = stmt.all(organizationId) as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      organizationId: row.organization_id,
      peopleCount: row.peopleCount || 0,
      createdAt: row.created_at,
      managerId: row.manager_id
    }));
  },

  getById: (id: string): Team | null => {
    const stmt = db.prepare(`
      SELECT 
        t.*,
        COUNT(p.id) as peopleCount
      FROM teams t
      LEFT JOIN people p ON t.id = p.team_id AND p.status = 'active'
      WHERE t.id = ?
      GROUP BY t.id
    `);
    
    const row = stmt.get(id) as any;
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      organizationId: row.organization_id,
      peopleCount: row.peopleCount || 0,
      createdAt: row.created_at,
      managerId: row.manager_id
    };
  },

  create: (data: CreateTeamData): Team => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO teams (id, name, description, organization_id, manager_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, data.name, data.description || null, data.organizationId, data.managerId || null, now, now);
    
    return {
      id,
      name: data.name,
      description: data.description,
      organizationId: data.organizationId,
      peopleCount: 0,
      createdAt: now,
      managerId: data.managerId
    };
  },

  update: (id: string, data: UpdateTeamData): void => {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.managerId !== undefined) {
      updates.push('manager_id = ?');
      values.push(data.managerId);
    }
    
    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const stmt = db.prepare(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  delete: (id: string): void => {
    // First, update people to remove team association
    const updatePeopleStmt = db.prepare('UPDATE people SET team_id = NULL WHERE team_id = ?');
    updatePeopleStmt.run(id);
    
    // Then delete the team
    const deleteStmt = db.prepare('DELETE FROM teams WHERE id = ?');
    deleteStmt.run(id);
  },

  addPersonToTeam: (teamId: string, personId: string): void => {
    const stmt = db.prepare('UPDATE people SET team_id = ? WHERE id = ?');
    stmt.run(teamId, personId);
  },

  removePersonFromTeam: (personId: string): void => {
    const stmt = db.prepare('UPDATE people SET team_id = NULL WHERE id = ?');
    stmt.run(personId);
  },

  getTeamMembers: (teamId: string) => {
    const stmt = db.prepare(`
      SELECT p.*, t.name as teamName
      FROM people p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.team_id = ? AND p.status = 'active'
      ORDER BY p.name
    `);
    
    return stmt.all(teamId);
  }
};
