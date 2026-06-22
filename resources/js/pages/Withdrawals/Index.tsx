import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function WithdrawalsIndex({ withdrawals = [] }: { withdrawals: any[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter((w: any) => {
            const matchesSearch = !search ||
                w.asset_name.toLowerCase().includes(search.toLowerCase()) ||
                w.user_name.toLowerCase().includes(search.toLowerCase()) ||
                w.asset_id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [withdrawals, search, statusFilter]);

    const columns = [
        {
            accessorKey: 'asset_name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Asset" />
            ),
            cell: ({ row }: any) => (
                <div>
                    <p className="font-medium">{row.getValue('asset_name')}</p>
                    <p className="text-xs text-muted-foreground">{row.getValue('asset_id')}</p>
                </div>
            ),
        },
        {
            accessorKey: 'user_name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned To" />
            ),
            cell: ({ row }: any) => (
                <div>
                    <p className="font-medium">{row.getValue('user_name')}</p>
                    <p className="text-xs text-muted-foreground">{row.getValue('user_email')}</p>
                </div>
            ),
        },
        {
            accessorKey: 'purpose_category',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Purpose" />
            ),
            cell: ({ row }: any) => {
                const category = row.getValue('purpose_category');
                const categoryLabels: Record<string, string> = {
                    operational: 'Operational',
                    project: 'Project',
                    maintenance: 'Maintenance',
                    personal: 'Personal',
                    emergency: 'Emergency',
                    training: 'Training',
                    replacement: 'Replacement',
                    upgrade: 'Upgrade',
                };
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {categoryLabels[category] || category}
                    </span>
                );
            },
        },
        {
            accessorKey: 'withdrawal_date',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Withdrawn On" />
            ),
        },
        {
            accessorKey: 'duration',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Duration" />
            ),
        },
        {
            accessorKey: 'expected_return_date',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Return Date" />
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const status = row.getValue('status');
                const isOverdue = row.getValue('is_overdue');

                let statusStyles = {
                    active: 'bg-green-100 text-green-700',
                    returned: 'bg-blue-100 text-blue-700',
                    overdue: 'bg-red-100 text-red-700',
                    lost: 'bg-red-100 text-red-700',
                    damaged: 'bg-orange-100 text-orange-700',
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}`}>
                        {isOverdue && <AlertTriangle className="inline h-3 w-3 mr-1" />}
                        {status.replace('_', ' ').toUpperCase()}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Withdrawals" />

            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Asset Withdrawals
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track and manage asset checkouts and returns
                        </p>
                    </div>
                </div>
                <Link href="/withdrawals/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Withdrawal
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredWithdrawals}
                exportFileName="asset_withdrawals"
            />
        </div>
    );
}

WithdrawalsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Withdrawals',
            href: '/withdrawals',
        },
        {
            title: 'All Withdrawals',
            href: '#',
        },
    ],
};