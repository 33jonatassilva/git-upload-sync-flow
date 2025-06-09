
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockPeople } from '@/data/mockData';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Calendar, 
  Building2,
  Shield,
  Laptop,
  FileText,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';

export const People = () => {
  const [people] = useState(mockPeople);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePeople = people.filter(p => p.status === 'active');
  const inactivePeople = people.filter(p => p.status === 'inactive');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pessoas</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores da empresa</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Pessoa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePeople.length}</p>
                <p className="text-sm text-muted-foreground">Pessoas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inactivePeople.length}</p>
                <p className="text-sm text-muted-foreground">Pessoas Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{people.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
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
                placeholder="Buscar por nome, email ou time..."
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

      {/* People List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPeople.map((person) => (
          <Card key={person.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 gradient-bg rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{person.position}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                    {person.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{person.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{person.teamName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Entrada: {new Date(person.entryDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {person.exitDate && (
                    <div className="flex items-center space-x-2 text-sm text-rose-600">
                      <Calendar className="w-4 h-4" />
                      <span>Saída: {new Date(person.exitDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-muted/50">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-xs font-medium">{person.licenses.length}</p>
                    <p className="text-xs text-muted-foreground">Licenças</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="flex items-center justify-center mb-1">
                      <Laptop className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="text-xs font-medium">{person.assets.length}</p>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="w-4 h-4 text-violet-600" />
                    </div>
                    <p className="text-xs font-medium">{person.responsibilityTermUrl ? '✓' : '✗'}</p>
                    <p className="text-xs text-muted-foreground">Termo</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
