import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

export default function WithdrawalsIndex({ withdrawals = [], siteId = null }: { withdrawals: any[]; siteId: string | null }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [siteFilter, setSiteFilter] = useState(siteId || 'all');
    const [sites, setSites] = useState<{ id: number; name: string }[]>([]);

    // Fetch sites from the Withdrawals data (all unique sites)
    useEffect(() => {
        const uniqueSites = Array.from(new Set(withdrawals.map((w: any) => w.site_id)))
            .filter((id: number | null) => id !== null)
            .map((id: number) => {
                const siteWithdrawal = withdrawals.find((w: any) => w.site_id === id);
                return {
                    id,
                    name: siteWithdrawal?.site_name || `Site ${id}`,
                };
            });
        setSites(uniqueSites);
    }, [withdrawals]);

    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter((w: any) => {
            const matchesSearch = !search ||
                w.asset_name.toLowerCase().includes(search.toLowerCase()) ||
                w.user_name.toLowerCase().includes(search.toLowerCase()) ||
                w.asset_id.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

            const matchesSite = siteFilter === 'all' || w.site_id === Number(siteFilter);

            return matchesSearch && matchesStatus && matchesSite;
        });
    }, [withdrawals, search, statusFilter, siteFilter]);

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
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="min-w-[150px]">
                    <Select value={siteFilter} onValueChange={(val) => setSiteFilter(val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Site" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sites</SelectItem>
                            {sites.map((site) => (
                                <SelectItem key={site.id} value={site.id.toString()}>
                                    {site.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="min-w-[150px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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