import { Head, Link } from '@inertiajs/react';
import { Clock, AlertTriangle, Calendar, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';

type EolProps = {
    assets: any[];
};

export default function EndOfLife({ assets = [] }: EolProps) {
    // Calculate EOL status and lifecycle information
    const assetsWithEol = React.useMemo(() => {
        return assets.map(asset => {
            const purchaseDate = asset.purchase_date ? new Date(asset.purchase_date) : null;
            const eolDate = asset.eol_date ? new Date(asset.eol_date) : null;
            const warrantyMonths = asset.warranty_months || 0;

            let lifecycleStatus = 'unknown';
            let daysRemaining = null;
            let lifecyclePercentage = null;
            let warrantyExpiry = null;

            if (eolDate) {
                const today = new Date();
                const diffTime = eolDate.getTime() - today.getTime();
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Calculate lifecycle percentage
                if (purchaseDate) {
                    const totalLifecycle = eolDate.getTime() - purchaseDate.getTime();
                    const elapsed = today.getTime() - purchaseDate.getTime();
                    lifecyclePercentage = Math.max(0, Math.min(100, (elapsed / totalLifecycle) * 100));
                }

                if (daysRemaining < 0) {
                    lifecycleStatus = 'expired';
                } else if (daysRemaining <= 180) {
                    lifecycleStatus = 'expiring_soon';
                } else if (daysRemaining <= 365) {
                    lifecycleStatus = 'upcoming';
                } else {
                    lifecycleStatus = 'active';
                }
            }

            // Calculate warranty expiry
            if (purchaseDate && warrantyMonths > 0) {
                warrantyExpiry = new Date(purchaseDate);
                warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths);
            }

            return {
                ...asset,
                lifecycleStatus,
                daysRemaining,
                lifecyclePercentage,
                warrantyExpiry,
                purchaseAge: purchaseDate ? Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)) : null
            };
        });
    }, [assets]);

    // Statistics
    const stats = React.useMemo(() => {
        const expired = assetsWithEol.filter(a => a.lifecycleStatus === 'expired').length;
        const expiringSoon = assetsWithEol.filter(a => a.lifecycleStatus === 'expiring_soon').length;
        const upcoming = assetsWithEol.filter(a => a.lifecycleStatus === 'upcoming').length;
        const active = assetsWithEol.filter(a => a.lifecycleStatus === 'active').length;
        const noEol = assetsWithEol.filter(a => !a.eol_date).length;

        return { expired, expiringSoon, upcoming, active, noEol };
    }, [assetsWithEol]);

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'asset_id',
                header: 'Asset ID',
                cell: ({ row }: any) => (
                    <Link
                        href={`/assets/${row.original.id}`}
                        className="text-primary hover:underline font-mono font-semibold"
                    >
                        {row.getValue('asset_id')}
                    </Link>
                ),
            },
            {
                accessorKey: 'product_name',
                header: 'Product Name',
            },
            {
                accessorKey: 'site.name',
                header: 'Site',
            },
            {
                accessorKey: 'category.name',
                header: 'Category',
                cell: ({ row }: any) => row.original.category?.name || 'N/A',
            },
            {
                accessorKey: 'purchase_date',
                header: 'Purchase Date',
                cell: ({ row }: any) => {
                    const date = row.getValue('purchase_date');
                    return date ? new Date(date).toLocaleDateString() : 'N/A';
                },
            },
            {
                accessorKey: 'purchaseAge',
                header: 'Age',
                cell: ({ row }: any) => {
                    const age = row.original.purchaseAge;
                    return age !== null ? `${age} years` : 'N/A';
                },
            },
            {
                accessorKey: 'lifecycleStatus',
                header: 'Lifecycle Status',
                cell: ({ row }: any) => {
                    const status = row.original.lifecycleStatus;
                    const daysRemaining = row.original.daysRemaining;

                    if (status === 'active') {
                        return (
                            <Badge variant="success" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Active ({daysRemaining} days)
                            </Badge>
                        );
                    } else if (status === 'upcoming') {
                        return (
                            <Badge variant="default" className="gap-1">
                                <Calendar className="h-3 w-3" />
                                EOL Upcoming ({daysRemaining} days)
                            </Badge>
                        );
                    } else if (status === 'expiring_soon') {
                        return (
                            <Badge variant="warning" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Expiring Soon ({daysRemaining} days)
                            </Badge>
                        );
                    } else if (status === 'expired') {
                        return (
                            <Badge variant="destructive" className="gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Expired
                            </Badge>
                        );
                    }
                    return <Badge variant="outline">Unknown</Badge>;
                },
            },
            {
                accessorKey: 'eol_date',
                header: 'End of Life Date',
                cell: ({ row }: any) => {
                    const date = row.getValue('eol_date');
                    return date ? new Date(date).toLocaleDateString() : 'N/A';
                },
            },
            {
                accessorKey: 'lifecyclePercentage',
                header: 'Lifecycle Progress',
                cell: ({ row }: any) => {
                    const percentage = row.original.lifecyclePercentage;
                    const status = row.original.lifecycleStatus;

                    if (percentage === null) return 'N/A';

                    let colorClass = 'bg-primary';
                    if (status === 'expired') colorClass = 'bg-red-500';
                    else if (status === 'expiring_soon') colorClass = 'bg-amber-500';
                    else if (status === 'upcoming') colorClass = 'bg-yellow-500';

                    return (
                        <div className="flex w-full max-w-[120px] flex-col space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold">{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress
                                value={percentage}
                                className="h-1.5"
                                indicatorClassName={colorClass}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: 'warrantyExpiry',
                header: 'Warranty Status',
                cell: ({ row }: any) => {
                    const warrantyDate = row.original.warrantyExpiry;
                    if (!warrantyDate) return 'No Warranty';

                    const today = new Date();
                    const isExpired = warrantyDate < today;
                    const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (isExpired) {
                        return (
                            <Badge variant="destructive">
                                Expired ({Math.abs(daysUntilExpiry)} days ago)
                            </Badge>
                        );
                    } else if (daysUntilExpiry <= 90) {
                        return (
                            <Badge variant="warning">
                                Expiring Soon ({daysUntilExpiry} days)
                            </Badge>
                        );
                    }
                    return (
                        <Badge variant="success">
                            Active until {warrantyDate.toLocaleDateString()}
                        </Badge>
                    );
                },
            },
        ],
        [],
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="End of Life Tracking" />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Clock className="mr-3 h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        End of Life Tracking
                    </h1>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <Clock className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.upcoming}</p>
                                <p className="text-sm text-muted-foreground">Upcoming</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expired}</p>
                                <p className="text-sm text-muted-foreground">Expired</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <Info className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.noEol}</p>
                                <p className="text-sm text-muted-foreground">No EOL Set</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts for immediate action */}
            {(stats.expired > 0 || stats.expiringSoon > 0) && (
                <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">Action Required</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                You have {stats.expired} expired and {stats.expiringSoon} assets expiring soon.
                                Review these assets for replacement or decommissioning planning.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable
                    columns={columns}
                    data={assetsWithEol}
                    searchKey="product_name"
                />
            </div>
        </div>
    );
}

EndOfLife.layout = {
    breadcrumbs: [
        {
            title: 'End of Life',
            href: '#',
        },
    ],
};