
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDashboardStats, mockLicenses, mockAssets, mockPeople } from '@/data/mockData';
import { 
  Users, 
  Shield, 
  Laptop, 
  Building2, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Dashboard = () => {
  const stats = mockDashboardStats;
  const expiringLicenses = mockLicenses.filter(l => l.status === 'expiring_soon' || l.status === 'expired');
  const recentAssets = mockAssets.slice(0, 5);
  const recentPeople = mockPeople.filter(p => p.status === 'active').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão</p>
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
          trendValue="+2 este mês"
        />
        
        <StatCard
          title="Licenças"
          value={stats.totalLicenses}
          subtitle={`${stats.expiringLicenses} vencendo`}
          icon={Shield}
          color="green"
          trend="stable"
          trendValue="Estável"
        />
        
        <StatCard
          title="Ativos"
          value={stats.totalAssets}
          subtitle={`${stats.availableAssets} disponíveis`}
          icon={Laptop}
          color="purple"
          trend="up"
          trendValue="+5 novos"
        />
        
        <StatCard
          title="Times"
          value={stats.totalTeams}
          subtitle="Departamentos"
          icon={Building2}
          color="yellow"
          trend="stable"
          trendValue="Estável"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent People */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Pessoas Ativas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPeople.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-muted-foreground">{person.teamName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{person.position}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(person.entryDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Licenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Licenças com Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringLicenses.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{license.name}</p>
                    <p className="text-sm text-muted-foreground">{license.vendor}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={license.status === 'expired' ? 'destructive' : 'secondary'}>
                      {license.status === 'expired' ? 'Vencida' : 'Vencendo'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(license.expirationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ativos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.serialNumber}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={asset.status === 'available' ? 'secondary' : 'default'}>
                      {asset.status === 'available' ? 'Disponível' : 'Alocado'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {asset.value.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Nova Pessoa</p>
              </button>
              <button className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Nova Licença</p>
              </button>
              <button className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-center">
                <Laptop className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Novo Ativo</p>
              </button>
              <button className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-center">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Novo Time</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
