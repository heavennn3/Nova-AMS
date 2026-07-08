import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SparePartsDashboard({
    totalParts = 0,
    availableParts = 0,
    outOfStockParts = 0,
    categoryData = [],
    lowStockAlerts = [],
    allParts = [],
}: {
    totalParts: number;
    availableParts: number;
    outOfStockParts: number;
    categoryData: any[];
    lowStockAlerts: any[];
    allParts: any[];
}) {
    const sparePartColumns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Spare Part Name" />,
            cell: ({ row }: any) => <span className="font-semibold">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'part_number',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Serial Number" />,
            cell: ({ row }: any) => <span className="font-mono">{row.getValue('part_number')}</span>,
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
        },
        {
            accessorKey: 'location',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Place" />,
        },
        {
            accessorKey: 'site_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
        },
        {
            accessorKey: 'status',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }: any) => {
                const status = row.getValue('status') as string;
                const colors: Record<string, string> = {
                    available: 'bg-green-100 text-green-700',
                    in_used: 'bg-blue-100 text-blue-700',
                    faulty: 'bg-red-100 text-red-700',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status?.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            accessorKey: 'used_by_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Used By" />,
            cell: ({ row }: any) => <span>{row.getValue('used_by_name') ?? '—'}</span>,
        },
        {
            accessorKey: 'created_by_name',
            header: ({ column }: any) => <DataTableColumnHeader column={column} title="Added By" />,
            cell: ({ row }: any) => <span>{row.getValue('created_by_name') ?? 'N/A'}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const part = row.original;
                const nextStatus = part.status === 'available' ? 'faulty' : 'available';
                return (
                    <Button
                        variant="outline" size="sm"
                        onClick={() => {
                            if (confirm(`Set "${part.name}" to ${nextStatus}?`)) {
                                router.put(`/spare-parts/${part.id}`, {
                                    name: part.name,
                                    part_number: part.part_number,
                                    category: part.category,
                                    location: part.location,
                                    status: nextStatus,
                                });
                            }
                        }}
                    >
                        Set {nextStatus.replace('_', ' ')}
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Spare Parts Dashboard" />

            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Spare Parts Inventory
                    </h1>
                </div>
                <Link href="/spare-parts">
                    <Button>
                        <Package className="mr-2 h-4 w-4" />
                        View All Parts
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-3">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Items</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-3xl font-bold">{totalParts}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Available</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{availableParts}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Faulty</CardTitle><AlertTriangle className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-3xl font-bold text-red-600">{outOfStockParts}</div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b py-2 px-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
                                <Package className="h-3.5 w-3.5 text-emerald-600" />
                                Inventory by Category
                            </CardTitle>
                            <span className="text-[10px] text-muted-foreground bg-white px-1.5 py-0.5 rounded-full border">
                                {categoryData.length} groups
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1">
                            {categoryData.map((cat: any, i: number) => {
                                const colors = [
                                    { bg: 'bg-emerald-500', dot: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
                                    { bg: 'bg-blue-500', dot: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
                                    { bg: 'bg-purple-500', dot: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
                                    { bg: 'bg-amber-500', dot: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
                                    { bg: 'bg-rose-500', dot: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700' },
                                    { bg: 'bg-cyan-500', dot: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-700' },
                                ];
                                const c = colors[i % colors.length];
                                const maxCount = Math.max(...categoryData.map((x: any) => x.count), 1);
                                const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                                return (
                                    <div key={cat.category} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${c.light}`}>
                                            <span className={`text-[10px] font-bold ${c.text}`}>{cat.category[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-medium truncate">{cat.category}</p>
                                                <span className={`text-[10px] font-semibold tabular-nums ${c.text}`}>{cat.count}</span>
                                            </div>
                                            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mt-0.5">
                                                <div className={`h-full rounded-full transition-all ${c.bg}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Low Stock Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockAlerts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No low stock alerts
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockAlerts.map((alert: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div>
                                            <p className="font-medium text-sm">{alert.name}</p>
                                            <p className="text-xs text-muted-foreground">{alert.location}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-yellow-700">
                                                {alert.stock_level} / {alert.minimum_level}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All Spare Parts Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Spare Parts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable
                        columns={sparePartColumns}
                        data={allParts}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

SparePartsDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Spare Parts',
            href: '/spare-parts',
        },
        {
            title: 'Dashboard',
            href: '#',
        },
    ],
};