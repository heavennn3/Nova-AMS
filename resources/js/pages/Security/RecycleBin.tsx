import { Head, router } from '@inertiajs/react';
import { RefreshCcw, Trash2, Search, Users, Building2, Package, Wrench, FolderOpen, Columns3 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface RecycleBinProps {
    items: any[];
    stats: Record<string, number>;
    filters: {
        type: string;
        search: string;
    };
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    users: { label: 'Users', icon: Users, color: 'blue' },
    assets: { label: 'Assets', icon: Package, color: 'purple' },
    spareparts: { label: 'Spareparts', icon: Wrench, color: 'orange' },


};

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', ring: 'ring-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'ring-emerald-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-600', ring: 'ring-purple-500' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-600', ring: 'ring-orange-500' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', ring: 'ring-cyan-500' },

};

export default function RecycleBin({ items, stats, filters }: RecycleBinProps) {
    const [type, setType] = useState(filters.type || 'users');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (newType: string) => {
        setType(newType);
        router.get(
            '/security/recycle-bin',
            { type: newType },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleRestore = (id: number) => {
        if (confirm('Are you sure you want to restore this item?')) {
            router.post(
                `/security/recycle-bin/${id}/restore`,
                { type },
                { preserveScroll: true },
            );
        }
    };

    const handleForceDelete = (id: number) => {
        if (
            confirm(
                'Are you sure you want to PERMANENTLY delete this item? This action cannot be undone.',
            )
        ) {
            router.delete(`/security/recycle-bin/${id}`, {
                data: { type },
                preserveScroll: true,
            });
        }
    };

    const handleSearch = () => {
        router.get(
            '/security/recycle-bin',
            { type, search },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleBatchRestore = (selectedRows: any[]) => {
        if (!type) {
            return;
        }

        const ids = selectedRows.map((r) => r.id).filter(Boolean);

        if (ids.length === 0) {
            return;
        }

        toast.promise(
            fetch('/security/recycle-bin/bulk-restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ type, ids }),
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();

                    throw new Error(err.message || 'Failed to restore records.');
                }

                return res.json();
            }),
            {
                loading: `Restoring ${ids.length} items...`,
                success: (res) => {
                    router.reload();

                    return res.message || 'Items restored successfully!';
                },
                error: (err) => err.message || 'Restoration failed.',
            }
        );
    };

    const handleBatchDelete = (selectedRows: any[]) => {
        if (!type) {
            return;
        }

        const ids = selectedRows.map((r) => r.id).filter(Boolean);

        if (ids.length === 0) {
            return;
        }

        toast.promise(
            fetch('/security/recycle-bin/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ type, ids }),
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();

                    throw new Error(err.message || 'Failed to delete records.');
                }

                return res.json();
            }),
            {
                loading: `Deleting ${ids.length} items...`,
                success: (res) => {
                    router.reload();

                    return res.message || 'Items deleted successfully!';
                },
                error: (err) => err.message || 'Deletion failed.',
            }
        );
    };

    const getTypeLabel = (t: string) => {
        return typeConfig[t]?.label ?? 'Items';
    };

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'type',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Type" />
                ),
                cell: ({ row }: any) => (
                    <Badge variant="outline" className="capitalize">
                        {row.original.type.replace('_', ' ')}
                    </Badge>
                ),
            },
            {
                accessorKey: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Name" />
                ),
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.original.name}</span>
                ),
            },
            {
                accessorKey: 'details',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Details" />
                ),
                cell: ({ row }: any) => (
                    <span className="text-muted-foreground">
                        {row.original.details}
                    </span>
                ),
            },
            {
                accessorKey: 'deleted_at',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Deleted At" />
                ),
                cell: ({ row }: any) => (
                    <span>
                        {new Date(row.original.deleted_at).toLocaleString()}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div>Actions</div>,
                cell: ({ row }: any) => {
                    const item = row.original;

                    return (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(item.id)}
                                title="Restore"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Restore
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleForceDelete(item.id)}
                                title="Delete Permanently"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [type],
    );

    return (
        <div className="space-y-6 p-6">
            <Head title="Deleted Item" />
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Deleted Item
                    </h1>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(typeConfig).map(([key, cfg]) => {
                    const colors = colorMap[cfg.color];
                    const Icon = cfg.icon;
                    const isActive = type === key;
                    const count = stats?.[key] ?? 0;

                    return (
                        <button
                            key={key}
                            onClick={() => handleFilterChange(key)}
                            className={cn(
                                'flex items-center space-x-4 rounded-lg border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md',
                                isActive && 'ring-2 ring-offset-2',
                                isActive && colors.ring,
                            )}
                        >
                            <div className={cn('rounded-full p-3', colors.bg)}>
                                <Icon className={cn('h-6 w-6', colors.text)} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{cfg.label}</p>
                                <p className={cn('text-2xl font-bold', colors.text)}>
                                    {count}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deleted {getTypeLabel(type)}</CardTitle>

                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    className="h-8 pl-8 text-sm"
                                />
                            </div>
                            <Button size="sm" onClick={handleSearch}>
                                Search
                            </Button>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={items || []}
                        onBatchRestore={handleBatchRestore}
                        onBatchDelete={handleBatchDelete}
                        hideToolbar
                    />
                </CardContent>
            </Card>
        </div>
    );
}

RecycleBin.layout = {
    breadcrumbs: [
        {
            title: 'Recycle Bin',
            href: '/security/recycle-bin',
        },
    ],
};
