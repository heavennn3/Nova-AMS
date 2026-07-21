import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Upload, FileSpreadsheet, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function AssetUpload({ sites = [] }: { sites?: any[] }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedSiteId, setSelectedSiteId] = useState('');

    const parseCsvText = (text: string) => {
        const lines = text.split('\n').filter(l => l.trim());

        if (lines.length < 2) {
return { headers: [], rows: [] };
}

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
 if (h && values[i]) {
row[h] = values[i];
} 
});

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

        if (!selectedSiteId) {
            toast.error('Please select a site');

            return;
        }

        setIsProcessing(true);

        try {
            if (selectedFile.name.endsWith('.csv')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const text = e.target?.result as string;
                    const { rows } = parseCsvText(text);
                    router.post('/assets/import-bulk', { assets: rows, site_id: Number(selectedSiteId) }, {
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success(`Imported ${rows.length} assets!`);
                            setSelectedFile(null);
                            setPreviewData(null);
                            setIsProcessing(false);
                        },
                        onError: (err) => {
                            const msg = typeof err === 'object' ? (err as any).site_id || 'Import failed.' : 'Import failed.';
                            toast.error(msg);
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
                <Link href="/asset-inventory" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Upload Assets</h1>
                    <p className="text-sm text-muted-foreground">
                        Upload a CSV file. Column headers must match the configured column keys (e.g. <code>asset_tag</code>, <code>asset_name</code>).
                    </p>
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
                {sites.length === 0 ? (
                    <div className="text-center py-6">
                        <div className="rounded-full bg-amber-100 p-3 w-fit mx-auto mb-3">
                            <MapPin className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-amber-800">No Sites Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">You must create a site before importing assets.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/master-data">Create a Site</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="site-select" className="font-medium">Target Site *</Label>
                            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                <SelectTrigger id="site-select">
                                    <SelectValue placeholder="Select a site..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map((site: any) => (
                                        <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!selectedSiteId && <p className="text-xs text-amber-600">You must select a site to import assets into.</p>}
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
                    </>
                )}
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
                        <Button onClick={handleUpload} disabled={isProcessing || !selectedSiteId} className="gap-2">
                            <Upload className="h-4 w-4" />
                            {isProcessing ? 'Importing…' : 'Confirm & Upload'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}