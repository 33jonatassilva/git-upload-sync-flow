import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Person, Team, License, Asset } from '@/types';
import { peopleService } from '@/services/peopleService';
import { teamsService } from '@/services/teamsService';
import { licensesService } from '@/services/licensesService';
import { Users, Plus, Edit, Trash2, Mail, Building2, Shield, Laptop, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const People = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [people, setPeople] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    teamId: '',
  });

  const loadData = async () => {
    if (!currentOrganization) {
      setPeople([]);
      setTeams([]);
      setLicenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const peopleData = peopleService.getAll(currentOrganization.id);
      const teamsData = teamsService.getAll(currentOrganization.id);
      const licensesData = licensesService.getAll(currentOrganization.id);
      setPeople(peopleData);
      setTeams(teamsData);
      setLicenses(licensesData);
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentOrganization]);

  const handleSubmit = () => {
    if (!currentOrganization) {
      toast({
        title: 'Erro!',
        description: 'Selecione uma organização primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingPerson) {
        peopleService.update(editingPerson.id, {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          teamId: formData.teamId || undefined,
        });
        toast({
          title: 'Pessoa atualizada!',
          description: 'A pessoa foi atualizada com sucesso.',
        });
      } else {
        peopleService.create({
          name: formData.name,
          email: formData.email,
          position: formData.position,
          organizationId: currentOrganization.id,
          teamId: formData.teamId || undefined,
        });
        toast({
          title: 'Pessoa criada!',
          description: 'A pessoa foi criada com sucesso.',
        });
      }

      setFormData({ name: '', email: '', position: '', teamId: '' });
      setEditingPerson(null);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível salvar a pessoa.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      position: person.position,
      teamId: person.teamId || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (person: Person) => {
    if (confirm(`Tem certeza que deseja excluir "${person.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        peopleService.delete(person.id);
        toast({
          title: 'Pessoa excluída!',
          description: 'A pessoa foi excluída com sucesso.',
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir a pessoa.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddNew = () => {
    if (!currentOrganization) {
      toast({
        title: 'Erro!',
        description: 'Selecione uma organização primeiro.',
        variant: 'destructive',
      });
      return;
    }
    setEditingPerson(null);
    setFormData({ name: '', email: '', position: '', teamId: '' });
    setDialogOpen(true);
  };

  // Calculate person costs and assignments
  const getPersonLicenses = (personId: string) => {
    return licenses.filter(license => license.assignedTo.includes(personId));
  };

  const getPersonLicenseCost = (personId: string) => {
    const personLicenses = getPersonLicenses(personId);
    return personLicenses.reduce((total, license) => {
      const costPerUser = (license.cost || 0) / (license.usedQuantity || 1);
      return total + costPerUser;
    }, 0);
  };

  const getPersonAssetsCost = (personId: string) => {
    // TODO: Implement when assets service is available
    return 0;
  };

  const getTotalPersonCost = (personId: string) => {
    return getPersonLicenseCost(personId) + getPersonAssetsCost(personId);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para gerenciar as pessoas.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando pessoas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pessoas</h1>
          <p className="text-muted-foreground">
            Gerencie as pessoas da organização: {currentOrganization.name}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Pessoa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPerson ? 'Editar Pessoa' : 'Nova Pessoa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="position">Cargo *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Cargo ou função"
                />
              </div>
              <div>
                <Label htmlFor="team">Time</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um time (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-team">Sem time</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingPerson ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* People Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Lista de Pessoas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhuma pessoa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando a primeira pessoa da organização.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Pessoa
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Licenças</TableHead>
                  <TableHead>Ativos</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => {
                  const personLicenses = getPersonLicenses(person.id);
                  const licenseCost = getPersonLicenseCost(person.id);
                  const assetsCost = getPersonAssetsCost(person.id);
                  const totalCost = getTotalPersonCost(person.id);

                  return (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{person.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{person.position}</TableCell>
                      <TableCell>
                        {person.teamName ? (
                          <Badge variant="outline">{person.teamName}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Sem time</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>{personLicenses.length}</span>
                          {personLicenses.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              (R$ {licenseCost.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Laptop className="w-4 h-4 text-green-600" />
                          <span>0</span>
                          <span className="text-sm text-muted-foreground">
                            (R$ {assetsCost.toFixed(2)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">R$ {totalCost.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                          {person.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(person)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(person)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {people.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Pessoas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{people.length}</p>
                <p className="text-sm text-muted-foreground">Total de Pessoas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">
                  {people.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Pessoas Ativas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">
                  {people.filter(p => p.teamId).length}
                </p>
                <p className="text-sm text-muted-foreground">Com Time</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-purple-600">
                  {licenses.reduce((total, license) => total + license.assignedTo.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Licenças Atribuídas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-orange-600">
                  R$ {people.reduce((total, person) => total + getTotalPersonCost(person.id), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Custo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
