import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Scan, Camera, Upload, Keyboard, X, Check, AlertCircle } from 'lucide-react';
import { useScanner, parseScannedData, validateAssetIdFormat } from '@/hooks/use-scanner';
import { toast } from 'sonner';

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: any) => void;
  scanType?: 'asset_id' | 'serial_number';
}

export default function QrScannerModal({
  open,
  onClose,
  onScan,
  scanType = 'asset_id'
}: QrScannerModalProps) {
  const {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    clearResult,
    processManualEntry
  } = useScanner();

  const [manualValue, setManualValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scanProcessed, setScanProcessed] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerElementId = 'qr-scanner-' + Math.random().toString(36).substring(7);

  useEffect(() => {
    if (open && !scanProcessed) {
      clearResult();
      setManualValue('');
      setUploadedFile(null);
      setScanProcessed(false);
    }
  }, [open, scanProcessed]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  const handleStartCamera = async () => {
    await startScanning(scannerElementId, {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    });
  };

  const handleStopCamera = async () => {
    await stopScanning();
  };

  const handleScanProcessed = () => {
    if (!scanResult) return;

    const parsedData = parseScannedData(scanResult.data);

    if (!validateAssetIdFormat(parsedData.asset_id || '')) {
      toast.error('Invalid Asset ID Format', {
        description: 'Expected format: ATM-123456'
      });
      return;
    }

    onScan(parsedData);
    setScanProcessed(true);
    onClose();
  };

  const handleManualSubmit = () => {
    if (!manualValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    if (!validateAssetIdFormat(manualValue)) {
      toast.error('Invalid Asset ID Format', {
        description: 'Expected format: ATM-123456'
      });
      return;
    }

    const result = processManualEntry(manualValue);
    const parsedData = parseScannedData(result.data);
    onScan(parsedData);
    onClose();
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);

    try {
      const html5QrCode = await import('html5-qrcode');
      const qrCodeScanner = new html5QrCode.Html5Qrcode('file-scanner');

      await qrCodeScanner.scanFile(file, true)
        .then(decodedText => {
          const parsedData = parseScannedData(decodedText);
          if (!validateAssetIdFormat(parsedData.asset_id || '')) {
            toast.error('Invalid Asset ID Format', {
              description: 'Expected format: ATM-123456'
            });
            return;
          }
          onScan(parsedData);
          onClose();
        })
        .catch(err => {
          toast.error('Failed to scan image', {
            description: 'No QR code or barcode found in the image'
          });
        });
    } catch (err) {
      toast.error('Scanning error', {
        description: 'Failed to process the uploaded image'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scan Asset QR/Barcode
          </DialogTitle>
          <DialogDescription>
            Scan QR code or barcode to register or lookup assets
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Camera Scanner</Label>
                {isScanning && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopCamera}
                  >
                    Stop Camera
                  </Button>
                )}
              </div>

              <div
                ref={scannerRef}
                id={scannerElementId}
                className="bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center"
              >
                {!isScanning && (
                  <div className="text-center text-white space-y-4">
                    <Camera className="h-12 w-12 mx-auto opacity-50" />
                    <p className="text-sm opacity-75">
                      Click "Start Camera" to begin scanning
                    </p>
                    <Button
                      onClick={handleStartCamera}
                      className="bg-primary"
                    >
                      Start Camera
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {scanResult && !scanProcessed && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-700 font-mono">
                      {scanResult.data}
                    </p>
                  </div>
                  <Button
                    onClick={handleScanProcessed}
                    className="w-full"
                  >
                    Process Scan Result
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Image with QR/Barcode</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload an image containing a QR code or barcode
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
                <div id="file-scanner" className="hidden"></div>
              </div>

              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Check className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Uploaded: {uploadedFile.name}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Label>Manual Entry</Label>
              <p className="text-sm text-gray-600">
                Enter asset ID or serial number manually
              </p>
              <Input
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="ATM-123456"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualSubmit();
                }}
              />
              <div className="text-xs text-gray-500">
                Expected format: ATM-123456 (3 letters + 6 digits)
              </div>
              <Button
                onClick={handleManualSubmit}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}