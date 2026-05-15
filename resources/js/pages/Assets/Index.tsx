import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Trash2, Wrench, FileText, Package, CheckCircle2, Search, Filter, X, Check, Info, User, Clock, Calendar, MessageSquare } from 'lucide-react';
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
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState('all');

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
                const assignment = row.original.assignment;
                const statusColors: Record<string, string> = {
                    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                    in_use: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                    maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                    faulty: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                    degraded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
                    new: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
                    retired: 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300',
                };

                const labels: Record<string, string> = {
                    available: 'Available',
                    in_use: 'In Use',
                    maintenance: 'Maintenance',
                    faulty: 'Faulty',
                    degraded: 'Degraded',
                    new: 'New',
                    retired: 'Retired',
                };
                
                const colorClass = statusColors[status] || 'bg-secondary text-secondary-foreground';

                return (
                    <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${colorClass}`}>
                            {labels[status] || status || 'Unknown'}
                        </span>
                        {status === 'in_use' && assignment && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="h-5 w-5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 flex items-center justify-center transition-colors" title="View usage details">
                                        <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[420px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Info className="h-4 w-4 text-blue-500" />
                                            </div>
                                            Asset In Use
                                        </DialogTitle>
                                        <DialogDescription>
                                            {row.original.product_name} ({row.original.asset_id})
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Checked out by</p>
                                                <p className="text-sm font-semibold">{assignment.user_name}</p>
                                                <p className="text-xs text-muted-foreground">{assignment.user_email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-muted/50 border">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Assigned</p>
                                                </div>
                                                <p className="text-sm font-medium">{assignment.assigned_at}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50 border">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Duration</p>
                                                </div>
                                                <p className="text-sm font-medium">{assignment.duration}</p>
                                            </div>
                                        </div>
                                        {assignment.remarks && (
                                            <div className="p-3 rounded-lg bg-muted/50 border">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">Remarks</p>
                                                </div>
                                                <p className="text-sm">{assignment.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
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
        <div className="p-8 w-full space-y-6">
            <Head title="Asset Inventory" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets Registered</p>
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
            
            
            {(() => {
                const siteFilteredAssets = (assets || []).filter(a => a?.site_id?.toString() === selectedSiteId);
                const allStatuses = [...new Set(siteFilteredAssets.map(a => a.status).filter(Boolean))].sort() as string[];
                const allVendors = [...new Set(siteFilteredAssets.map(a => a.vendor).filter(Boolean))].sort() as string[];
                const activeFilterCount = (selectedStatus !== 'all' ? 1 : 0) + (selectedVendor !== 'all' ? 1 : 0);
                const filteredAssets = siteFilteredAssets.filter(a => {
                    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
                    const matchesVendor = selectedVendor === 'all' || a.vendor === selectedVendor;
                    const q = search.toLowerCase();
                    const matchesSearch = !q ||
                        (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                        (a.product_name && a.product_name.toLowerCase().includes(q)) ||
                        (a.vendor && a.vendor.toLowerCase().includes(q)) ||
                        (a.category && a.category.toLowerCase().includes(q));
                    return matchesStatus && matchesVendor && matchesSearch;
                });

                return (
                    <>
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
                                                    <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{siteFilteredAssets.filter(a => a.status === s).length}</span>{selectedStatus === s && <Check className="h-3.5 w-3.5 text-primary" />}</div>
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
                                                    <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{siteFilteredAssets.filter(a => a.vendor === v).length}</span>{selectedVendor === v && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {activeFilterCount > 0 && <div className="p-2"><Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => { setSelectedStatus('all'); setSelectedVendor('all'); }}>Clear all filters</Button></div>}
                                </PopoverContent>
                            </Popover>
                            {selectedStatus !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">Status: {selectedStatus}<button onClick={() => setSelectedStatus('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                            {selectedVendor !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">Vendor: {selectedVendor}<button onClick={() => setSelectedVendor('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                            {activeFilterCount > 0 && <span className="text-xs text-muted-foreground ml-1">{filteredAssets.length} of {siteFilteredAssets.length} assets</span>}
                        </div>

                        <DataTable 
                            columns={columns} 
                            data={filteredAssets} 
                            onImportCsv={handleImportCsv}
                            hideToolbar
                        />
                    </>
                );
            })()}

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
