import { useState, useRef } from 'react';
import { Camera, Upload, QrCode, Check, X } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function EntryPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    product: '',
    supplier: '',
    quantity: '',
    unit: 'kg',
    barcode: '',
    deliveryNotePhoto: null as string | null,
  });
  
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulated scan - in production would use camera API
    setTimeout(() => {
      const mockBarcode = `84${Math.floor(10000000000 + Math.random() * 90000000000)}`;
      setFormData(prev => ({ ...prev, barcode: mockBarcode }));
      setIsScanning(false);
      toast({
        title: "Código escaneado",
        description: `Código: ${mockBarcode}`,
      });
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, deliveryNotePhoto: reader.result as string }));
        toast({
          title: "Foto subida",
          description: "Albarán adjuntado correctamente",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product || !formData.supplier || !formData.quantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Generate lot number
    const lotNumber = `ENT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    
    toast({
      title: "Entrada registrada",
      description: `Lote ${lotNumber} creado correctamente`,
    });
    
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="Registro de Entrada" showBack />
      
      <main className="flex-1 p-4 overflow-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scanner Section - Most Prominent */}
          <div className="panel-industrial p-4">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Escanear Código
            </Label>
            <Button
              type="button"
              variant="industrial"
              size="industrial-xl"
              className="w-full glow-pulse"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <QrCode className="h-12 w-12 animate-pulse" />
                    <div className="scan-line" />
                  </div>
                  <span>Escaneando...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-12 w-12" />
                  <span>Escanear QR / Código</span>
                </div>
              )}
            </Button>
            
            {formData.barcode && (
              <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="font-mono-industrial text-success">{formData.barcode}</span>
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="panel-industrial p-4">
            <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Foto del Albarán
            </Label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <Button
              type="button"
              variant="industrial-secondary"
              size="industrial"
              className="w-full"
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="h-8 w-8" />
              <span>{formData.deliveryNotePhoto ? 'Cambiar Foto' : 'Subir Foto'}</span>
            </Button>
            
            {formData.deliveryNotePhoto && (
              <div className="mt-3 relative">
                <img 
                  src={formData.deliveryNotePhoto} 
                  alt="Albarán" 
                  className="w-full h-32 object-cover rounded-lg border-2 border-success/30"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, deliveryNotePhoto: null }))}
                  className="absolute top-2 right-2 p-1 bg-destructive rounded-full"
                >
                  <X className="h-4 w-4 text-destructive-foreground" />
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="panel-industrial p-4">
              <Label htmlFor="product" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Producto *
              </Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                placeholder="Nombre del producto"
                className="mt-2 h-14 text-lg bg-muted border-2 border-border focus:border-primary"
              />
            </div>

            <div className="panel-industrial p-4">
              <Label htmlFor="supplier" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Proveedor *
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                placeholder="Nombre del proveedor"
                className="mt-2 h-14 text-lg bg-muted border-2 border-border focus:border-primary"
              />
            </div>

            <div className="panel-industrial p-4">
              <Label htmlFor="quantity" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Cantidad *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  className="flex-1 h-14 text-lg bg-muted border-2 border-border focus:border-primary font-mono-industrial"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="h-14 px-4 rounded-lg bg-muted border-2 border-border text-foreground font-bold"
                >
                  <option value="kg">KG</option>
                  <option value="L">L</option>
                  <option value="unidades">UND</option>
                </select>
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
            <Check className="h-8 w-8" />
            <span>Registrar Entrada</span>
          </Button>
        </form>
      </main>
    </div>
  );
}
