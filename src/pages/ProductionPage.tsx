import { useState } from 'react';
import { Factory, Plus, X, Check, Link2 } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock available entry lots
const availableLots = [
  { id: '1', lotNumber: 'ENT-2024-001', product: 'Harina de Trigo T-55', quantity: 500, unit: 'kg' },
  { id: '2', lotNumber: 'ENT-2024-002', product: 'Azúcar Blanco', quantity: 200, unit: 'kg' },
  { id: '3', lotNumber: 'ENT-2024-003', product: 'Levadura Fresca', quantity: 50, unit: 'kg' },
];

export default function ProductionPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    product: '',
    outputQuantity: '',
    unit: 'unidades',
    operator: '',
  });

  const toggleLot = (lotId: string) => {
    setSelectedLots(prev => 
      prev.includes(lotId) 
        ? prev.filter(id => id !== lotId)
        : [...prev, lotId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const batchNumber = `PROD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    toast({
      title: "Producción registrada",
      description: `Lote ${batchNumber} creado con ${selectedLots.length} materias primas`,
    });
    
    setTimeout(() => navigate('/'), 1000);
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
            
            <div className="space-y-2">
              {availableLots.map((lot) => {
                const isSelected = selectedLots.includes(lot.id);
                return (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => toggleLot(lot.id)}
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
                          {lot.lotNumber}
                        </p>
                        <p className="font-semibold text-foreground mt-1">
                          {lot.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lot.quantity} {lot.unit}
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
                );
              })}
            </div>
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
          >
            <Plus className="h-8 w-8" />
            <span>Crear Lote de Producción</span>
          </Button>
        </form>
      </main>
    </div>
  );
}
