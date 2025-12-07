import { useState } from 'react';
import { Search, PackageOpen, Factory, PackageCheck, Calendar, Loader2 } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTraceabilityRecords, type RecordType } from '@/hooks/useTraceabilityRecords';

const typeConfig = {
  entry: { icon: PackageOpen, color: 'text-primary', bg: 'bg-primary/10', label: 'Entrada' },
  production: { icon: Factory, color: 'text-accent', bg: 'bg-accent/10', label: 'Producción' },
  output: { icon: PackageCheck, color: 'text-success', bg: 'bg-success/10', label: 'Salida' },
};

export default function HistoryPage() {
  const [filter, setFilter] = useState<RecordType>('all');
  const [search, setSearch] = useState('');
  const { records, loading } = useTraceabilityRecords();

  const filteredRecords = records.filter(record => {
    const matchesType = filter === 'all' || record.type === filter;
    const matchesSearch = 
      record.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
      record.product.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="Historial" showBack />
      
      <main className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lote o producto..."
              className="h-12 pl-12 bg-muted border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          {(['all', 'entry', 'production', 'output'] as RecordType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all",
                "border-2",
                filter === type 
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {type === 'all' ? 'Todos' : typeConfig[type].label}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
              <p>Cargando registros...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron registros</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const config = typeConfig[record.type as keyof typeof typeConfig];
              const Icon = config.icon;
              
              return (
                <div
                  key={record.id}
                  className="panel-industrial p-4 animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-3 rounded-xl", config.bg)}>
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono-industrial text-sm text-primary truncate">
                          {record.lotNumber}
                        </p>
                        {record.quantity && (
                          <span className="text-xs text-muted-foreground">
                            {record.quantity} {record.unit}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground mt-1 truncate">
                        {record.product}
                      </p>
                      {record.supplier && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {record.supplier}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.date.toLocaleDateString('es-ES', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
