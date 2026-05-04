import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AssetIndex({ assets = [], sites = [] }: { assets: any[], sites?: any[] }) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
        return sites && sites.length > 0 ? sites[0]?.id?.toString() || "" : "";
    });
    const [pendingImportData, setPendingImportData] = useState<any[] | null>(null);
    const [importSiteId, setImportSiteId] = useState<string>("");

    const columns = [
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
    ];

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
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asset Inventory</h1>
                    <p className="text-muted-foreground mt-1">
                        Maintenance Services for Air Traffic Management Systems in Kota Kinabalu Flight Information Region (KK FIR) Encompassing Sabah and Sarawak 
(CAAM.BKP.400-5/8/24)
                    </p>
                </div>
                <Link href={`/assets/create?site_id=${selectedSiteId}`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Asset
                    </Button>
                </Link>
            </div>

            <div className="flex space-x-2 border-b border-border w-full overflow-x-auto">
                {sites?.map((site: any) => (
                    <button
                        key={site.id || Math.random()}
                        onClick={() => setSelectedSiteId(site.id?.toString() || "")}
                        className={`px-4 py-2 border-b-2 whitespace-nowrap transition-colors ${
                            selectedSiteId === (site.id?.toString() || "") 
                            ? 'border-primary text-primary font-medium' 
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                        }`}
                    >
                        {site.name}
                    </button>
                ))}
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
