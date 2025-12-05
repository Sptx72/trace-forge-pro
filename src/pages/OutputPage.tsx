import { useState, useEffect } from 'react';
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

interface ProductionBatch {
  id: string;
  batch_number: string;
  product: string;
  quantity: number;
  unit: string;
}

export default function OutputPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    destination: '',
  });

  useEffect(() => {
    fetchProductionBatches();
  }, []);

  const fetchProductionBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('production_batches')
        .select('id, batch_number, product, quantity, unit')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductionBatches(data || []);
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
  };

  const selectedBatchData = productionBatches.find(b => b.id === selectedBatch);

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
      const { error } = await supabase.from('output_lots').insert({
        user_id: user.id,
        lot_number: lotNumber,
        production_batch_id: selectedBatch,
        quantity: parseFloat(formData.quantity),
        unit: selectedBatchData?.unit || 'unidades',
        destination: formData.destination,
      });

      if (error) throw error;

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
                No hay lotes de producción disponibles
              </p>
            ) : (
              <div className="space-y-2">
                {productionBatches.map((batch) => {
                  const isSelected = selectedBatch === batch.id;
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => setSelectedBatch(batch.id)}
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
                            {batch.batch_number}
                          </p>
                          <p className="font-semibold text-foreground mt-1">
                            {batch.product}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Disponible: {batch.quantity} {batch.unit}
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
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="0"
                    max={selectedBatchData?.quantity}
                    className="flex-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                  />
                  <div className="h-14 px-4 rounded-lg bg-muted border-2 border-border flex items-center font-bold text-muted-foreground">
                    {selectedBatchData?.unit || 'UND'}
                  </div>
                </div>
                {selectedBatchData && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo disponible: {selectedBatchData.quantity} {selectedBatchData.unit}
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
