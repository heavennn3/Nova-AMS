import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AssetInventory({ assets = [], configurations = [] }: any) {
    const [search, setSearch] = useState('');

    const columns = useMemo(() => {
        const cols: any[] = (configurations || []).map((cfg: any) => ({
            accessorKey: cfg.column_key,
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title={cfg.column_title} />
            ),
            enableSorting: cfg.is_sortable,
            cell: ({ row }: any) => {
                const val = row.getValue(cfg.column_key);

                if (cfg.is_primary_key) {
                    return (
                        <Link href={`/assets/${row.original.id}`} className="text-primary hover:underline font-mono font-semibold">
                            {val ?? '—'}
                        </Link>
                    );
                }

                if (cfg.data_type === 'number') {
                    return <div className="text-right font-medium">{val ?? '—'}</div>;
                }

                return <span>{val ?? '—'}</span>;
            },
        }));

        cols.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <Link href={`/assets/${row.original.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                            <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600"
                        onClick={() => {
                            if (confirm('Delete this asset?')) {
                                router.delete(`/assets/${row.original.id}`, {
                                    preserveScroll: true,
                                });
                            }
                        }}
                    >
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                </div>
            ),
        });

        return cols;
    }, [configurations]);

    const configKeys = configurations?.map((c: any) => c.column_key) || [];
    const filteredAssets = useMemo(() => {
        const q = search.toLowerCase();
        return (assets || []).filter((a: any) => {
            if (!q) return true;
            return configKeys.some((key: string) => {
                const v = a[key];
                return v && String(v).toLowerCase().includes(q);
            });
        });
    }, [assets, search, configKeys]);

    return (
        <div className="w-full space-y-4 p-6">
            <Head title="Asset Inventory" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Asset Inventory</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage all registered assets.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-[200px] pl-8 text-sm"
                        />
                    </div>
                    <Link href="/assets/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Asset
                        </Button>
                    </Link>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredAssets}
                hideToolbar
            />
        </div>
    );
}
