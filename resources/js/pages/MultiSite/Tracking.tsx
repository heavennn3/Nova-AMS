import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { MapPin, Navigation } from 'lucide-react';

export default function Tracking({ sites, assets }: { sites: any[], assets: any[] }) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>("all");

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

    const filteredAssets = selectedSiteId === "all" 
        ? assets 
        : assets.filter(a => a.site_id?.toString() === selectedSiteId);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Location Tracking" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Navigation className="h-8 w-8 mr-3 text-primary" />
                    Location Tracking
                </h1>
                <p className="text-muted-foreground mt-2">
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

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-4">
                <DataTable 
                    columns={columns} 
                    data={filteredAssets} 
                    searchKey="product_name" 
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
