
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

export const teamsService = {
  getAll: (organizationId: string): Team[] => {
    const teams = getTableData('teams');
    const people = getTableData('people');
    
    return teams
      .filter(team => team.organization_id === organizationId)
      .map(team => {
        const peopleCount = people.filter(person => 
          person.team_id === team.id && person.status === 'active'
        ).length;
        
        return {
          id: team.id,
          name: team.name,
          description: team.description,
          organizationId: team.organization_id,
          peopleCount: peopleCount,
          createdAt: team.created_at,
          managerId: team.manager_id
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id: string): Team | null => {
    const teams = getTableData('teams');
    const people = getTableData('people');
    
    const team = teams.find(team => team.id === id);
    if (!team) return null;
    
    const peopleCount = people.filter(person => 
      person.team_id === team.id && person.status === 'active'
    ).length;
    
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      organizationId: team.organization_id,
      peopleCount: peopleCount,
      createdAt: team.created_at,
      managerId: team.manager_id
    };
  },

  create: (data: CreateTeamData): Team => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const teams = getTableData('teams');
    const newTeam = {
      id,
      name: data.name,
      description: data.description || null,
      organization_id: data.organizationId,
      manager_id: data.managerId || null,
      created_at: now,
      updated_at: now
    };
    
    teams.push(newTeam);
    saveTableData('teams', teams);
    
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
    const teams = getTableData('teams');
    const teamIndex = teams.findIndex(team => team.id === id);
    
    if (teamIndex === -1) return;
    
    const now = new Date().toISOString();
    const team = teams[teamIndex];
    
    if (data.name !== undefined) team.name = data.name;
    if (data.description !== undefined) team.description = data.description;
    if (data.managerId !== undefined) team.manager_id = data.managerId;
    team.updated_at = now;
    
    teams[teamIndex] = team;
    saveTableData('teams', teams);
  },

  delete: (id: string): void => {
    // First, update people to remove team association
    const people = getTableData('people');
    const updatedPeople = people.map(person => {
      if (person.team_id === id) {
        return { ...person, team_id: null };
      }
      return person;
    });
    saveTableData('people', updatedPeople);
    
    // Then delete the team
    const teams = getTableData('teams');
    const filteredTeams = teams.filter(team => team.id !== id);
    saveTableData('teams', filteredTeams);
  },

  addPersonToTeam: (teamId: string, personId: string): void => {
    const people = getTableData('people');
    const personIndex = people.findIndex(person => person.id === personId);
    
    if (personIndex !== -1) {
      people[personIndex].team_id = teamId;
      saveTableData('people', people);
    }
  },

  removePersonFromTeam: (personId: string): void => {
    const people = getTableData('people');
    const personIndex = people.findIndex(person => person.id === personId);
    
    if (personIndex !== -1) {
      people[personIndex].team_id = null;
      saveTableData('people', people);
    }
  },

  getTeamMembers: (teamId: string) => {
    const people = getTableData('people');
    const teams = getTableData('teams');
    
    return people
      .filter(person => person.team_id === teamId && person.status === 'active')
      .map(person => {
        const team = teams.find(team => team.id === person.team_id);
        return {
          ...person,
          teamName: team ? team.name : null
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
};
