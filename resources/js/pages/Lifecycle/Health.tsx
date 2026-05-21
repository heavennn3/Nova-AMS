import { Head } from '@inertiajs/react';
import { HeartPulse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';

export default function Health({ assets = [] }: { assets: any[] }) {
    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'asset_id',
                header: 'Asset ID',
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
                accessorKey: 'health_score',
                header: 'Health Score',
                cell: ({ row }: any) => {
                    const score = row.getValue('health_score');
                    return (
                        <div className="flex w-full max-w-[120px] flex-col space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span
                                    className={`font-bold ${
                                        score >= 80
                                            ? 'text-emerald-600'
                                            : score >= 50
                                              ? 'text-amber-600'
                                              : 'text-red-600'
                                    }`}
                                >
                                    {score}%
                                </span>
                            </div>
                            <Progress
                                value={score}
                                className="h-1.5"
                                indicatorClassName={
                                    score >= 80
                                        ? 'bg-emerald-500'
                                        : score >= 50
                                          ? 'bg-amber-500'
                                          : 'bg-red-500'
                                }
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: 'condition_status',
                header: 'Condition',
                cell: ({ row }: any) => {
                    const condition = row.getValue('condition_status');
                    return <span className="capitalize">{condition}</span>;
                },
            },
        ],
        [],
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Health Scoring" />
            <div className="flex items-center">
                <HeartPulse className="mr-3 h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Health Scoring
                </h1>
            </div>
            <p className="text-muted-foreground">
                Lifespan analysis based on age, physical condition, and
                operational stability.
            </p>

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable
                    columns={columns}
                    data={assets}
                    searchKey="product_name"
                />
            </div>
        </div>
    );
}

Health.layout = {
    breadcrumbs: [
        {
            title: 'Health Scoring',
            href: '#',
        },
    ],
};
