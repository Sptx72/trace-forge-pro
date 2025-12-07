import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Filter, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useStock, type StockBalance } from '@/hooks/useStock';
import { useAuth } from '@/hooks/useAuth';

export default function InventoryPage() {
  const { fetchStockBalances } = useStock();
  const { user } = useAuth();
  const [stockBalances, setStockBalances] = useState<StockBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'production'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const loadStockBalances = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const balances = await fetchStockBalances(user.id);
      setStockBalances(balances);
    } catch (error) {
      console.error('Error loading stock balances:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchStockBalances, user]);

  useEffect(() => {
    loadStockBalances();
  }, [loadStockBalances]);

  const filteredBalances = stockBalances.filter(balance => {
    const matchesSearch = 
      balance.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      balance.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || balance.lot_type === filterType;
    
    const matchesAvailability = 
      !showOnlyAvailable || balance.available_balance > 0;
    
    return matchesSearch && matchesType && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Inventario y Stock</h1>
            </div>
          </div>
          <Badge variant="outline" className="font-mono-industrial">
            {filteredBalances.length} registros
          </Badge>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por lote o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter by Type */}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'entry' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('entry')}
              className={filterType === 'entry' ? 'bg-primary' : ''}
            >
              Materia Prima
            </Button>
            <Button
              variant={filterType === 'production' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('production')}
              className={filterType === 'production' ? 'bg-accent' : ''}
            >
              Producto Final
            </Button>
          </div>

          {/* Show only available */}
          <Button
            variant={showOnlyAvailable ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Solo con stock
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBalances.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay registros de stock disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    Nº Lote de Origen
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    Producto
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    Tipo de Stock
                  </th>
                  <th className="text-right p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    Saldo Disponible
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    Unidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map((balance) => (
                  <tr
                    key={balance.source_lot_id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4 font-mono-industrial text-sm">
                      {balance.lot_number}
                    </td>
                    <td className="p-4 font-medium">
                      {balance.product}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={balance.lot_type === 'entry' ? 'default' : 'secondary'}
                        className={
                          balance.lot_type === 'entry'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : 'bg-accent/20 text-accent border-accent/30'
                        }
                      >
                        {balance.lot_type === 'entry' ? 'Materia Prima' : 'Producto Final'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-mono-industrial font-bold">
                      <span className={
                        balance.available_balance === 0
                          ? 'text-muted-foreground'
                          : balance.available_balance < 10
                            ? 'text-warning'
                            : 'text-success'
                      }>
                        {balance.available_balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-sm text-muted-foreground">
                      {balance.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
