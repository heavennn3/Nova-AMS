import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Navigation, Search, Filter, X, Check } from 'lucide-react';

export default function Tracking({ sites, assets }: { sites: any[], assets: any[] }) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const allCategories = useMemo(() => [...new Set(assets.map(a => a.category).filter(Boolean))].sort(), [assets]);

    const columns = [
        { accessorKey: "asset_id", header: "Asset ID" },
        { accessorKey: "product_name", header: "Product Name" },
        { accessorKey: "category", header: "Category" },
        { 
            accessorKey: "site.name", 
            header: "Current Location",
            cell: ({ row }: any) => (
                <div className="flex items-center text-primary">
                    <MapPin className="h-4 w-4 mr-2" />
                    {row.original.site?.name || 'Unknown Location'}
                </div>
            )
        },
        { 
            accessorKey: "status", 
            header: "Status",
            cell: ({ row }: any) => (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Verified
                </span>
            )
        }
    ];

    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            const matchesSite = selectedSiteId === "all" || a.site_id?.toString() === selectedSiteId;
            const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                (a.product_name && a.product_name.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q)) ||
                (a.site?.name && a.site.name.toLowerCase().includes(q));
            return matchesSite && matchesCategory && matchesSearch;
        });
    }, [assets, selectedSiteId, selectedCategory, search]);

    const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0);

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Location Tracking" />

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                    <Navigation className="h-7 w-7 mr-3 text-primary" />
                    Location Tracking
                </h1>
                <p className="text-muted-foreground mt-1">
                    Real-time monitoring of asset presence and location verification.
                </p>
            </div>

            <div className="flex space-x-2 border-b border-border w-full overflow-x-auto pb-1">
                <button
                    onClick={() => setSelectedSiteId("all")}
                    className={`px-4 py-2 border-b-2 whitespace-nowrap transition-all duration-200 text-sm font-medium ${
                        selectedSiteId === "all" 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                >
                    All Locations
                </button>
                {sites.map((site) => (
                    <button
                        key={site.id}
                        onClick={() => setSelectedSiteId(site.id.toString())}
                        className={`px-4 py-2 border-b-2 whitespace-nowrap transition-all duration-200 text-sm font-medium ${
                            selectedSiteId === site.id.toString() 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                        }`}
                    >
                        {site.name}
                    </button>
                ))}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-4 space-y-4">
                {/* Search + Filter row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-[260px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search asset, product, location..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed">
                                <Filter className="h-3.5 w-3.5" /> Filters
                                {activeFilterCount > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <div className="p-3 border-b"><p className="text-sm font-semibold">Filter Assets</p></div>
                            <div className="p-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</p>
                                <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
                                    <button onClick={() => setSelectedCategory('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedCategory === 'all' ? 'font-medium' : ''}`}>
                                        <span>All</span>{selectedCategory === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                    {allCategories.map(c => (
                                        <button key={c} onClick={() => setSelectedCategory(c)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedCategory === c ? 'font-medium' : ''}`}>
                                            <span>{c}</span>
                                            <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{assets.filter(a => a.category === c).length}</span>{selectedCategory === c && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && <div className="p-2"><Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => setSelectedCategory('all')}>Clear filters</Button></div>}
                        </PopoverContent>
                    </Popover>
                    {selectedCategory !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">Category: {selectedCategory}<button onClick={() => setSelectedCategory('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                    {(activeFilterCount > 0 || search) && <span className="text-xs text-muted-foreground ml-1">{filteredAssets.length} assets</span>}
                </div>

                <DataTable 
                    columns={columns} 
                    data={filteredAssets} 
                    hideToolbar
                />
            </div>
        </div>
    );
}

Tracking.layout = {
    breadcrumbs: [
        {
            title: 'Location Tracking',
            href: '#',
        },
    ],
};
