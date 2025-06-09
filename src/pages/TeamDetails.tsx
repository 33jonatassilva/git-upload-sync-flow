
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Team, Person } from '@/types';
import { teamsService } from '@/services/teamsService';
import { databaseService } from '@/services/databaseService';
import { TeamDialog } from '@/components/teams/TeamDialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  UserPlus, 
  Users, 
  Calendar,
  Building2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadTeamData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const teamData = teamsService.getById(id);
      const membersData = teamsService.getTeamMembers(id);
      
      setTeam(teamData);
      setMembers(membersData);
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os dados do time.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !team) return;
    
    if (confirm('Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.')) {
      try {
        teamsService.delete(id);
        toast({
          title: 'Time excluído!',
          description: 'O time foi excluído com sucesso.',
        });
        navigate('/teams');
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir o time.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveMember = async (personId: string) => {
    try {
      teamsService.removePersonFromTeam(personId);
      toast({
        title: 'Pessoa removida!',
        description: 'A pessoa foi removida do time com sucesso.',
      });
      loadTeamData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível remover a pessoa do time.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Time não encontrado</h2>
        <p className="text-muted-foreground">O time solicitado não existe.</p>
        <Button onClick={() => navigate('/teams')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Times
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/teams')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-muted-foreground">Detalhes do time</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Informações Gerais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-lg">{team.name}</p>
            </div>
            {team.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p>{team.description}</p>
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Criado em {new Date(team.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Estatísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{team.peopleCount}</p>
              <p className="text-sm text-muted-foreground">Pessoas no time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="w-full justify-center">
              Ativo
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros do Time</CardTitle>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Pessoa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum membro</h3>
              <p className="text-muted-foreground">Este time ainda não possui membros.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <TeamDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        team={team}
        organizationId={team.organizationId}
        onSuccess={loadTeamData}
      />
    </div>
  );
};
