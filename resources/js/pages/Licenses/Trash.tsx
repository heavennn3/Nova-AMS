import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { toast } from 'sonner';

export default function LicenseTrash({ licenses = [] }: any) {

    const handleRestore = (id: number) => {
        if (confirm('Are you sure you want to restore this license?')) {
            router.post(`/licenses/${id}/restore`, {}, {
                onSuccess: () => toast.success('License restored successfully.'),
                onError: () => toast.error('Failed to restore license.'),
            });
        }
    };

    const handleForceDelete = (id: number) => {
        if (confirm('WARNING: This will permanently delete the license and all its assignments. This action cannot be undone. Are you sure?')) {
            router.delete(`/licenses/${id}/force`, {
                onSuccess: () => toast.success('License permanently deleted.'),
                onError: () => toast.error('Failed to delete license.'),
            });
        }
    };

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Software Name" />
                ),
                cell: ({ row }: any) => (
                    <div className="font-medium">{row.getValue('name')}</div>
                ),
            },
            {
                accessorKey: 'vendor',
                header: 'Vendor',
                cell: ({ row }: any) => row.getValue('vendor') || '—',
            },
            {
                accessorKey: 'delete_reason',
                header: 'Reason for Deletion',
                cell: ({ row }: any) => (
                    <div className="max-w-[250px] truncate text-muted-foreground" title={row.getValue('delete_reason')}>
                        {row.getValue('delete_reason') || '—'}
                    </div>
                ),
            },
            {
                accessorKey: 'deleted_at',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Date Deleted" />
                ),
                cell: ({ row }: any) => row.getValue('deleted_at'),
            },
            {
                id: 'actions',
                cell: ({ row }: any) => {
                    const license = row.original;
                    return (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleRestore(license.id)}
                            >
                                <RefreshCw className="h-4 w-4 mr-1" /> Restore
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                onClick={() => handleForceDelete(license.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Permanent Delete
                            </Button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="License Trash Bin" />

            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href="/licenses">
                            <Button variant="ghost" size="sm" className="h-8 p-1">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">License Trash Bin</h1>
                    </div>
                    <p className="text-muted-foreground ml-8 mt-1">
                        View deleted licenses, their deletion reasons, and manage restoration or permanent removal.
                    </p>
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-4 border-b bg-muted/20">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-muted-foreground" />
                        Deleted Items
                    </h2>
                </div>
                <DataTable columns={columns} data={licenses} searchKey="name" />
            </div>
        </div>
    );
}

LicenseTrash.layout = {
    breadcrumbs: [
        {
            title: 'Software Licenses',
            href: '/licenses',
        },
        {
            title: 'Trash Bin',
            href: '#',
        },
    ],
};
