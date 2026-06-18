import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft, Check, X, Camera } from 'lucide-react';
import QrScannerModal from '@/components/scanner/qr-scanner-modal';
import { toast } from 'sonner';

export default function AssetScan({ site_id = '' }: { site_id?: string }) {
    const [scannedAssets, setScannedAssets] = useState<any[]>([]);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [currentAssetId, setCurrentAssetId] = useState('');

    const handleScanResult = (result: any) => {
        // Check if asset already scanned
        if (scannedAssets.find(a => a.asset_id === result.asset_id)) {
            toast.error('Asset already scanned', {
                description: `Asset ID: ${result.asset_id}`
            });
            return;
        }

        // Add to scanned list
        const newAsset = {
            asset_id: result.asset_id || '',
            product_name: result.name || 'Unknown',
            serial_number: result.serial || '',
            site_id: site_id,
            status: 'available'
        };

        setScannedAssets([...scannedAssets, newAsset]);
        toast.success(`Scanned: ${result.asset_id}`);
    };

    const handleRemoveAsset = (assetId: string) => {
        setScannedAssets(scannedAssets.filter(a => a.asset_id !== assetId));
    };

    const handleRegisterAll = () => {
        if (scannedAssets.length === 0) {
            toast.error('No assets to register');
            return;
        }

        const payload = {
            scanned_items: scannedAssets,
            site_id: site_id,
            category_id: '',
            status: 'available'
        };

        router.post('/api/assets/scan-bulk', payload, {
            onSuccess: () => {
                toast.success(`Successfully registered ${scannedAssets.length} assets`);
                setScannedAssets([]);
            },
            onError: (errors) => {
                toast.error('Failed to register assets', {
                    description: Object.values(errors).join(', ')
                });
            }
        });
    };

    const handleRegisterSingle = (asset: any) => {
        router.post('/api/assets/scan', {
            scanned_data: asset.asset_id,
            scan_type: 'asset_id',
            site_id: site_id
        }, {
            onSuccess: () => {
                toast.success(`Registered ${asset.asset_id}`);
                setScannedAssets(scannedAssets.filter(a => a.asset_id !== asset.asset_id));
            },
            onError: () => {
                toast.error(`Failed to register ${asset.asset_id}`);
            }
        });
    };

    return (
        <div className="w-full space-y-6 p-8 text-left">
            <Head title="Scan Assets" />

            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/assets">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            QR/Barcode Asset Registration
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Scan QR codes or barcodes to register assets quickly
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Scanner Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Scanner</h2>
                            <Button
                                onClick={() => setScannerOpen(true)}
                                size="lg"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Camera className="mr-2 h-5 w-5" />
                                Open Scanner
                            </Button>
                        </div>

                        <div className="bg-slate-900 rounded-lg h-64 flex items-center justify-center">
                            <div className="text-center text-white">
                                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-sm opacity-75 mb-4">
                                    Click "Open Scanner" to start scanning
                                </p>
                                <p className="text-xs opacity-50">
                                    Supports QR codes and barcodes
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Manual Entry Option */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Manual Entry</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>Asset ID / Serial Number</Label>
                                <Input
                                    value={currentAssetId}
                                    onChange={(e) => setCurrentAssetId(e.target.value)}
                                    placeholder="Enter or scan asset ID"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && currentAssetId.trim()) {
                                            handleScanResult({
                                                asset_id: currentAssetId,
                                                name: 'Unknown',
                                                serial: currentAssetId
                                            });
                                            setCurrentAssetId('');
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    if (currentAssetId.trim()) {
                                        handleScanResult({
                                            asset_id: currentAssetId,
                                            name: 'Unknown',
                                            serial: currentAssetId
                                        });
                                        setCurrentAssetId('');
                                    }
                                }}
                                disabled={!currentAssetId.trim()}
                            >
                                Add to List
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scanned Assets List */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Scanned Assets ({scannedAssets.length})
                            </h2>
                            {scannedAssets.length > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setScannedAssets([])}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>

                        {scannedAssets.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No assets scanned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {scannedAssets.map((asset, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-slate-50 rounded-lg border group hover:border-primary transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-mono font-semibold text-sm">
                                                    {asset.asset_id}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {asset.product_name}
                                                </p>
                                                {asset.serial_number && (
                                                    <p className="text-xs text-muted-foreground">
                                                        SN: {asset.serial_number}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRegisterSingle(asset)}
                                                >
                                                    Register
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveAsset(asset.asset_id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {scannedAssets.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <Button
                                    onClick={handleRegisterAll}
                                    className="w-full"
                                    size="lg"
                                >
                                    Register All ({scannedAssets.length})
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scanner Modal */}
            <QrScannerModal
                open={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleScanResult}
                scanType="asset_id"
            />
        </div>
    );
}

AssetScan.layout = {
    breadcrumbs: [
        {
            title: 'Assets',
            href: '/assets',
        },
        {
            title: 'Scan Assets',
            href: '#',
        },
    ],
};