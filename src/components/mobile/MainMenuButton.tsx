import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MainMenuButtonProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  to: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success';
}

export function MainMenuButton({ 
  icon: Icon, 
  label, 
  sublabel, 
  to, 
  variant = 'secondary' 
}: MainMenuButtonProps) {
  const variantStyles = {
    primary: 'bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50',
    secondary: 'bg-secondary border-border hover:bg-secondary/80 hover:border-primary/30',
    accent: 'bg-accent/10 border-accent/30 hover:bg-accent/20 hover:border-accent/50',
    success: 'bg-success/10 border-success/30 hover:bg-success/20 hover:border-success/50',
  };

  const iconStyles = {
    primary: 'text-primary bg-primary/20',
    secondary: 'text-foreground bg-muted',
    accent: 'text-accent bg-accent/20',
    success: 'text-success bg-success/20',
  };

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6",
        "rounded-2xl border-2 transition-all duration-200",
        "active:scale-[0.97] active:brightness-95",
        "min-h-[160px]",
        variantStyles[variant]
      )}
    >
      <div className={cn(
        "p-4 rounded-xl",
        iconStyles[variant]
      )}>
        <Icon className="h-10 w-10" strokeWidth={2} />
      </div>
      <div className="text-center">
        <span className="block text-lg font-bold text-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="block text-sm text-muted-foreground mt-1">
          {sublabel}
        </span>
      </div>
    </Link>
  );
}
