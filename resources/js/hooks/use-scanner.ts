import { useState, useCallback, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';

interface ScanResult {
  data: string;
  timestamp: number;
}

interface UseScannerReturn {
  isScanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
  startScanning: (elementId: string, config?: Partial<Html5QrcodeCameraScanConfig>) => Promise<void>;
  stopScanning: () => Promise<void>;
  clearResult: () => void;
  processManualEntry: (value: string) => ScanResult;
}

export function useScanner(): UseScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanning = useCallback(async (elementId: string, config: Partial<Html5QrcodeCameraScanConfig> = {}) => {
    try {
      setError(null);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode(elementId);
      html5QrCodeRef.current = html5QrCode;

      const defaultConfig: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        ...config
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        defaultConfig,
        (decodedText) => {
          const result: ScanResult = {
            data: decodedText,
            timestamp: Date.now()
          };
          setScanResult(result);
          setIsScanning(false);
          html5QrCode.stop();
        },
        (errorMessage) => {
          // Suppress scanning errors during active scanning
          console.log('Scanning error:', errorMessage);
        }
      );

    } catch (err: any) {
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err: any) {
        setError(err.message || 'Failed to stop scanner');
      }
    }
  }, [isScanning]);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setError(null);
  }, []);

  const processManualEntry = useCallback((value: string): ScanResult => {
    return {
      data: value,
      timestamp: Date.now()
    };
  }, []);

  return {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    clearResult,
    processManualEntry
  };
}

// Helper function to parse scanned data
export function parseScannedData(scannedValue: string) {
  try {
    // Try to parse as JSON first
    const decoded = JSON.parse(scannedValue);
    if (decoded && typeof decoded === 'object') {
      return {
        asset_id: decoded.asset_id || null,
        name: decoded.name || null,
        serial: decoded.serial || null,
        category: decoded.category || null,
        isValid: !!decoded.asset_id
      };
    }
  } catch (e) {
    // Not JSON, treat as simple asset_id
  }

  // Simple asset_id validation
  const isValidFormat = /^[A-Z]{3}-\d{6}$/.test(scannedValue);

  return {
    asset_id: scannedValue,
    name: null,
    serial: null,
    category: null,
    isValid: isValidFormat
  };
}

// Helper function to validate asset ID format
export function validateAssetIdFormat(assetId: string): boolean {
  return /^[A-Z]{3}-\d{6}$/.test(assetId);
}