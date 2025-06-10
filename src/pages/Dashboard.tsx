
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  Laptop, 
  Building2, 
  AlertTriangle,
  TrendingUp,
  Package,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface DashboardStats {
  totalPeople: number;
  activePeople: number;
  totalLicenses: number;
  expiringLicenses: number;
  totalAssets: number;
  availableAssets: number;
  totalTeams: number;
}

export const Dashboard = () => {
  const { toast } = useToast();
  const { currentOrganization } = useApp();
  const [stats, setStats] = useState<DashboardStats>({
    totalPeople: 0,
    activePeople: 0,
    totalLicenses: 0,
    expiringLicenses: 0,
    totalAssets: 0,
    availableAssets: 0,
    totalTeams: 0
  });
  const [expiringLicenses, setExpiringLicenses] = useState<any[]>([]);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [recentPeople, setRecentPeople] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOrganization) return;

    // Load data from localStorage
    const data = localStorage.getItem('app_database');
    if (data) {
      const parsed = JSON.parse(data);
      const orgId = currentOrganization.id;

      // Filter data by current organization
      const people = (parsed.people || []).filter((p: any) => p.organizationId === orgId);
      const licenses = (parsed.licenses || []).filter((l: any) => l.organizationId === orgId);
      const assets = (parsed.assets || []).filter((a: any) => a.organizationId === orgId);
      const teams = (parsed.teams || []).filter((t: any) => t.organizationId === orgId);

      // Calculate stats
      const activePeople = people.filter((p: any) => p.status === 'active');
      const expiring = licenses.filter((l: any) => {
        const expirationDate = new Date(l.expirationDate);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        return expirationDate <= thirtyDaysFromNow || l.status === 'expired' || l.status === 'expiring_soon';
      });
      const availableAssets = assets.filter((a: any) => a.status === 'available');

      setStats({
        totalPeople: people.length,
        activePeople: activePeople.length,
        totalLicenses: licenses.length,
        expiringLicenses: expiring.length,
        totalAssets: assets.length,
        availableAssets: availableAssets.length,
        totalTeams: teams.length
      });

      // Set recent data
      setExpiringLicenses(expiring.slice(0, 5));
      setRecentAssets(assets.slice(0, 5));
      setRecentPeople(activePeople.slice(0, 5));
    }
  }, [currentOrganization]);

  const handleQuickAction = (action: string) => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: `A ação "${action}" será implementada em breve.`,
    });
  };

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-readable-muted">Selecione uma organização para ver o dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão - {currentOrganization.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Pessoas"
          value={stats.totalPeople}
          subtitle={`${stats.activePeople} ativas`}
          icon={Users}
          color="blue"
          trend="up"
          trendValue={`${stats.activePeople}/${stats.totalPeople} ativas`}
        />
        
        <StatCard
          title="Licenças"
          value={stats.totalLicenses}
          subtitle={`${stats.expiringLicenses} com atenção`}
          icon={Shield}
          color="green"
          trend={stats.expiringLicenses > 0 ? "down" : "stable"}
          trendValue={stats.expiringLicenses > 0 ? `${stats.expiringLicenses} vencendo` : "Todas ok"}
        />
        
        <StatCard
          title="Ativos"
          value={stats.totalAssets}
          subtitle={`${stats.availableAssets} disponíveis`}
          icon={Laptop}
          color="purple"
          trend="up"
          trendValue={`${stats.availableAssets} livres`}
        />
        
        <StatCard
          title="Times"
          value={stats.totalTeams}
          subtitle="Departamentos"
          icon={Building2}
          color="yellow"
          trend="stable"
          trendValue="Ativos"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Pessoas Ativas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPeople.length > 0 ? (
                recentPeople.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-readable">{person.name}</p>
                      <p className="text-sm text-readable-muted">{person.teamName || 'Sem time'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-readable">{person.position || 'Sem cargo'}</p>
                      <p className="text-xs text-readable-muted">
                        {person.entryDate ? new Date(person.entryDate).toLocaleDateString('pt-BR') : 'Data não informada'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-readable-muted text-center py-4">Nenhuma pessoa encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Licenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Licenças com Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringLicenses.length > 0 ? (
                expiringLicenses.map((license) => (
                  <div key={license.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-readable">{license.name}</p>
                      <p className="text-sm text-readable-muted">{license.vendor}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={license.status === 'expired' ? 'destructive' : 'secondary'}>
                        {license.status === 'expired' ? 'Vencida' : 'Vencendo'}
                      </Badge>
                      <p className="text-xs text-readable-muted mt-1">
                        {new Date(license.expirationDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-readable-muted text-center py-4">Todas as licenças estão em dia</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Ativos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssets.length > 0 ? (
                recentAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-readable">{asset.name}</p>
                      <p className="text-sm text-readable-muted">{asset.serialNumber}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={asset.status === 'available' ? 'secondary' : 'default'}>
                        {asset.status === 'available' ? 'Disponível' : asset.status === 'allocated' ? 'Alocado' : asset.status}
                      </Badge>
                      <p className="text-xs text-readable-muted mt-1">
                        R$ {asset.value?.toLocaleString('pt-BR') || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-readable-muted text-center py-4">Nenhum ativo encontrado</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Nova Pessoa')}
              >
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-readable">Nova Pessoa</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Nova Licença')}
              >
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-readable">Nova Licença</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Novo Ativo')}
              >
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Laptop className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-readable">Novo Ativo</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 hover:bg-primary/10"
                onClick={() => handleQuickAction('Novo Time')}
              >
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Building2 className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-readable">Novo Time</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
