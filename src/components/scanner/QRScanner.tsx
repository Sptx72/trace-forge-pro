import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, X, SwitchCamera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera
          const backCameraIndex = devices.findIndex(
            (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera')
          );
          setCurrentCameraIndex(backCameraIndex >= 0 ? backCameraIndex : 0);
        } else {
          setError('No se encontraron cámaras');
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setError('No se pudo acceder a las cámaras');
      });

    return () => {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          scannerRef.current.stop().catch(console.error);
        }
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current || cameras.length === 0) return;

    setError(null);
    setIsScanning(true);

    try {
      await scannerRef.current.start(
        cameras[currentCameraIndex].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {
          // QR Code not found - ignore
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Error al iniciar el escáner');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    await stopScanning();
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
      const result = await scannerRef.current.scanFile(file, true);
      onScan(result);
    } catch (err) {
      setError('No se pudo leer el código de la imagen');
    }
  };

  useEffect(() => {
    if (cameras.length > 0 && !isScanning) {
      startScanning();
    }
  }, [cameras, currentCameraIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="text-lg font-bold">Escanear Código</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div 
          id="qr-reader" 
          className="w-full max-w-sm aspect-square bg-muted rounded-lg overflow-hidden"
        />
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <p className="mt-4 text-muted-foreground text-center text-sm">
          Apunta la cámara al código QR o código de barras
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-border flex gap-3">
        {cameras.length > 1 && (
          <Button
            variant="industrial-secondary"
            size="industrial"
            className="flex-1"
            onClick={switchCamera}
          >
            <SwitchCamera className="h-6 w-6" />
            <span>Cambiar Cámara</span>
          </Button>
        )}
        
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="industrial-outline"
            size="industrial"
            className="w-full"
            asChild
          >
            <span>
              <Upload className="h-6 w-6" />
              <span>Subir Imagen</span>
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
