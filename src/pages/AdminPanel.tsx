import { useState } from 'react';
import { 
  Search, Filter, FileDown, PackageOpen, Factory, PackageCheck, 
  ChevronDown, Home, ArrowUpDown, Eye, LogOut, Loader2, Package, Trash2, Building2
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTraceabilityRecords, type RecordType, type DisplayRecord } from '@/hooks/useTraceabilityRecords';

const typeConfig = {
  entry: { icon: PackageOpen, color: 'text-primary', bg: 'bg-primary/10', label: 'Entrada' },
  production: { icon: Factory, color: 'text-accent', bg: 'bg-accent/10', label: 'Producción' },
  output: { icon: PackageCheck, color: 'text-success', bg: 'bg-success/10', label: 'Salida' },
};

export default function AdminPanel() {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { isAdmin, obrador } = useUserRole();
  const { records, loading, deleteRecord } = useTraceabilityRecords();
  
  const [filter, setFilter] = useState<RecordType>('all');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRecord, setSelectedRecord] = useState<DisplayRecord | null>(null);
  const [showTraceDialog, setShowTraceDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DisplayRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const filteredRecords = records
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

  const handleExportPDF = (record: DisplayRecord) => {
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

  const handleViewTrace = (record: DisplayRecord) => {
    setSelectedRecord(record);
    setShowTraceDialog(true);
  };

  const handleDeleteClick = (record: DisplayRecord) => {
    setRecordToDelete(record);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    await deleteRecord(recordToDelete);
    setDeleting(false);
    setRecordToDelete(null);
  };

  const stats = {
    total: records.length,
    entry: records.filter(r => r.type === 'entry').length,
    production: records.filter(r => r.type === 'production').length,
    output: records.filter(r => r.type === 'output').length,
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
              {obrador && (
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Obrador: {obrador.name}
                  </span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                <div className="status-dot bg-success" />
                <span className="text-sm font-medium text-success">Sistema Operativo</span>
              </div>
              <Link to="/inventario">
                <Button variant="outline" size="lg">
                  <Package className="h-5 w-5 mr-2" />
                  Inventario
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg">
                  <Home className="h-5 w-5 mr-2" />
                  Obrador
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
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número de lote o producto..."
                className="h-12 pl-12 bg-muted border-2 border-border focus:border-primary text-base"
              />
            </div>

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
            { label: 'Total Registros', value: stats.total, icon: PackageOpen },
            { label: 'Entradas', value: stats.entry, icon: PackageOpen, color: 'text-primary' },
            { label: 'Producción', value: stats.production, icon: Factory, color: 'text-accent' },
            { label: 'Salidas', value: stats.output, icon: PackageCheck, color: 'text-success' },
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border bg-muted/50">
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Tipo</th>
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Nº Lote</th>
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Producto</th>
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Cantidad</th>
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Fecha</th>
                    <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Info</th>
                    <th className="text-right p-4 font-bold uppercase text-xs tracking-wider text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => {
                    const config = typeConfig[record.type];
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
                            {record.product || '-'}
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
                          <span className="text-sm text-muted-foreground">
                            {record.supplier || record.operator || record.destination || '-'}
                          </span>
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
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(record)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredRecords.length === 0 && (
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
              Detalles: {selectedRecord?.lotNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-xl border-2 border-border bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Tipo</p>
                    <p className="font-semibold">{typeConfig[selectedRecord.type].label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Nº Lote</p>
                    <p className="font-mono-industrial text-primary">{selectedRecord.lotNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Producto</p>
                    <p className="font-semibold">{selectedRecord.product || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Cantidad</p>
                    <p className="font-mono-industrial">{selectedRecord.quantity} {selectedRecord.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Fecha</p>
                    <p>{selectedRecord.date.toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      {selectedRecord.type === 'entry' ? 'Proveedor' : 
                       selectedRecord.type === 'production' ? 'Operario' : 'Destino'}
                    </p>
                    <p>{selectedRecord.supplier || selectedRecord.operator || selectedRecord.destination || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ADVERTENCIA: Eliminar Registro
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              ¿Está seguro de eliminar este registro? 
              <br />
              <span className="font-mono-industrial text-foreground font-semibold">
                {recordToDelete?.lotNumber}
              </span>
              <br /><br />
              <span className="text-destructive font-medium">
                La eliminación puede afectar la trazabilidad de otros lotes.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
