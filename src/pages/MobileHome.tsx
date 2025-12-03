import { PackageOpen, Factory, PackageCheck, History, Monitor } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MainMenuButton } from '@/components/mobile/MainMenuButton';
import { Link } from 'react-router-dom';

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="TraceFood" />
      
      <main className="flex-1 p-4 flex flex-col">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <MainMenuButton
            icon={PackageOpen}
            label="Entrada"
            sublabel="Registrar recepción"
            to="/entrada"
            variant="primary"
          />
          <MainMenuButton
            icon={Factory}
            label="Producción"
            sublabel="Crear lote"
            to="/produccion"
            variant="accent"
          />
          <MainMenuButton
            icon={PackageCheck}
            label="Salida"
            sublabel="Expedir producto"
            to="/salida"
            variant="success"
          />
          <MainMenuButton
            icon={History}
            label="Historial"
            sublabel="Ver registros"
            to="/historial"
            variant="secondary"
          />
        </div>

        {/* Link to Admin Panel */}
        <Link
          to="/admin"
          className="mt-4 flex items-center justify-center gap-2 py-4 px-6 bg-muted rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <Monitor className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Panel de Control
          </span>
        </Link>

        {/* Timestamp */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground font-mono-industrial">
            {new Date().toLocaleString('es-ES', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
