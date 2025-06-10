
import { Building2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const Header = () => {
  const { currentOrganization } = useApp();

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Sistema de Gestão
            </h1>
            {currentOrganization && (
              <p className="text-sm text-muted-foreground">
                {currentOrganization.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
