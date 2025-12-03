import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
}

export function MobileHeader({ title, showBack = false }: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-border safe-top">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBack && !isHome && (
            <Button 
              variant="ghost" 
              size="icon-lg"
              onClick={() => navigate(-1)}
              className="text-foreground"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="status-dot bg-success" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Online
          </span>
        </div>
      </div>
    </header>
  );
}
