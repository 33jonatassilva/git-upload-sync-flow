
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryItem } from '@/types';
import { inventoryService } from '@/services/inventoryService';
import { useApp } from '@/contexts/AppContext';
import { 
  Package, 
  Plus, 
  Search, 
  Pencil, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Inventory = () => {
  const { currentOrganization } = useApp();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = async () => {
    if (!currentOrganization) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const itemsData = await inventoryService.getAll(currentOrganization.id);
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os itens do inventário.',
        variant: 'destructive',
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [currentOrganization]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (item.quantity <= item.minQuantity) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusLabel = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return 'Sem Estoque';
    } else if (item.quantity <= item.minQuantity) {
      return 'Estoque Baixo';
    } else {
      return 'Disponível';
    }
  };

  const getStatusVariant = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return 'destructive';
    } else if (item.quantity <= item.minQuantity) {
      return 'secondary';
    } else {
      return 'default';
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Nenhuma organização selecionada</h2>
        <p className="text-muted-foreground mb-4">
          Selecione uma organização para gerenciar o inventário.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando inventário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventário</h1>
          <p className="text-muted-foreground">
            Gerencie os itens do inventário da organização: {currentOrganization.name}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, categoria ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Inventário</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando o primeiro item ao inventário.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item)}
                        <Badge variant={getStatusVariant(item) as any}>
                          {getStatusLabel(item)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
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
