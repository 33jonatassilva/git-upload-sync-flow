
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { License, Person } from '@/types';
import { peopleService } from '@/services/peopleService';
import { licensesService } from '@/services/licensesService';
import { useApp } from '@/contexts/AppContext';
import { Users, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface ManageLicenseDialogProps {
  license: License;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const ManageLicenseDialog = ({ license, open, onOpenChange, onUpdate }: ManageLicenseDialogProps) => {
  const { currentOrganization } = useApp();
  const [people, setPeople] = useState<Person[]>([]);
  const [licenseCode, setLicenseCode] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentOrganization && open) {
      const allPeople = peopleService.getAll(currentOrganization.id);
      setPeople(allPeople);
      setSelectedPeople(new Set(license.assignedTo));
    }
  }, [currentOrganization, open, license.assignedTo]);

  const handlePersonToggle = (personId: string) => {
    const newSelected = new Set(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else {
      if (newSelected.size >= license.totalQuantity) {
        toast.error('Limite de licenças atingido');
        return;
      }
      newSelected.add(personId);
    }
    setSelectedPeople(newSelected);
  };

  const handleSave = () => {
    // Update license assignments
    const currentAssigned = new Set(license.assignedTo);
    const newAssigned = selectedPeople;

    // Remove unassigned users
    currentAssigned.forEach(userId => {
      if (!newAssigned.has(userId)) {
        licensesService.unassignFromUser(license.id, userId);
      }
    });

    // Add newly assigned users
    newAssigned.forEach(userId => {
      if (!currentAssigned.has(userId)) {
        licensesService.assignToUser(license.id, userId);
      }
    });

    toast.success('Atribuições atualizadas com sucesso!');
    onUpdate();
    onOpenChange(false);
  };

  const assignedPeople = people.filter(person => selectedPeople.has(person.id));
  const availablePeople = people.filter(person => !selectedPeople.has(person.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Licença: {license.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* License Code */}
          <div>
            <Label htmlFor="license-code">Código da Licença (Opcional)</Label>
            <Input
              id="license-code"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value)}
              placeholder="Ex: ABC123-DEF456-GHI789"
            />
          </div>

          {/* Usage Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Resumo de Uso</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total de Licenças</p>
                <p className="font-bold text-lg">{license.totalQuantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Em Uso</p>
                <p className="font-bold text-lg text-blue-600">{selectedPeople.size}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Disponíveis</p>
                <p className="font-bold text-lg text-green-600">{license.totalQuantity - selectedPeople.size}</p>
              </div>
            </div>
          </div>

          {/* Assigned People */}
          {assignedPeople.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Pessoas Atribuídas ({assignedPeople.length})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {assignedPeople.map(person => (
                  <div key={person.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePersonToggle(person.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available People */}
          {availablePeople.length > 0 && selectedPeople.size < license.totalQuantity && (
            <div>
              <h3 className="font-medium mb-3">Pessoas Disponíveis</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availablePeople.map(person => (
                  <div key={person.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">{person.email}</p>
                      {person.teamName && (
                        <Badge variant="outline" className="text-xs">{person.teamName}</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePersonToggle(person.id)}
                      disabled={selectedPeople.size >= license.totalQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Atribuições
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
