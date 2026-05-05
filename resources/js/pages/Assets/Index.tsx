import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Wrench, FileText, Package, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AssetIndex({ assets = [], sites = [] }: { assets: any[], sites?: any[] }) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
        return sites && sites.length > 0 ? sites[0]?.id?.toString() || "" : "";
    });
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
    const [importSiteId, setImportSiteId] = useState<string>("");

    const columns = React.useMemo(() => [
        {
            accessorKey: "asset_id",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Asset ID" />
            ),
        },
        {
            accessorKey: "category",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
        },
        {
            accessorKey: "site",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Location" />
            ),
        },
        {
            accessorKey: "quantity",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Quantity" />
            ),
        },
        {
            accessorKey: "vendor",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Vendor" />
            ),
        },
        {
            accessorKey: "product_name",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Product" />
            ),
        },
        {
            accessorKey: "purchase_year",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Purchase Year" />
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const status = row.original.status;
                const statusColors: Record<string, string> = {
                    available: 'bg-green-100 text-green-800',
                    in_use: 'bg-blue-100 text-blue-800',
                    maintenance: 'bg-yellow-100 text-yellow-800',
                    faulty: 'bg-red-100 text-red-800',
                };
                
                const colorClass = statusColors[status] || 'bg-secondary text-secondary-foreground';

                return (
                    <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                            {status || 'Unknown'}
                        </span>
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const asset = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-600 hover:text-amber-700">
                                    <Wrench className="h-4 w-4 mr-1" /> Maint.
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <MaintenanceRequestForm asset={asset} />
                            </DialogContent>
                        </Dialog>
                        
                        <Link href={`/assets/${asset.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                                <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                        </Link>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this asset?')) {
                                    router.delete(`/assets/${asset.id}`);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </div>
                );
            }
        }
    ], []);

    function MaintenanceRequestForm({ asset }: { asset: any }) {
        const { data, setData, post, processing, reset } = useForm({
            asset_id: asset.id,
            issue: '',
            priority: 'medium',
        });

        const submit = (e: React.FormEvent) => {
            e.preventDefault();
            post('/maintenance/work-orders', {
                onSuccess: () => {
                    alert('Maintenance requested successfully!');
                    reset();
                }
            });
        };

        return (
            <form onSubmit={submit} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Request Maintenance</DialogTitle>
                    <DialogDescription>Create a work order for {asset.product_name}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label>Issue Description</Label>
                    <Textarea 
                        placeholder="What needs to be fixed?" 
                        value={data.issue}
                        onChange={(e) => setData('issue', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={processing} className="w-full">Submit Request</Button>
                </DialogFooter>
            </form>
        );
    }

    const handleImportCsv = (importedData: any[]) => {
        setPendingImportData(importedData);
        setImportSiteId(selectedSiteId);
    };

    const confirmImport = () => {
        if (!pendingImportData || !importSiteId) return;

        const payload: any = { assets: pendingImportData, site_id: importSiteId };

        router.post('/assets/import-bulk', payload, {
            preserveScroll: true,
            onSuccess: () => {
                alert(`Successfully imported ${pendingImportData.length} assets from CSV!`);
                setPendingImportData(null);
            },
            onError: (err) => {
                console.error("Import failed:", err);
                alert("Failed to import CSV. Check console for details.");
                setPendingImportData(null);
            }
        });
    };

    const filteredAssets = (assets || []).filter(a => a?.site_id?.toString() === selectedSiteId);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Inventory" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-2xl font-bold">{(assets || []).length}</p>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-500/10 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">In Current Site</p>
                        <p className="text-2xl font-bold">{(assets || []).filter((a: any) => a?.site_id?.toString() === selectedSiteId).length}</p>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                        <Wrench className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Sites Managed</p>
                        <p className="text-2xl font-bold">{sites?.length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">NRSB Asset List</h2>
                    <p className="text-sm text-muted-foreground">Maintenance Services for Air Traffic Management Systems in Kota Kinabalu Flight Information Region (KK FIR) Encompassing Sabah and Sarawak 
(CAAM.BKP.400-5/8/24)</p>
                </div>
                <div className="flex space-x-3">
                   
                    <Link href={`/assets/create?site_id=${selectedSiteId}`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Register New Asset
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-border w-full overflow-x-auto no-scrollbar pb-px">
                {sites?.map((site: any) => {
                    const count = (assets || []).filter((a: any) => a?.site_id === site.id).length;
                    return (
                        <button
                            key={site.id || Math.random()}
                            onClick={() => setSelectedSiteId(site.id?.toString() || "")}
                            className={`px-4 py-2 border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
                                selectedSiteId === (site.id?.toString() || "") 
                                ? 'border-primary text-primary font-bold bg-primary/5' 
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/30'
                            }`}
                        >
                            <span>{site.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                selectedSiteId === (site.id?.toString() || "") 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
            
            <DataTable 
                columns={columns} 
                data={filteredAssets || []} 
                onImportCsv={handleImportCsv}
            />

            <Dialog open={!!pendingImportData} onOpenChange={(open) => !open && setPendingImportData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import CSV</DialogTitle>
                        <DialogDescription>
                            Select the location for the {pendingImportData?.length} assets you are importing.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Select value={importSiteId} onValueChange={setImportSiteId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                {sites?.map((site: any) => (
                                    <SelectItem key={site.id || Math.random()} value={site.id?.toString() || ""}>{site.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingImportData(null)}>Cancel</Button>
                        <Button onClick={confirmImport}>Confirm Import</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
AssetIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asset Inventory',
            href: '#',
        },
    ],
};
