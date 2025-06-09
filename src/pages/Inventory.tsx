
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
import { inventoryService } from '@/services/inventoryService';
import { Package, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  organizationId: string;
}

export const Inventory = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
  });

  const loadData = async () => {
    if (!currentOrganization) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const itemsData = inventoryService.getAll(currentOrganization.id);
      setItems(itemsData);
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

    if (!formData.name.trim() || !formData.category.trim() || !formData.quantity || !formData.unitPrice) {
      toast({
        title: 'Erro!',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingItem) {
        inventoryService.update(editingItem.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity) || 0,
          unitPrice: parseFloat(formData.unitPrice),
          supplier: formData.supplier,
          location: formData.location,
        });
        toast({
          title: 'Item atualizado!',
          description: 'O item foi atualizado com sucesso.',
        });
      } else {
        inventoryService.create({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity) || 0,
          unitPrice: parseFloat(formData.unitPrice),
          supplier: formData.supplier,
          location: formData.location,
          organizationId: currentOrganization.id,
        });
        toast({
          title: 'Item criado!',
          description: 'O item foi criado com sucesso.',
        });
      }

      setFormData({
        name: '',
        description: '',
        category: '',
        quantity: '',
        minQuantity: '',
        unitPrice: '',
        supplier: '',
        location: '',
      });
      setEditingItem(null);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unitPrice: item.unitPrice.toString(),
      supplier: item.supplier || '',
      location: item.location || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    if (confirm(`Tem certeza que deseja excluir "${item.name}"? Esta ação não pode ser desfeita.`)) {
      try {
        inventoryService.delete(item.id);
        toast({
          title: 'Item excluído!',
          description: 'O item foi excluído com sucesso.',
        });
        loadData();
      } catch (error) {
        toast({
          title: 'Erro!',
          description: 'Não foi possível excluir o item.',
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
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: '',
      minQuantity: '',
      unitPrice: '',
      supplier: '',
      location: '',
    });
    setDialogOpen(true);
  };

  const getLowStockItems = () => items.filter(item => item.quantity <= item.minQuantity);

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para gerenciar o estoque.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  const lowStockItems = getLowStockItems();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">
            Gerencie o estoque da organização: {currentOrganization.name}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do item"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Categoria do item"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Preço Unitário *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Localização do item"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do item"
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Itens com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-2">
              {lowStockItems.length} {lowStockItems.length === 1 ? 'item está' : 'itens estão'} com estoque baixo:
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((item) => (
                <Badge key={item.id} variant="destructive">
                  {item.name} ({item.quantity} restante{item.quantity !== 1 ? 's' : ''})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Lista de Itens</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro item ao estoque.
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Mín.</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.minQuantity}</TableCell>
                    <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.quantity <= item.minQuantity ? 'destructive' : 'default'}>
                        {item.quantity <= item.minQuantity ? 'Estoque Baixo' : 'OK'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
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

      {/* Summary Stats */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-600">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Quantidade Total</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-orange-600">
                  {lowStockItems.length}
                </p>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-600">
                  R$ {items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
