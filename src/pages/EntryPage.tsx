import { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2 } from 'lucide-react';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QRScanner } from '@/components/scanner/QRScanner';
import { useStock } from '@/hooks/useStock';

export default function EntryPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerEntryStock } = useStock();
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    product: '',
    supplier: '',
    quantity: '',
    unit: 'kg',
    barcode: '',
    deliveryNotePhoto: null as File | null,
  });
  
  const [deliveryNotePreview, setDeliveryNotePreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScan = (result: string) => {
    setFormData(prev => ({ ...prev, barcode: result }));
    setShowScanner(false);
    toast({
      title: "Código escaneado",
      description: `Código: ${result}`,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, deliveryNotePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryNotePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Foto subida",
        description: "Albarán adjuntado correctamente",
      });
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('traceability-files')
      .upload(path, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    const { data: publicUrl } = supabase.storage
      .from('traceability-files')
      .getPublicUrl(data.path);
    
    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product || !formData.supplier || !formData.quantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para registrar entradas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate lot number
      const lotNumber = `ENT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const quantity = parseFloat(formData.quantity);
      
      // Upload delivery note photo if exists
      let deliveryNoteUrl: string | null = null;
      if (formData.deliveryNotePhoto) {
        const fileName = `delivery-notes/${user.id}/${lotNumber}-${Date.now()}.jpg`;
        deliveryNoteUrl = await uploadFile(formData.deliveryNotePhoto, fileName);
      }

      // Get user's obrador_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('obrador_id')
        .eq('user_id', user.id)
        .single();

      // Insert entry lot into database
      const { data: entryLot, error } = await supabase
        .from('entry_lots')
        .insert({
          user_id: user.id,
          obrador_id: profile?.obrador_id || null,
          lot_number: lotNumber,
          product: formData.product,
          supplier: formData.supplier,
          quantity: quantity,
          unit: formData.unit,
          barcode: formData.barcode || null,
          delivery_note_url: deliveryNoteUrl,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Register positive stock movement
      await registerEntryStock(
        entryLot.id,
        lotNumber,
        formData.product,
        quantity,
        formData.unit,
        user.id
      );

      toast({
        title: "Entrada registrada",
        description: `Lote ${lotNumber} creado correctamente`,
      });
      
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      console.error('Error creating entry:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la entrada",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader title="Registro de Entrada" showBack />
      
      {showScanner && (
        <QRScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
      
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
              onClick={() => setShowScanner(true)}
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-12 w-12" />
                <span>Escanear QR / Código</span>
              </div>
            </Button>
            
            {formData.barcode && (
              <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="font-mono-industrial text-success">{formData.barcode}</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, barcode: '' }))}
                  className="ml-auto p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
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
              <span>{deliveryNotePreview ? 'Cambiar Foto' : 'Subir Foto'}</span>
            </Button>
            
            {deliveryNotePreview && (
              <div className="mt-3 relative">
                <img 
                  src={deliveryNotePreview} 
                  alt="Albarán" 
                  className="w-full h-32 object-cover rounded-lg border-2 border-success/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, deliveryNotePhoto: null }));
                    setDeliveryNotePreview(null);
                  }}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <Check className="h-8 w-8" />
                <span>Registrar Entrada</span>
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
