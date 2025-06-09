
import { useState } from 'react';
import { Laptop, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { Asset } from '@/types';
import { toast } from 'sonner';

export const Assets = () => {
  const { assets, setAssets, currentOrganization, people } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'notebook' as Asset['type'],
    serialNumber: '',
    value: '',
    purchaseDate: '',
    status: 'available' as Asset['status'],
    condition: 'new' as Asset['condition'],
    notes: '',
    assignedTo: '',
  });

  // Filter assets by current organization
  const orgAssets = assets.filter(asset => 
    !currentOrganization || asset.organizationId === currentOrganization.id
  );

  // Apply filters
  const filteredAssets = orgAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'available': return 'status-success';
      case 'allocated': return 'status-info';
      case 'maintenance': return 'status-warning';
      case 'retired': return 'status-danger';
      default: return 'status-info';
    }
  };

  const getConditionColor = (condition: Asset['condition']) => {
    switch (condition) {
      case 'new': return 'status-success';
      case 'good': return 'status-info';
      case 'fair': return 'status-warning';
      case 'poor': return 'status-danger';
      default: return 'status-info';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'notebook',
      serialNumber: '',
      value: '',
      purchaseDate: '',
      status: 'available',
      condition: 'new',
      notes: '',
      assignedTo: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.serialNumber.trim()) {
      toast.error('Nome e número de série são obrigatórios');
      return;
    }

    if (!currentOrganization) {
      toast.error('Selecione uma organização primeiro');
      return;
    }

    const assignedPerson = formData.assignedTo ? 
      people.find(p => p.id === formData.assignedTo) : null;

    if (editingAsset) {
      // Edit asset
      const updatedAsset: Asset = {
        ...editingAsset,
        name: formData.name,
        type: formData.type,
        serialNumber: formData.serialNumber,
        value: parseFloat(formData.value) || 0,
        purchaseDate: formData.purchaseDate,
        status: formData.status,
        condition: formData.condition,
        notes: formData.notes,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: assignedPerson?.name,
      };
      
      setAssets(assets.map(asset => 
        asset.id === editingAsset.id ? updatedAsset : asset
      ));
      
      toast.success('Ativo atualizado com sucesso!');
    } else {
      // Create new asset
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        serialNumber: formData.serialNumber,
        value: parseFloat(formData.value) || 0,
        purchaseDate: formData.purchaseDate,
        status: formData.status,
        condition: formData.condition,
        notes: formData.notes,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: assignedPerson?.name,
        organizationId: currentOrganization.id,
      };
      
      setAssets([...assets, newAsset]);
      toast.success('Ativo criado com sucesso!');
    }

    resetForm();
    setEditingAsset(null);
    setIsDialogOpen(false);
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
    setIsDialogOpen(true);
  };

  const handleDelete = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setAssets(assets.filter(a => a.id !== assetId));
    toast.success(`Ativo "${asset?.name}" excluído com sucesso!`);
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Laptop className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecione uma organização</h3>
        <p className="text-muted-foreground">
          Você precisa selecionar uma organização para gerenciar ativos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ativos</h1>
          <p className="text-muted-foreground">Gerencie equipamentos e recursos físicos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="gradient-bg hover:opacity-90 transition-opacity"
              onClick={() => {
                setEditingAsset(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Ativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value: Asset['type']) => 
                  setFormData({ ...formData, type: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notebook</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="adapter">Adaptador</SelectItem>
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
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Asset['status']) => 
                  setFormData({ ...formData, status: value })
                }>
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
                <Label htmlFor="condition">Condição</Label>
                <Select value={formData.condition} onValueChange={(value: Asset['condition']) => 
                  setFormData({ ...formData, condition: value })
                }>
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
                <Select value={formData.assignedTo} onValueChange={(value) => 
                  setFormData({ ...formData, assignedTo: value })
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {people
                      .filter(p => p.organizationId === currentOrganization?.id)
                      .map((person) => (
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
                  placeholder="Observações sobre o ativo"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingAsset ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número de série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="allocated">Alocado</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="retired">Aposentado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="notebook">Notebook</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="adapter">Adaptador</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ativos ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nº Série</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Atribuído a</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell className="capitalize">{asset.type}</TableCell>
                    <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status === 'available' && 'Disponível'}
                        {asset.status === 'allocated' && 'Alocado'}
                        {asset.status === 'maintenance' && 'Manutenção'}
                        {asset.status === 'retired' && 'Aposentado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition === 'new' && 'Novo'}
                        {asset.condition === 'good' && 'Bom'}
                        {asset.condition === 'fair' && 'Regular'}
                        {asset.condition === 'poor' && 'Ruim'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.assignedToName || '-'}
                    </TableCell>
                    <TableCell>
                      R$ {asset.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Laptop className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum ativo encontrado</h3>
              <p className="text-muted-foreground">
                {orgAssets.length === 0 
                  ? 'Comece adicionando seu primeiro ativo.'
                  : 'Tente ajustar os filtros para encontrar ativos.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
