import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';

type WarrantyProps = {
    assets: any[];
};

export default function Warranty({ assets = [] }: WarrantyProps) {
    // Calculate warranty status
    const assetsWithWarranty = React.useMemo(() => {
        return assets.filter(asset => asset.warranty_months || asset.purchase_date).map(asset => {
            const purchaseDate = asset.purchase_date ? new Date(asset.purchase_date) : null;
            const warrantyMonths = asset.warranty_months || 0;

            let warrantyStatus = 'unknown';
            let warrantyExpiry = null;
            let daysRemaining = null;

            if (purchaseDate && warrantyMonths > 0) {
                warrantyExpiry = new Date(purchaseDate);
                warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths);

                const today = new Date();
                const diffTime = warrantyExpiry.getTime() - today.getTime();
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (daysRemaining < 0) {
                    warrantyStatus = 'expired';
                } else if (daysRemaining <= 90) {
                    warrantyStatus = 'expiring_soon';
                } else {
                    warrantyStatus = 'active';
                }
            }

            return {
                ...asset,
                warrantyStatus,
                warrantyExpiry,
                daysRemaining
            };
        });
    }, [assets]);

    // Statistics
    const stats = React.useMemo(() => {
        const active = assetsWithWarranty.filter(a => a.warrantyStatus === 'active').length;
        const expiringSoon = assetsWithWarranty.filter(a => a.warrantyStatus === 'expiring_soon').length;
        const expired = assetsWithWarranty.filter(a => a.warrantyStatus === 'expired').length;
        const noWarranty = assets.length - assetsWithWarranty.length;

        return { active, expiringSoon, expired, noWarranty };
    }, [assetsWithWarranty, assets.length]);

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
                accessorKey: 'supplier.name',
                header: 'Supplier',
                cell: ({ row }: any) => row.original.supplier?.name || 'N/A',
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
                accessorKey: 'warranty_months',
                header: 'Warranty Period',
                cell: ({ row }: any) => {
                    const months = row.getValue('warranty_months');
                    return months ? `${months} months` : 'N/A';
                },
            },
            {
                accessorKey: 'warrantyStatus',
                header: 'Warranty Status',
                cell: ({ row }: any) => {
                    const status = row.original.warrantyStatus;
                    const daysRemaining = row.original.daysRemaining;

                    if (status === 'active') {
                        return (
                            <Badge variant="success" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Active ({daysRemaining} days)
                            </Badge>
                        );
                    } else if (status === 'expiring_soon') {
                        return (
                            <Badge variant="warning" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Expiring Soon ({daysRemaining} days)
                            </Badge>
                        );
                    } else if (status === 'expired') {
                        return (
                            <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Expired
                            </Badge>
                        );
                    }
                    return <Badge variant="outline">Unknown</Badge>;
                },
            },
            {
                accessorKey: 'warrantyExpiry',
                header: 'Warranty Expiry',
                cell: ({ row }: any) => {
                    const expiry = row.original.warrantyExpiry;
                    return expiry ? expiry.toLocaleDateString() : 'N/A';
                },
            },
        ],
        [],
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Warranty Management" />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <ShieldAlert className="mr-3 h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Warranty Management
                    </h1>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.active}</p>
                                <p className="text-sm text-muted-foreground">Active Warranties</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                                <p className="text-sm text-muted-foreground">Expiring Soon (≤90 days)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expired}</p>
                                <p className="text-sm text-muted-foreground">Expired Warranties</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <ShieldAlert className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.noWarranty}</p>
                                <p className="text-sm text-muted-foreground">No Warranty Info</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable
                    columns={columns}
                    data={assetsWithWarranty}
                    searchKey="product_name"
                />
            </div>
        </div>
    );
}

Warranty.layout = {
    breadcrumbs: [
        {
            title: 'Warranty Management',
            href: '#',
        },
    ],
};
