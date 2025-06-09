import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { assetsService } from '@/services/assetsService';
import { useApp } from '@/contexts/AppContext';
import { Asset } from '@/types';
import { 
  Package, 
  Search, 
  Laptop, 
  Monitor, 
  Usb,
  Plus,
  User,
  Calendar,
  DollarSign,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export const Inventory = () => {
  const { currentOrganization, people } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryAssets, setInventoryAssets] = useState<Asset[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  // Load available assets when organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadInventoryAssets();
    }
  }, [currentOrganization]);

  const loadInventoryAssets = () => {
    if (!currentOrganization) return;
    const assets = assetsService.getAvailable(currentOrganization.id);
    setInventoryAssets(assets);
  };

  const filteredAssets = inventoryAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedPersonId('');
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedAsset || !selectedPersonId) {
      toast.error('Selecione uma pessoa para atribuir o ativo');
      return;
    }

    const person = people.find(p => p.id === selectedPersonId);
    if (!person) {
      toast.error('Pessoa não encontrada');
      return;
    }

    assetsService.assignToUser(selectedAsset.id, selectedPersonId);
    toast.success(`Ativo "${selectedAsset.name}" atribuído para ${person.name}`);
    
    loadInventoryAssets();
    setIsAssignDialogOpen(false);
    setSelectedAsset(null);
    setSelectedPersonId('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'notebook':
        return <Laptop className="w-5 h-5" />;
      case 'monitor':
        return <Monitor className="w-5 h-5" />;
      case 'adapter':
        return <Usb className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notebook':
        return 'Notebook';
      case 'monitor':
        return 'Monitor';
      case 'adapter':
        return 'Adaptador';
      default:
        return 'Outro';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'Novo';
      case 'good':
        return 'Bom';
      case 'fair':
        return 'Regular';
      case 'poor':
        return 'Ruim';
      default:
        return 'N/A';
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selecione uma organização</h3>
        <p className="text-muted-foreground">
          Você precisa selecionar uma organização para gerenciar o estoque.
        </p>
      </div>
    );
  }

  // Calculate stats
  const notebooks = inventoryAssets.filter(a => a.type === 'notebook');
  const monitors = inventoryAssets.filter(a => a.type === 'monitor');
  const adapters = inventoryAssets.filter(a => a.type === 'adapter');
  const totalValue = inventoryAssets.reduce((acc, asset) => acc + asset.value, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estoque</h1>
          <p className="text-muted-foreground">Ativos disponíveis para alocação</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar ao Estoque
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Laptop className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notebooks.length}</p>
                <p className="text-sm text-muted-foreground">Notebooks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12  dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{monitors.length}</p>
                <p className="text-sm text-muted-foreground">Monitores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Usb className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adapters.length}</p>
                <p className="text-sm text-muted-foreground">Adaptadores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, número de série ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alocar Ativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAsset && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedAsset.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {getTypeLabel(selectedAsset.type)} - {selectedAsset.serialNumber}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="person">Selecionar Pessoa</Label>
              <select
                id="person"
                className="w-full p-2 border rounded-md"
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
              >
                <option value="">Selecione uma pessoa</option>
                {people
                  .filter(p => p.organizationId === currentOrganization?.id && p.status === 'active')
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.position}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmAssignment}>
              Alocar Ativo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum item encontrado' : 'Estoque vazio'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos da sua busca.' 
                : 'Não há ativos disponíveis no estoque no momento.'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory List */}
      {filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center text-white">
                      {getTypeIcon(asset.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getTypeLabel(asset.type)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Disponível</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Asset Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número de Série:</span>
                      <span className="font-medium">{asset.serialNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">R$ {asset.value.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Condição:</span>
                      <span className={`font-medium ${getConditionColor(asset.condition)}`}>
                        {getConditionText(asset.condition)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data de Compra:</span>
                      <span className="font-medium">
                        {new Date(asset.purchaseDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleAssignAsset(asset)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Alocar para Pessoa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
