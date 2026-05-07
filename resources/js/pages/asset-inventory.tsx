import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AssetIndex({ assets }: { assets: any[] }) {
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
            
            <DataTable 
                columns={columns} 
                data={assets || []} 
                searchKey="site" // Setting the search key to "site" allows filtering by Location
                onImportCsv={handleImportCsv}
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