import { useState, useEffect, useCallback } from 'react';
import { PackageCheck, Truck, Check, Building2, Loader2 } from 'lucide-react';
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

export default function OutputPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchAvailableProductionBatches, consumeProductionStock } = useStock();
  
  const [productionBatches, setProductionBatches] = useState<StockBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<StockBalance | null>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    destination: '',
  });

  const fetchBatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const batches = await fetchAvailableProductionBatches(user.id);
      setProductionBatches(batches);
    } catch (error) {
      console.error('Error fetching production batches:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los lotes de producción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAvailableProductionBatches, toast, user]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBatch) {
      toast({
        title: "Error",
        description: "Selecciona un lote de producción",
        variant: "destructive",
      });
      return;
    }

    if (!formData.quantity || !formData.destination) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const expeditQuantity = parseFloat(formData.quantity);
    
    if (expeditQuantity <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    if (expeditQuantity > selectedBatch.available_balance) {
      toast({
        title: "Error",
        description: `La cantidad excede el saldo disponible (${selectedBatch.available_balance.toFixed(2)} ${selectedBatch.unit})`,
        variant: "destructive",
      });
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
    const lotNumber = `SAL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    try {
      // Get user's obrador_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('obrador_id')
        .eq('user_id', user.id)
        .single();

      // Create output lot
      const { data: outputLot, error } = await supabase.from('output_lots').insert({
        user_id: user.id,
        obrador_id: profile?.obrador_id || null,
        lot_number: lotNumber,
        production_batch_id: selectedBatch.source_lot_id,
        quantity: expeditQuantity,
        unit: selectedBatch.unit,
        destination: formData.destination,
      }).select().single();

      if (error) throw error;

      // Register negative stock movement
      await consumeProductionStock(
        selectedBatch.source_lot_id,
        selectedBatch.lot_number,
        selectedBatch.product,
        expeditQuantity,
        selectedBatch.unit,
        outputLot.id,
        user.id
      );

      toast({
        title: "Salida registrada",
        description: `Lote ${lotNumber} expedido a ${formData.destination}`,
      });
      
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('Error creating output lot:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la salida",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="Registro de Salida" showBack />
      
      <main className="flex-1 p-4 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch Selection */}
          <div className="panel-industrial p-4">
            <div className="flex items-center gap-2 mb-4">
              <PackageCheck className="h-5 w-5 text-success" />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Seleccionar Lote de Producción
              </Label>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-success" />
              </div>
            ) : productionBatches.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay lotes de producción con stock disponible
              </p>
            ) : (
              <div className="space-y-2">
                {productionBatches.map((batch) => {
                  const isSelected = selectedBatch?.source_lot_id === batch.source_lot_id;
                  return (
                    <button
                      key={batch.source_lot_id}
                      type="button"
                      onClick={() => setSelectedBatch(batch)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        "active:scale-[0.98]",
                        isSelected 
                          ? "bg-success/10 border-success" 
                          : "bg-muted border-border hover:border-success/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono-industrial text-sm text-success">
                            {batch.lot_number}
                          </p>
                          <p className="font-semibold text-foreground mt-1">
                            {batch.product}
                          </p>
                          <p className="text-sm text-success font-bold">
                            Disponible: {batch.available_balance.toFixed(2)} {batch.unit}
                          </p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected 
                            ? "bg-success border-success" 
                            : "border-muted-foreground"
                        )}>
                          {isSelected && <Check className="h-5 w-5 text-success-foreground" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Output Details */}
          <div className="panel-industrial p-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Detalles de Expedición
              </Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity" className="text-xs text-muted-foreground uppercase">
                  Cantidad a Expedir *
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                    max={selectedBatch?.available_balance}
                    className="flex-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                  />
                  <div className="h-14 px-4 rounded-lg bg-muted border-2 border-border flex items-center font-bold text-muted-foreground">
                    {selectedBatch?.unit?.toUpperCase() || 'UND'}
                  </div>
                </div>
                {selectedBatch && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: {selectedBatch.available_balance.toFixed(2)} {selectedBatch.unit}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="destination" className="text-xs text-muted-foreground uppercase">
                  Destino / Cliente *
                </Label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Nombre del cliente o destino"
                    className="h-14 text-lg bg-muted border-2 border-border focus:border-primary pl-12"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="industrial"
            size="industrial"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Truck className="h-8 w-8" />
            )}
            <span>{submitting ? 'Registrando...' : 'Registrar Salida'}</span>
          </Button>
        </form>
      </main>
    </div>
  );
}
