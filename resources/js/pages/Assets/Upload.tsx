import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft, Upload, FileSpreadsheet, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetUpload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const parseCsvText = (text: string) => {
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return { headers: [], rows: [] };
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => { if (h && values[i]) row[h] = values[i]; });
            return row;
        }).filter(row => row[headers[0]]);
        return { headers, rows };
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const { headers, rows } = parseCsvText(text);
                setPreviewData([{ preview: headers.join(', ') }, ...rows.slice(0, 5)]);
            };
            reader.readAsText(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }
        setIsProcessing(true);
        try {
            if (selectedFile.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const text = e.target?.result as string;
                    const { rows } = parseCsvText(text);
                    router.post('/assets/import-bulk', { assets: rows }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`Imported ${rows.length} assets!`);
                            setSelectedFile(null);
                            setPreviewData(null);
                            setIsProcessing(false);
                        },
                        onError: (err) => {
                            toast.error('Import failed');
                            console.error(err);
                            setIsProcessing(false);
                        },
                    });
                };
                reader.readAsText(selectedFile);
            } else {
                toast.error('Please upload a CSV file');
                setIsProcessing(false);
            }
        } catch (e) {
            toast.error('Upload failed');
            setIsProcessing(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <Head title="Upload Assets" />
            <div className="flex items-center gap-4">
                <Link href="/assets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Upload Assets</h1>
                    <p className="text-sm text-muted-foreground">
                        Upload a CSV file. Column headers must match the configured column keys (e.g. <code>asset_tag</code>, <code>asset_name</code>).
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-dashed bg-card p-8 text-center">
                <FileSpreadsheet className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <Label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="text-sm font-medium hover:text-primary transition-colors">
                        {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                    </div>
                    <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                </Label>
            </div>

            {previewData && (
                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preview</h3>
                    <div className="max-h-[200px] overflow-auto rounded bg-muted/50 p-3 text-xs font-mono">
                        {previewData.map((row, i) => (
                            <div key={i} className="truncate py-0.5">
                                {i === 0 ? (
                                    <span className="text-primary">{row.preview}</span>
                                ) : (
                                    <span className="text-muted-foreground">{Object.values(row).join(', ')}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button onClick={handleUpload} disabled={isProcessing} className="gap-2">
                            <Upload className="h-4 w-4" />
                            {isProcessing ? 'Importing…' : 'Confirm & Upload'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}