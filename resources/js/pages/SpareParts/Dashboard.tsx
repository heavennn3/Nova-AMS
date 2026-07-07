import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, AlertTriangle, CheckCircle, TrendingUp, ArrowRight, X } from 'lucide-react';

export default function SparePartsDashboard({
    totalParts = 0,
    totalValue = '0.00',
    availableParts = 0,
    lowStockParts = 0,
    outOfStockParts = 0,
    categoryData = [],
    recentCheckouts = [],
    lowStockAlerts = [],
    allParts = [],
}: {
    totalParts: number;
    totalValue: string;
    availableParts: number;
    lowStockParts: number;
    outOfStockParts: number;
    categoryData: any[];
    recentCheckouts: any[];
    lowStockAlerts: any[];
    allParts: any[];
}) {
    const [activeStat, setActiveStat] = useState<string | null>(null);

    const statFilters: Record<string, (p: any) => boolean> = {
        'Total Spare Parts': () => true,
        'Available': (p) => p.status === 'available',
        'Low Stock': (p) => p.stock_level > 0 && p.stock_level <= p.minimum_stock_level,
        'Out of Stock': (p) => p.stock_level <= 0,
        'Faulty Parts': (p) => p.status === 'faulty',
    };

    const filteredParts = useMemo(() => {
        const filterFn = statFilters[activeStat || ''];
        return filterFn ? allParts.filter(filterFn) : [];
    }, [activeStat, allParts]);

    const statsCards = [
        {
            title: 'Total Spare Parts',
            value: totalParts.toString(),
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },

        {
            title: 'Available',
            value: availableParts.toString(),
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Low Stock',
            value: lowStockParts.toString(),
            icon: AlertTriangle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Out of Stock',
            value: outOfStockParts.toString(),
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            title: 'Faulty Parts',
            value: outOfStockParts.toString(),
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
    ];

    const checkoutColumns = [
        {
            accessorKey: 'part_name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Part Name" />
            ),
        },
        {
            accessorKey: 'user_name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
        },
        {
            accessorKey: 'quantity',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Quantity" />
            ),
        },
        {
            accessorKey: 'checkout_date',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Checkout Date" />
            ),
        },
        {
            accessorKey: 'status',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const status = row.getValue('status');
                const statusStyles = {
                    checked_out: 'bg-blue-100 text-blue-700',
                    returned: 'bg-green-100 text-green-700',
                    overdue: 'bg-red-100 text-red-700',
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}`}>
                        {status.replace('_', ' ').toUpperCase()}
                    </span>
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
                {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    const isActive = activeStat === stat.title;
                    return (
                        <button
                            key={stat.title}
                            type="button"
                            onClick={() => setActiveStat(activeStat === stat.title ? null : stat.title)}
                            className={`text-left rounded-xl border transition-all duration-200 ${isActive
                                ? 'ring-2 ring-offset-2 shadow-lg scale-[1.02]'
                                : 'hover:shadow-md hover:scale-[1.01]'
                                }`}
                        >
                            <Card className={`border-0 shadow-none ${isActive ? stat.bgColor : ''}`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
                                </CardContent>
                            </Card>
                        </button>
                    );
                })}
            </div>

            {/* Filtered Parts Table */}
            {activeStat && (
                <Card className="overflow-hidden border-emerald-200">
                    <CardHeader className="flex flex-row items-center justify-between bg-muted/30 py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${statsCards.find(s => s.title === activeStat)?.color.replace('text-', 'bg-')}`} />
                            {activeStat} Parts
                        </CardTitle>
                        <button type="button" onClick={() => setActiveStat(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <DataTable
                            columns={[
                                { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
                                { accessorKey: 'category', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" /> },
                                { accessorKey: 'stock_level', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Stock" /> },
                                { accessorKey: 'location', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Location" /> },
                            ]}
                            data={filteredParts}
                            hideToolbar
                        />
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categoryData.map((cat: any) => (
                                <div key={cat.category} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{cat.category}</p>
                                        <p className="text-sm text-muted-foreground">{cat.count} items</p>
                                    </div>

                                </div>
                            ))}
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

            {/* Recent Checkouts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Checkouts</CardTitle>
                    <Link href="/spare-parts">
                        <Button variant="outline" size="sm">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentCheckouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent checkouts
                        </p>
                    ) : (
                        <DataTable
                            columns={checkoutColumns}
                            data={recentCheckouts}
                            hideToolbar
                        />
                    )}
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