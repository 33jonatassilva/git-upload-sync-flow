
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Asset, Person } from '@/types';
import { assetsService } from '@/services/assetsService';
import { peopleService } from '@/services/peopleService';
import { Laptop, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const Assets = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'laptop' as Asset['type'],
    serialNumber: '',
    value: '',
    purchaseDate: '',
    status: 'available' as Asset['status'],
    condition: 'new' as Asset['condition'],
    notes: '',
    assignedTo: '',
  });

  const loadData = async () => {
    if (!currentOrganization) {
      setAssets([]);
      setPeople([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const assetsData = assetsService.getAll(currentOrganization.id);
      const peopleData = peopleService.getAll(currentOrganization.id);
      setAssets(assetsData);
      setPeople(peopleData);
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

    if (!formData.name.trim() || !formData.serialNumber.trim() || !formData.value.trim() || !formData.purchaseDate) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAsset) {
        assetsService.update(editingAsset.id, {
          name: formData.name,
          type: formData.type,
          serialNumber: formData.serialNumber,
          value: parseFloat(formData.value),
          purchaseDate: formData.purchaseDate,
          status: formData.status,
          condition: formData.condition,
          notes: formData.notes,
          assignedTo: formData.assignedTo || undefined,
        });
        toast({
          title: 'Ativo atualizado!',
          description: 'O ativo foi atualizado com sucesso.',
        });
      } else {
        assetsService.create({
          name: formData.name,
          type: formData.type,
          serialNumber: formData.serialNumber,
          value: parseFloat(formData.value),
          purchaseDate: formData.purchaseDate,
          status: formData.status,
          condition: formData.condition,
          notes: formData.notes,
          assignedTo: formData.assignedTo || undefined,
          organizationId: currentOrganization.id,
        });
        toast({
          title: 'Ativo criado!',
          description: 'O ativo foi criado com sucesso.',
        });
      }

      setFormData({
        name: '',
        type: 'laptop',
        serialNumber: '',
        value: '',
        purchaseDate: '',
        status: 'available',
        condition: 'new',
        notes: '',
        assignedTo: '',
      });
      setEditingAsset(null);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível salvar o ativo.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      serialNumber: asset.serialNumber,
      value: asset.value.toString(),
      purchaseDate: asset.purchaseDate,
      status: asset.status,
      condition: asset.condition,
      notes: asset.notes || '',
      assignedTo: asset.assignedTo || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (asset: Asset) => {
    if (confirm(`Tem certeza que deseja excluir "${asset.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        assetsService.delete(asset.id);
        toast({
          title: 'Ativo excluído!',
          description: 'O ativo foi excluído com sucesso.',
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir o ativo.',
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
    setEditingAsset(null);
    setFormData({
      name: '',
      type: 'laptop',
      serialNumber: '',
      value: '',
      purchaseDate: '',
      status: 'available',
      condition: 'new',
      notes: '',
      assignedTo: '',
    });
    setDialogOpen(true);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para gerenciar os ativos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando ativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ativos</h1>
          <p className="text-muted-foreground">
            Gerencie os ativos da organização: {currentOrganization.name}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do ativo"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: Asset['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="printer">Impressora</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serialNumber">Número de Série *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="Número de série"
                />
              </div>
              <div>
                <Label htmlFor="value">Valor *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Data de Compra *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: Asset['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="allocated">Alocado</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="retired">Aposentado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition">Condição *</Label>
                <Select value={formData.condition} onValueChange={(value: Asset['condition']) => setFormData({ ...formData, condition: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="good">Bom</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="assignedTo">Atribuído a</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não atribuído</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais"
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAsset ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Laptop className="w-5 h-5" />
            <span>Lista de Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-8">
              <Laptop className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum ativo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro ativo da organização.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atribuído a</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.type}</Badge>
                    </TableCell>
                    <TableCell>{asset.serialNumber}</TableCell>
                    <TableCell>R$ {asset.value.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        asset.status === 'available' ? 'default' :
                        asset.status === 'allocated' ? 'secondary' :
                        asset.status === 'maintenance' ? 'destructive' : 'outline'
                      }>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.assignedToName || <span className="text-muted-foreground">Não atribuído</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
