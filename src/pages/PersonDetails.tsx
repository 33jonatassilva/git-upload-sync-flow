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
import { Person, License, Asset } from '@/types';
import { peopleService } from '@/services/peopleService';
import { licensesService } from '@/services/licensesService';
import { assetsService } from '@/services/assetsService';
import { 
  ArrowLeft, 
  Mail, 
  Copy, 
  Building2, 
  Shield, 
  Laptop, 
  DollarSign,
  Users,
  UserCheck,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const PersonDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [person, setPerson] = useState<Person | null>(null);
  const [manager, setManager] = useState<Person | null>(null);
  const [subordinates, setSubordinates] = useState<Person[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!id || !currentOrganization) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Carregar dados da pessoa
      const personData = await peopleService.getById(id);
      if (!personData) {
        navigate('/people');
        return;
      }
      setPerson(personData);

      // Carregar todas as pessoas para encontrar hierarquia
      const allPeople = await peopleService.getAll(currentOrganization.id);
      
      // Encontrar subordinados (pessoas que têm esta pessoa como manager)
      const subordinatesData = allPeople.filter(p => p.managerId === id);
      setSubordinates(subordinatesData);

      // Encontrar manager (se esta pessoa tem um managerId)
      if (personData.managerId) {
        const managerData = allPeople.find(p => p.id === personData.managerId);
        setManager(managerData || null);
      }

      // Carregar licenças
      const allLicenses = await licensesService.getAll(currentOrganization.id);
      const personLicenses = allLicenses.filter(license => 
        license.assignedTo.includes(id)
      );
      setLicenses(personLicenses);

      // Carregar ativos
      const allAssets = await assetsService.getAll(currentOrganization.id);
      const personAssets = allAssets.filter(asset => asset.assignedTo === id);
      setAssets(personAssets);

    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Não foi possível carregar os dados da pessoa.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, currentOrganization]);

  const copyEmail = () => {
    if (person?.email) {
      navigator.clipboard.writeText(person.email);
      toast({
        title: 'E-mail copiado!',
        description: 'O e-mail foi copiado para a área de transferência.',
      });
    }
  };

  const calculateLicenseCost = () => {
    return licenses.reduce((total, license) => {
      const costPerUser = (license.cost || 0) / (license.usedQuantity || 1);
      return total + costPerUser;
    }, 0);
  };

  const calculateAssetsCost = () => {
    return assets.reduce((total, asset) => total + (asset.value || 0), 0);
  };

  const getTotalCost = () => {
    return calculateLicenseCost() + calculateAssetsCost();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dados da pessoa...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pessoa não encontrada</h2>
        <p className="text-muted-foreground mb-4">
          A pessoa solicitada não foi encontrada.
        </p>
        <Button onClick={() => navigate('/people')}>
          Voltar para Pessoas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/people')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{person.name}</h1>
          <p className="text-muted-foreground">{person.position}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{person.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={copyEmail}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{person.teamName || 'Sem time'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Entrada: {new Date(person.entryDate).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span>Status:</span>
                <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                  {person.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Custo Total */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" style={{ color: '#8b5cf6' }} />
                <span>Custo Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Licenças:</span>
                  <span>R$ {calculateLicenseCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ativos:</span>
                  <span>R$ {calculateAssetsCost().toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>R$ {getTotalCost().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hierarquia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Hierarquia</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {manager && (
                <div>
                  <h4 className="font-medium mb-2">Responde para:</h4>
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="font-medium">{manager.name}</div>
                    <div className="text-sm text-muted-foreground">{manager.position}</div>
                  </div>
                </div>
              )}

              {subordinates.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Subordinados ({subordinates.length}):</h4>
                  <div className="space-y-2">
                    {subordinates.map((subordinate) => (
                      <div key={subordinate.id} className="p-2 bg-muted rounded-lg">
                        <div className="font-medium">{subordinate.name}</div>
                        <div className="text-sm text-muted-foreground">{subordinate.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!manager && subordinates.length === 0 && (
                <p className="text-muted-foreground">Nenhuma informação de hierarquia disponível.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Licenças e Ativos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Licenças */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" style={{ color: '#3b82f6' }} />
                <span>Licenças Atribuídas ({licenses.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {licenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Expiração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {licenses.map((license) => {
                      const costPerUser = (license.cost || 0) / (license.usedQuantity || 1);
                      return (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">{license.name}</TableCell>
                          <TableCell>{license.vendor || '-'}</TableCell>
                          <TableCell>{new Date(license.expirationDate).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                license.status === 'active' ? 'default' : 
                                license.status === 'expiring_soon' ? 'secondary' : 'destructive'
                              }
                            >
                              {license.status === 'active' ? 'Ativa' : 
                               license.status === 'expiring_soon' ? 'Expirando' : 'Expirada'}
                            </Badge>
                          </TableCell>
                          <TableCell>R$ {costPerUser.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Nenhuma licença atribuída.</p>
              )}
            </CardContent>
          </Card>

          {/* Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Laptop className="w-5 h-5" style={{ color: '#10b981' }} />
                <span>Ativos Alocados ({assets.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Número de Série</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {asset.type === 'notebook' ? 'Notebook' :
                             asset.type === 'monitor' ? 'Monitor' :
                             asset.type === 'adapter' ? 'Adaptador' : 'Outro'}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.serialNumber}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              asset.condition === 'new' ? 'default' :
                              asset.condition === 'good' ? 'secondary' :
                              asset.condition === 'fair' ? 'outline' : 'destructive'
                            }
                          >
                            {asset.condition === 'new' ? 'Novo' :
                             asset.condition === 'good' ? 'Bom' :
                             asset.condition === 'fair' ? 'Regular' : 'Ruim'}
                          </Badge>
                        </TableCell>
                        <TableCell>R$ {asset.value.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Nenhum ativo alocado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
