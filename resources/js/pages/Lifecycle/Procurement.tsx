import { Head, Link, router } from '@inertiajs/react';
import { Package, DollarSign, Calendar, Building2, FileText, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as React from 'react';

type ProcurementProps = {
    assets: any[];
    summary: {
        total_cost: number;
        total_assets: number;
        average_cost: number;
        cost_by_supplier: any[];
        monthly_spending: any[];
    };
};

export default function Procurement({ assets = [], summary }: ProcurementProps) {
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
                accessorKey: 'supplier.name',
                header: 'Supplier',
                cell: ({ row }: any) => row.original.supplier?.name || 'N/A',
            },
            {
                accessorKey: 'order_number',
                header: 'Order Number',
                cell: ({ row }: any) => row.getValue('order_number') || 'N/A',
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
                accessorKey: 'purchase_cost',
                header: 'Purchase Cost',
                cell: ({ row }: any) => {
                    const cost = row.getValue('purchase_cost');
                    if (!cost) return 'N/A';
                    return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(cost);
                },
            },
            {
                accessorKey: 'category.name',
                header: 'Category',
                cell: ({ row }: any) => row.original.category?.name || 'N/A',
            },
            {
                accessorKey: 'site.name',
                header: 'Site',
                cell: ({ row }: any) => row.original.site?.name || 'N/A',
            },
        ],
        [],
    );

    const stats = React.useMemo(() => {
        return {
            totalCost: summary?.total_cost || 0,
            totalAssets: assets.length,
            averageCost: summary?.average_cost || 0,
            activeSuppliers: new Set(assets.map(a => a.supplier_id)).size,
        };
    }, [assets, summary]);

    const costBySupplier = React.useMemo(() => {
        const supplierMap = new Map();

        assets.forEach(asset => {
            if (asset.supplier && asset.purchase_cost) {
                const current = supplierMap.get(asset.supplier.id) || {
                    name: asset.supplier.name,
                    totalCost: 0,
                    count: 0
                };
                current.totalCost += parseFloat(asset.purchase_cost) || 0;
                current.count += 1;
                supplierMap.set(asset.supplier.id, current);
            }
        });

        return Array.from(supplierMap.values()).sort((a, b) => b.totalCost - a.totalCost);
    }, [assets]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Procurement Tracking" />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Package className="mr-3 h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Procurement Tracking
                    </h1>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Procurement
                </Button>
            </div>

            {/* Summary Statistics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        maximumFractionDigits: 0,
                                    }).format(stats.totalCost)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Procurement Value</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalAssets}</p>
                                <p className="text-sm text-muted-foreground">Procured Assets</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                    }).format(stats.averageCost)}
                                </p>
                                <p className="text-sm text-muted-foreground">Average Cost per Asset</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <Building2 className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.activeSuppliers}</p>
                                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cost by Supplier */}
            {costBySupplier.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/30 p-4">
                        <h2 className="text-lg font-semibold">Procurement by Supplier</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {costBySupplier.slice(0, 5).map((supplier, index) => {
                                const percentage = (supplier.totalCost / stats.totalCost) * 100;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{supplier.name}</span>
                                                <Badge variant="outline">{supplier.count} assets</Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    }).format(supplier.totalCost)}
                                                </span>
                                                <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Procurement List */}
            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">Procurement Records</h2>
                </div>
                <div className="p-4">
                    <DataTable
                        columns={columns}
                        data={assets.filter(a => a.purchase_cost || a.order_number)}
                        searchKey="product_name"
                    />
                </div>
            </div>
        </div>
    );
}

Procurement.layout = {
    breadcrumbs: [
        {
            title: 'Procurement',
            href: '#',
        },
    ],
};