
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/types';
import { teamsService } from '@/services/teamsService';
import { TeamDialog } from '@/components/teams/TeamDialog';
import { Building2, Plus, Users, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Teams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>();

  // Para demonstração, usando uma organização padrão
  const organizationId = 'org-1';

  const loadTeams = async () => {
    setLoading(true);
    try {
      const teamsData = teamsService.getAll(organizationId);
      setTeams(teamsData);
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os times.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleDelete = async (team: Team) => {
    if (confirm(`Tem certeza que deseja excluir o time "${team.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        teamsService.delete(team.id);
        toast({
          title: 'Time excluído!',
          description: 'O time foi excluído com sucesso.',
        });
        loadTeams();
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir o time.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTeam(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTeam(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando times...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Times</h1>
          <p className="text-muted-foreground">Gerencie os times e departamentos da empresa</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Time
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(team)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {team.description || 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{team.peopleCount} pessoas</span>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Criado em {new Date(team.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nenhum time encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando o primeiro time da sua organização.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Time
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{teams.length}</p>
                <p className="text-sm text-muted-foreground">Total de Times</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">
                  {teams.reduce((acc, team) => acc + team.peopleCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Pessoas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">
                  {teams.length > 0 ? Math.round(teams.reduce((acc, team) => acc + team.peopleCount, 0) / teams.length) : 0}
                </p>
                <p className="text-sm text-muted-foreground">Média por Time</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-purple-600">100%</p>
                <p className="text-sm text-muted-foreground">Times Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Dialog */}
      <TeamDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        team={editingTeam}
        organizationId={organizationId}
        onSuccess={() => {
          loadTeams();
          handleDialogClose();
        }}
      />
    </div>
  );
};
