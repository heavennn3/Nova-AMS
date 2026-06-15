import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { MapPin, Navigation, Search, Filter, X, Check } from 'lucide-react';

export default function Tracking({
    sites,
    assets,
}: {
    sites: any[];
    assets: any[];
}) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const allCategories = useMemo(
        () =>
            [...new Set(assets.map((a) => a.category).filter(Boolean))].sort(),
        [assets],
    );

    const columns = [
        {
            accessorKey: 'asset_id',
            header: 'Asset ID',
            cell: ({ row }: any) => (
                <Link
                    href={`/assets/${row.original.id}`}
                    className="text-primary hover:underline font-mono font-semibold"
                >
                    {row.getValue('asset_id')}
                </Link>
            ),
        },
        { accessorKey: 'product_name', header: 'Product Name' },
        { accessorKey: 'category', header: 'Category' },
        {
            accessorKey: 'site.name',
            header: 'Current Location',
            cell: ({ row }: any) => (
                <div className="flex items-center text-primary">
                    <MapPin className="mr-2 h-4 w-4" />
                    {row.original.site?.name || 'Unknown Location'}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }: any) => (
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Verified
                </span>
            ),
        },
    ];

    const filteredAssets = useMemo(() => {
        return assets.filter((a) => {
            const matchesSite =
                selectedSiteId === 'all' ||
                a.site_id?.toString() === selectedSiteId;
            const matchesCategory =
                selectedCategory === 'all' || a.category === selectedCategory;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                (a.asset_id && a.asset_id.toLowerCase().includes(q)) ||
                (a.product_name && a.product_name.toLowerCase().includes(q)) ||
                (a.category && a.category.toLowerCase().includes(q)) ||
                (a.site?.name && a.site.name.toLowerCase().includes(q));
            return matchesSite && matchesCategory && matchesSearch;
        });
    }, [assets, selectedSiteId, selectedCategory, search]);

    const activeFilterCount = selectedCategory !== 'all' ? 1 : 0;

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Location Tracking" />

            <div>
                <h1 className="flex items-center text-2xl font-bold tracking-tight text-foreground">
                    <Navigation className="mr-3 h-7 w-7 text-primary" />
                    Location Tracking
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Real-time monitoring of asset presence and location
                    verification.
                </p>
            </div>

            <div className="flex w-full space-x-2 overflow-x-auto border-b border-border pb-1">
                <button
                    onClick={() => setSelectedSiteId('all')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        selectedSiteId === 'all'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                    }`}
                >
                    All Locations
                </button>
                {sites.map((site) => (
                    <button
                        key={site.id}
                        onClick={() => setSelectedSiteId(site.id.toString())}
                        className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                            selectedSiteId === site.id.toString()
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {site.name}
                    </button>
                ))}
            </div>

            <div className="space-y-4 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
                {/* Search + Filter row */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-[260px]">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search asset, product, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-sm"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-dashed"
                            >
                                <Filter className="h-3.5 w-3.5" /> Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[240px] p-0" align="start">
                            <div className="border-b p-3">
                                <p className="text-sm font-semibold">
                                    Filter Assets
                                </p>
                            </div>
                            <div className="border-b p-3">
                                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Category
                                </p>
                                <div className="max-h-[180px] space-y-0.5 overflow-y-auto">
                                    <button
                                        onClick={() =>
                                            setSelectedCategory('all')
                                        }
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedCategory === 'all' ? 'font-medium' : ''}`}
                                    >
                                        <span>All</span>
                                        {selectedCategory === 'all' && (
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        )}
                                    </button>
                                    {allCategories.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() =>
                                                setSelectedCategory(c)
                                            }
                                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedCategory === c ? 'font-medium' : ''}`}
                                        >
                                            <span>{c}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {
                                                        assets.filter(
                                                            (a) =>
                                                                a.category ===
                                                                c,
                                                        ).length
                                                    }
                                                </span>
                                                {selectedCategory === c && (
                                                    <Check className="h-3.5 w-3.5 text-primary" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && (
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full text-xs"
                                        onClick={() =>
                                            setSelectedCategory('all')
                                        }
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                    
                    <DataTableActions
                        data={filteredAssets}
                        columns={columns}
                        exportFileName="location_tracking_export"
                    />
                    {selectedCategory !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            Category: {selectedCategory}
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className="ml-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                    {(activeFilterCount > 0 || search) && (
                        <span className="ml-1 text-xs text-muted-foreground">
                            {filteredAssets.length} assets
                        </span>
                    )}
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
