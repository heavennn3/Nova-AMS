import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, Search, Filter, X, Check } from 'lucide-react';

export default function AssetIndex({ assets }: { assets: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState('all');

    const allStatuses = useMemo(() => [...new Set((assets || []).map(a => a.status).filter(Boolean))].sort(), [assets]);
    const allVendors = useMemo(() => [...new Set((assets || []).map(a => a.vendor).filter(Boolean))].sort(), [assets]);

    const filteredAssets = useMemo(() => {
        return (assets || []).filter(a => {
            const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
            const matchesVendor = selectedVendor === 'all' || a.vendor === selectedVendor;
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                (a.product_name && a.product_name.toLowerCase().includes(q)) ||
                (a.vendor && a.vendor.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q)) ||
                (a.site && a.site.toLowerCase().includes(q));
            return matchesStatus && matchesVendor && matchesSearch;
        });
    }, [assets, search, selectedStatus, selectedVendor]);

    const activeFilterCount = (selectedStatus !== 'all' ? 1 : 0) + (selectedVendor !== 'all' ? 1 : 0);
    const columns = [
        {
            accessorKey: "asset_id",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Asset ID" />
            ),
            headerText: "Asset ID",
        },
        {
            accessorKey: "category",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            headerText: "Category",
        },
        {
            accessorKey: "type",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            headerText: "Type",
        },
        {
            accessorKey: "site",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Location" />
            ),
            headerText: "Location",
        },
        {
            accessorKey: "quantity",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Quantity" />
            ),
            headerText: "Quantity",
        },
        {
            accessorKey: "vendor",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Vendor" />
            ),
            headerText: "Vendor",
        },
        {
            accessorKey: "product_name",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Product" />
            ),
            headerText: "Product",
        },
        {
            accessorKey: "purchase_year",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Purchase Year" />
            ),
            headerText: "Purchase Year",
        },
        {
            accessorKey: "status",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            headerText: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status;
                const statusColors: Record<string, string> = {
                    available: 'bg-green-100 text-green-800',
                    in_use: 'bg-blue-100 text-blue-800',
                    maintenance: 'bg-yellow-100 text-yellow-800',
                    faulty: 'bg-red-100 text-red-800',
                    degraded: 'bg-orange-100 text-orange-800',
                    new: 'bg-emerald-100 text-emerald-800',
                    retired: 'bg-slate-100 text-slate-800',
                };
                
                const labels: Record<string, string> = {
                    available: 'Available',
                    in_use: 'In Use',
                    maintenance: 'Maintenance',
                    faulty: 'Faulty Unit',
                    degraded: 'Degraded Unit',
                    new: 'New Unit',
                    retired: 'Retired',
                };

                const colorClass = statusColors[status] || 'bg-secondary text-secondary-foreground';

                return (
                    <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${colorClass}`}>
                            {labels[status] || status || 'Unknown'}
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
        router.post('/assets/import-bulk', { assets: importedData }, {
            preserveScroll: true,
            onSuccess: () => alert(`Successfully imported ${importedData.length} assets from CSV!`),
            onError: (err) => {
                console.error("Import failed:", err);
                alert("Failed to import CSV. Check console for details.");
            }
        });
    };

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Asset Inventory" />
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asset Register</h1>
                    <p className="text-muted-foreground mt-1">
                        
                    </p>
                </div>
                <Link href="/assets/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Asset
                    </Button>
                </Link>
            </div>
            
            {/* Search + Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search asset ID, product, vendor..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed">
                            <Filter className="h-3.5 w-3.5" /> Filters
                            {activeFilterCount > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[260px] p-0" align="start">
                        <div className="p-3 border-b"><p className="text-sm font-semibold">Filter Assets</p></div>
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                            <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                <button onClick={() => setSelectedStatus('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedStatus === 'all' ? 'font-medium' : ''}`}>
                                    <span>All</span>{selectedStatus === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allStatuses.map(s => (
                                    <button key={s} onClick={() => setSelectedStatus(s)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors capitalize ${selectedStatus === s ? 'font-medium' : ''}`}>
                                        <span>{s}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">{(assets||[]).filter(a => a.status === s).length}</span>
                                            {selectedStatus === s && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Vendor</p>
                            <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                <button onClick={() => setSelectedVendor('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedVendor === 'all' ? 'font-medium' : ''}`}>
                                    <span>All</span>{selectedVendor === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allVendors.map(v => (
                                    <button key={v} onClick={() => setSelectedVendor(v)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedVendor === v ? 'font-medium' : ''}`}>
                                        <span>{v}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">{(assets||[]).filter(a => a.vendor === v).length}</span>
                                            {selectedVendor === v && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {activeFilterCount > 0 && <div className="p-2"><Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => { setSelectedStatus('all'); setSelectedVendor('all'); }}>Clear all filters</Button></div>}
                    </PopoverContent>
                </Popover>
                {selectedStatus !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">Status: {selectedStatus}<button onClick={() => setSelectedStatus('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                {selectedVendor !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">Vendor: {selectedVendor}<button onClick={() => setSelectedVendor('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                {activeFilterCount > 0 && <span className="text-xs text-muted-foreground ml-1">{filteredAssets.length} of {(assets||[]).length} assets</span>}
            </div>

            <DataTable 
                columns={columns} 
                data={filteredAssets} 
                onImportCsv={handleImportCsv}
                hideToolbar
            />
        </div>
    );
}

AssetIndex.layout = {
    breadcrumbs: [
        {
            title: 'Asset Inventory',
            href: '/asset-inventory',
        },
    ],
};