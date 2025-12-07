import { useState, useEffect } from 'react';
import { Factory, Plus, Check, Link2, Loader2 } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStock, type StockBalance } from '@/hooks/useStock';

interface SelectedLot {
  lotId: string;
  lotNumber: string;
  product: string;
  unit: string;
  availableBalance: number;
  consumeQuantity: string;
}

export default function ProductionPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchAvailableEntryLots, consumeEntryStock, registerProductionStock } = useStock();
  
  const [availableLots, setAvailableLots] = useState<StockBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLots, setSelectedLots] = useState<SelectedLot[]>([]);
  const [formData, setFormData] = useState({
    product: '',
    outputQuantity: '',
    unit: 'unidades',
    operator: '',
  });

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const lots = await fetchAvailableEntryLots();
      setAvailableLots(lots);
    } catch (error) {
      console.error('Error fetching entry lots:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los lotes de entrada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLot = (lot: StockBalance) => {
    setSelectedLots(prev => {
      const exists = prev.find(l => l.lotId === lot.source_lot_id);
      if (exists) {
        return prev.filter(l => l.lotId !== lot.source_lot_id);
      }
      return [...prev, {
        lotId: lot.source_lot_id,
        lotNumber: lot.lot_number,
        product: lot.product,
        unit: lot.unit,
        availableBalance: lot.available_balance,
        consumeQuantity: '',
      }];
    });
  };

  const updateConsumeQuantity = (lotId: string, quantity: string) => {
    setSelectedLots(prev => prev.map(l => 
      l.lotId === lotId ? { ...l, consumeQuantity: quantity } : l
    ));
  };

  const validateConsumptions = (): boolean => {
    for (const lot of selectedLots) {
      const qty = parseFloat(lot.consumeQuantity);
      if (isNaN(qty) || qty <= 0) {
        toast({
          title: "Error",
          description: `Ingresa una cantidad válida para el lote ${lot.lotNumber}`,
          variant: "destructive",
        });
        return false;
      }
      if (qty > lot.availableBalance) {
        toast({
          title: "Error",
          description: `La cantidad para ${lot.lotNumber} excede el saldo disponible (${lot.availableBalance} ${lot.unit})`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLots.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un lote de entrada",
        variant: "destructive",
      });
      return;
    }

    if (!formData.product || !formData.outputQuantity || !formData.operator) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!validateConsumptions()) {
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const batchNumber = `PROD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const outputQuantity = parseFloat(formData.outputQuantity);
    
    try {
      // Get user's obrador_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('obrador_id')
        .eq('user_id', user.id)
        .single();

      // Create production batch
      const { data: productionBatch, error } = await supabase.from('production_batches').insert({
        user_id: user.id,
        obrador_id: profile?.obrador_id || null,
        batch_number: batchNumber,
        product: formData.product,
        quantity: outputQuantity,
        unit: formData.unit,
        operator: formData.operator,
        input_lot_ids: selectedLots.map(l => l.lotId),
      }).select().single();

      if (error) throw error;

      // Register positive stock for new production
      await registerProductionStock(
        productionBatch.id,
        batchNumber,
        formData.product,
        outputQuantity,
        formData.unit,
        user.id
      );

      // Register negative stock movements for consumed entry lots
      const consumptions = selectedLots.map(l => ({
        lotId: l.lotId,
        lotNumber: l.lotNumber,
        product: l.product,
        quantity: parseFloat(l.consumeQuantity),
        unit: l.unit,
      }));

      await consumeEntryStock(consumptions, productionBatch.id, user.id);

      toast({
        title: "Producción registrada",
        description: `Lote ${batchNumber} creado con ${selectedLots.length} materias primas`,
      });
      
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Error creating production batch:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la producción",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="Producción" showBack />
      
      <main className="flex-1 p-4 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Lots Selection */}
          <div className="panel-industrial p-4">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="h-5 w-5 text-primary" />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Lotes de Entrada ({selectedLots.length} seleccionados)
              </Label>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableLots.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay lotes de entrada con stock disponible
              </p>
            ) : (
              <div className="space-y-2">
                {availableLots.map((lot) => {
                  const selected = selectedLots.find(l => l.lotId === lot.source_lot_id);
                  const isSelected = !!selected;
                  return (
                    <div key={lot.source_lot_id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleLot(lot)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          "active:scale-[0.98]",
                          isSelected 
                            ? "bg-primary/10 border-primary" 
                            : "bg-muted border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono-industrial text-sm text-primary">
                              {lot.lot_number}
                            </p>
                            <p className="font-semibold text-foreground mt-1">
                              {lot.product}
                            </p>
                            <p className="text-sm text-success font-bold">
                              Disponible: {lot.available_balance.toFixed(2)} {lot.unit}
                            </p>
                          </div>
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground"
                          )}>
                            {isSelected && <Check className="h-5 w-5 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                      
                      {/* Quantity to consume input */}
                      {isSelected && selected && (
                        <div className="ml-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <Label className="text-xs text-muted-foreground uppercase">
                            Cantidad a Consumir *
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={selected.availableBalance}
                              value={selected.consumeQuantity}
                              onChange={(e) => updateConsumeQuantity(lot.source_lot_id, e.target.value)}
                              placeholder="0"
                              className="h-12 text-lg bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                            />
                            <div className="h-12 px-4 rounded-lg bg-muted border-2 border-border flex items-center font-bold text-muted-foreground">
                              {lot.unit.toUpperCase()}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Máximo: {selected.availableBalance.toFixed(2)} {lot.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Output Product */}
          <div className="panel-industrial p-4">
            <div className="flex items-center gap-2 mb-4">
              <Factory className="h-5 w-5 text-accent" />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Producto de Salida
              </Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="product" className="text-xs text-muted-foreground uppercase">
                  Nombre del Producto *
                </Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  placeholder="Ej: Pan de Molde Integral"
                  className="mt-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary"
                />
              </div>

              <div>
                <Label htmlFor="quantity" className="text-xs text-muted-foreground uppercase">
                  Cantidad Producida *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.outputQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, outputQuantity: e.target.value }))}
                    placeholder="0"
                    className="flex-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="h-14 px-4 rounded-lg bg-muted border-2 border-border text-foreground font-bold"
                  >
                    <option value="unidades">UND</option>
                    <option value="kg">KG</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="operator" className="text-xs text-muted-foreground uppercase">
                  Operario *
                </Label>
                <Input
                  id="operator"
                  value={formData.operator}
                  onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))}
                  placeholder="Nombre del operario"
                  className="mt-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="industrial-accent"
            size="industrial"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Plus className="h-8 w-8" />
            )}
            <span>{submitting ? 'Registrando...' : 'Crear Lote de Producción'}</span>
          </Button>
        </form>
      </main>
    </div>
  );
}
