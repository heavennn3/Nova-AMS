import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

interface RecycleBinProps {
    items: any[];
    filters: {
        type: string;
        search: string;
    };
}

export default function RecycleBin({ items, filters }: RecycleBinProps) {
    const [type, setType] = useState(filters.type || 'users');

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

    const getTypeLabel = (t: string) => {
        switch (t) {
            case 'users':
                return 'Users';
            case 'vendors':
                return 'Vendors';
            case 'assets':
                return 'Assets';
            case 'asset_categories':
                return 'Asset Categories';
            case 'spareparts':
                return 'Spareparts';
            default:
                return 'Items';
        }
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
            <Head title="Recycle Bin" />
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Recycle Bin
                    </h1>
                  
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deleted {getTypeLabel(type)}</CardTitle>
                    <CardDescription>
                        Review deleted items. Restoring will bring them back,
                        permanent deletion will erase them forever.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        <div className="w-[200px]">
                            <Select
                                value={type}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="users">Users</SelectItem>
                                    <SelectItem value="vendors">
                                        Vendors
                                    </SelectItem>
                                    <SelectItem value="assets">
                                        Assets
                                    </SelectItem>
                                    <SelectItem value="asset_categories">
                                        Asset Categories
                                    </SelectItem>
                                    <SelectItem value="spareparts">
                                        Spareparts
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={items || []}
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
