import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetUpload({ site_id = '', sites = [] }: { site_id?: string; sites?: any[] }) {
    const [uploadMethod, setUploadMethod] = useState<'csv' | 'excel' | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadSiteId, setUploadSiteId] = useState(site_id);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);

        // Parse CSV for preview
        if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const lines = text.split('\n').slice(0, 6); // First 5 rows + header
                const preview = lines.map(line => {
                    const values = line.split(',');
                    return {
                        asset_id: values[0] || '',
                        product_name: values[1] || '',
                        category: values[2] || '',
                        quantity: values[3] || '1',
                    };
                }).filter(row => row.asset_id);
                setPreviewData(preview);
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !uploadSiteId) {
            toast.error('Please select a file and site');
            return;
        }

        setIsProcessing(true);

        try {
            // For CSV files, use the existing bulk import
            if (selectedFile.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const text = e.target?.result as string;
                    const lines = text.split('\n');
                    const assets = lines.slice(1).map(line => {
                        const values = line.split(',');
                        return {
                            asset_id: values[0]?.trim(),
                            product_name: values[1]?.trim() || 'Unknown',
                            category: values[2]?.trim(),
                            quantity: parseInt(values[3]?.trim()) || 1,
                        };
                    }).filter(asset => asset.asset_id);

                    const payload = {
                        assets: assets,
                        site_id: uploadSiteId
                    };

                    router.post('/assets/import-bulk', payload, {
                        onSuccess: () => {
                            toast.success(`Successfully imported ${assets.length} assets`);
                            setSelectedFile(null);
                            setPreviewData(null);
                        },
                        onFinish: () => setIsProcessing(false)
                    });
                };
                reader.readAsText(selectedFile);
            }
        } catch (error) {
            toast.error('Failed to process file');
            setIsProcessing(false);
        }
    };

    const uploadOptions = [
        {
            id: 'csv' as const,
            title: 'CSV Spreadsheet',
            description: 'Upload CSV file with asset data',
            icon: FileSpreadsheet,
            accept: '.csv',
            color: 'bg-green-50 hover:bg-green-100 border-green-200'
        },
        {
            id: 'excel' as const,
            title: 'Excel Spreadsheet',
            description: 'Upload Excel file with asset data',
            icon: FileSpreadsheet,
            accept: '.xlsx,.xls',
            color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
        }
    ];

    if (uploadMethod) {
        return (
            <div className="w-full space-y-6 p-8 text-left">
                <Head title="Upload Assets" />

                <div className="flex items-center gap-4 border-b pb-4">
                    <Link href="/assets">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Upload Assets
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {uploadMethod === 'csv' ? 'CSV Spreadsheet Upload' : 'Excel Spreadsheet Upload'}
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Site Selection */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Select Site</h2>
                        <div className="space-y-2">
                            <Label>Target Site</Label>
                            <select
                                value={uploadSiteId}
                                onChange={(e) => setUploadSiteId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Select a site...</option>
                                {sites.map((site: any) => (
                                    <option key={site.id} value={site.id}>
                                        {site.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Upload File</h2>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept={uploadMethod === 'csv' ? '.csv' : '.xlsx,.xls'}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileSelect(file);
                                }}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer block"
                            >
                                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm font-semibold mb-2">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    {uploadMethod === 'csv' ? 'CSV files only' : 'Excel files only'}
                                </p>
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-gray-600">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {previewData && previewData.length > 0 && (
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Preview (First 5 rows)</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Asset ID</th>
                                            <th className="text-left p-2">Product Name</th>
                                            <th className="text-left p-2">Category</th>
                                            <th className="text-left p-2">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="p-2 font-mono">{row.asset_id}</td>
                                                <td className="p-2">{row.product_name}</td>
                                                <td className="p-2">{row.category}</td>
                                                <td className="p-2">{row.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => {
                                setUploadMethod(null);
                                setSelectedFile(null);
                                setPreviewData(null);
                            }}
                            variant="outline"
                            disabled={isProcessing}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || !uploadSiteId || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? 'Processing...' : 'Upload & Import'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-8 text-left">
            <Head title="Upload Assets" />

            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/assets">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Bulk Asset Upload
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Choose your preferred upload method
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {uploadOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setUploadMethod(option.id)}
                                className={`p-8 rounded-lg border-2 transition-all duration-200 ${option.color} flex flex-col items-center text-center space-y-4 hover:scale-105 active:scale-95`}
                            >
                                <div className="p-4 rounded-full bg-white text-gray-700">
                                    <Icon className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xl">{option.title}</h3>
                                    <p className="text-sm opacity-80 mt-2">{option.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2">Expected CSV Format:</h3>
                    <div className="text-sm space-y-1">
                        <p>• Column headers: Asset ID, Product Name, Category, Quantity</p>
                        <p>• Asset ID is required (format: ATM-123456)</p>
                        <p>• Other fields are optional</p>
                        <p>• First row should contain headers</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

AssetUpload.layout = {
    breadcrumbs: [
        {
            title: 'Assets',
            href: '/assets',
        },
        {
            title: 'Upload Assets',
            href: '#',
        },
    ],
};