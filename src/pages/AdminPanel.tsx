import { useState } from 'react';
import { 
  Search, Filter, FileDown, PackageOpen, Factory, PackageCheck, 
  ChevronDown, Home, ArrowUpDown, Eye, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type RecordType = 'all' | 'entry' | 'production' | 'output';

// Extended mock data for admin panel
const mockRecords = [
  { id: '1', type: 'entry', lotNumber: 'ENT-2024-001', product: 'Harina de Trigo T-55', supplier: 'Molinos del Sur S.A.', quantity: 500, unit: 'kg', date: new Date('2024-01-15'), status: 'used' },
  { id: '2', type: 'entry', lotNumber: 'ENT-2024-002', product: 'Azúcar Blanco', supplier: 'Azucarera Nacional', quantity: 200, unit: 'kg', date: new Date('2024-01-16'), status: 'verified' },
  { id: '3', type: 'entry', lotNumber: 'ENT-2024-003', product: 'Levadura Fresca', supplier: 'Levaduras Premium', quantity: 50, unit: 'kg', date: new Date('2024-01-17'), status: 'pending' },
  { id: '4', type: 'production', lotNumber: 'PROD-2024-001', product: 'Pan de Molde Integral', operator: 'Juan García', quantity: 300, unit: 'unidades', date: new Date('2024-01-18'), status: 'completed', inputLots: ['ENT-2024-001', 'ENT-2024-002'] },
  { id: '5', type: 'output', lotNumber: 'SAL-2024-001', product: 'Pan de Molde Integral', destination: 'Supermercados Norte', quantity: 150, unit: 'unidades', date: new Date('2024-01-19'), status: 'shipped', productionLot: 'PROD-2024-001' },
  { id: '6', type: 'production', lotNumber: 'PROD-2024-002', product: 'Croissants', operator: 'María López', quantity: 200, unit: 'unidades', date: new Date('2024-01-20'), status: 'completed', inputLots: ['ENT-2024-001', 'ENT-2024-002', 'ENT-2024-003'] },
];

const typeConfig = {
  entry: { icon: PackageOpen, color: 'text-primary', bg: 'bg-primary/10', label: 'Entrada' },
  production: { icon: Factory, color: 'text-accent', bg: 'bg-accent/10', label: 'Producción' },
  output: { icon: PackageCheck, color: 'text-success', bg: 'bg-success/10', label: 'Salida' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-warning', label: 'Pendiente' },
  verified: { color: 'bg-success', label: 'Verificado' },
  used: { color: 'bg-muted-foreground', label: 'Usado' },
  'in-progress': { color: 'bg-info', label: 'En proceso' },
  completed: { color: 'bg-success', label: 'Completado' },
  ready: { color: 'bg-info', label: 'Listo' },
  shipped: { color: 'bg-primary', label: 'Enviado' },
  delivered: { color: 'bg-success', label: 'Entregado' },
};

export default function AdminPanel() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const [filter, setFilter] = useState<RecordType>('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<typeof mockRecords[0] | null>(null);
  const [showTraceDialog, setShowTraceDialog] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const filteredRecords = mockRecords
    .filter(record => {
      const matchesType = filter === 'all' || record.type === filter;
      const matchesSearch = 
        record.lotNumber.toLowerCase().includes(search.toLowerCase()) ||
        record.product.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });

  const handleExportPDF = (record: typeof mockRecords[0]) => {
    // Simulated PDF export
    toast({
      title: "Exportando PDF",
      description: `Generando informe de trazabilidad para ${record.lotNumber}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "PDF Generado",
        description: `Informe de ${record.lotNumber} descargado correctamente`,
      });
    }, 1500);
  };

  const handleViewTrace = (record: typeof mockRecords[0]) => {
    setSelectedRecord(record);
    setShowTraceDialog(true);
  };

  // Build traceability chain for selected record
  const getTraceabilityChain = () => {
    if (!selectedRecord) return [];
    
    const chain: typeof mockRecords = [];
    
    if (selectedRecord.type === 'output') {
      chain.push(selectedRecord);
      // Find production batch
      const prodLot = mockRecords.find(r => 
        r.type === 'production' && r.lotNumber === (selectedRecord as any).productionLot
      );
      if (prodLot) {
        chain.unshift(prodLot);
        // Find entry lots
        const inputLots = (prodLot as any).inputLots || [];
        inputLots.forEach((lotNum: string) => {
          const entryLot = mockRecords.find(r => r.lotNumber === lotNum);
          if (entryLot) chain.unshift(entryLot);
        });
      }
    } else if (selectedRecord.type === 'production') {
      // Find entry lots
      const inputLots = (selectedRecord as any).inputLots || [];
      inputLots.forEach((lotNum: string) => {
        const entryLot = mockRecords.find(r => r.lotNumber === lotNum);
        if (entryLot) chain.push(entryLot);
      });
      chain.push(selectedRecord);
      // Find outputs
      const outputs = mockRecords.filter(r => 
        r.type === 'output' && (r as any).productionLot === selectedRecord.lotNumber
      );
      chain.push(...outputs);
    } else {
      chain.push(selectedRecord);
    }
    
    return chain;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b-2 border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-10 bg-primary rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Panel de Control
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de Trazabilidad Alimentaria
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                <div className="status-dot bg-success" />
                <span className="text-sm font-medium text-success">Sistema Operativo</span>
              </div>
              <Link to="/">
                <Button variant="outline" size="lg">
                  <Home className="h-5 w-5 mr-2" />
                  Volver al Obrador
                </Button>
              </Link>
              <Button variant="industrial-outline" size="lg" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {/* Filters Bar */}
        <div className="panel-industrial p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número de lote o producto..."
                className="h-12 pl-12 bg-muted border-2 border-border focus:border-primary text-base"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="min-w-[160px]">
                  <Filter className="h-5 w-5 mr-2" />
                  {filter === 'all' ? 'Todos los tipos' : typeConfig[filter].label}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  Todos los tipos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('entry')}>
                  <PackageOpen className="h-4 w-4 mr-2 text-primary" />
                  Entradas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('production')}>
                  <Factory className="h-4 w-4 mr-2 text-accent" />
                  Producción
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('output')}>
                  <PackageCheck className="h-4 w-4 mr-2 text-success" />
                  Salidas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Button */}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-5 w-5 mr-2" />
              {sortOrder === 'desc' ? 'Más reciente' : 'Más antiguo'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Registros', value: mockRecords.length, icon: PackageOpen },
            { label: 'Entradas', value: mockRecords.filter(r => r.type === 'entry').length, icon: PackageOpen, color: 'text-primary' },
            { label: 'Producción', value: mockRecords.filter(r => r.type === 'production').length, icon: Factory, color: 'text-accent' },
            { label: 'Salidas', value: mockRecords.filter(r => r.type === 'output').length, icon: PackageCheck, color: 'text-success' },
          ].map((stat, i) => (
            <div key={i} className="panel-industrial p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className={cn("text-3xl font-bold font-mono-industrial mt-1", stat.color || 'text-foreground')}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={cn("h-8 w-8 opacity-50", stat.color || 'text-muted-foreground')} />
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="panel-industrial overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Tipo</th>
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Nº Lote</th>
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Producto</th>
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Cantidad</th>
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Fecha</th>
                  <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Estado</th>
                  <th className="text-right p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const config = typeConfig[record.type as keyof typeof typeConfig];
                  const status = statusConfig[record.status] || { color: 'bg-muted-foreground', label: record.status };
                  const Icon = config.icon;
                  
                  return (
                    <tr 
                      key={record.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full", config.bg)}>
                          <Icon className={cn("h-4 w-4", config.color)} />
                          <span className={cn("text-sm font-medium", config.color)}>
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono-industrial text-primary">
                          {record.lotNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground">
                          {record.product}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono-industrial text-foreground">
                          {record.quantity} {record.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-muted-foreground">
                          {record.date.toLocaleDateString('es-ES', { 
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", status.color)} />
                          <span className="text-sm text-muted-foreground">
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTrace(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="industrial-outline" 
                            size="sm"
                            onClick={() => handleExportPDF(record)}
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron registros</p>
            </div>
          )}
        </div>
      </main>

      {/* Traceability Dialog */}
      <Dialog open={showTraceDialog} onOpenChange={setShowTraceDialog}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full" />
              Trazabilidad: {selectedRecord?.lotNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {getTraceabilityChain().map((record, index) => {
              const config = typeConfig[record.type as keyof typeof typeConfig];
              const Icon = config.icon;
              
              return (
                <div key={record.id} className="relative">
                  {index > 0 && (
                    <div className="absolute left-6 -top-4 w-0.5 h-4 bg-border" />
                  )}
                  <div className={cn(
                    "p-4 rounded-xl border-2",
                    selectedRecord?.id === record.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-muted/30"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", config.bg)}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-mono-industrial text-sm text-primary">
                            {record.lotNumber}
                          </p>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            config.bg, config.color
                          )}>
                            {config.label}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground mt-1">
                          {record.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.quantity} {record.unit} • {record.date.toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowTraceDialog(false)}>
              Cerrar
            </Button>
            <Button 
              variant="industrial"
              onClick={() => selectedRecord && handleExportPDF(selectedRecord)}
            >
              <FileDown className="h-5 w-5 mr-2" />
              Exportar PDF Completo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
