
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockAssets } from '@/data/mockData';
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

export const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter only available assets for inventory
  const inventoryAssets = mockAssets.filter(asset => asset.status === 'available');
  
  const filteredAssets = inventoryAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <Button className="w-full" size="sm">
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
