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
        },
        {
            accessorKey: "product_name",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Product Name" />
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const status = row.original.status;
                return (
                    <div className="flex items-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
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
                        {/* 
                          Using @ts-ignore for the ziggy route() helper to satisfy TS, 
                          or falling back to a raw path string if it is unavailable in the environment.
                        */}
                        <Link href={(window as any).route?.('assets.edit', asset.id) || `/assets/${asset.id}/edit`}>
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
                                    router.delete((window as any).route?.('assets.destroy', asset.id) || `/assets/${asset.id}`);
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
        console.log("Imported data:", importedData);
        // You can post this to your backend using Inertia
        // router.post('/assets/import', { data: importedData });
        alert(`Successfully parsed ${importedData.length} records from CSV! Check console for data payload.`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Inventory" />
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Asset Register</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your asset inventory, import datasets, or export to PDF/Excel.
                    </p>
                </div>
                <Link href={(window as any).route?.('assets.create') || '/assets/create'}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Register New Asset
                    </Button>
                </Link>
            </div>
            
            <DataTable 
                columns={columns} 
                data={assets || []} 
                searchKey="product_name"
                onImportCsv={handleImportCsv}
            />
        </div>
    );
}