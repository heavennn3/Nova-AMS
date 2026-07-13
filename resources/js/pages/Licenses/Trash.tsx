import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';

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


}

LicenseTrash.layout = {
    breadcrumbs: [
        {
            title: 'Software Licenses',
            href: '/licenses',
        },

    ],
};
