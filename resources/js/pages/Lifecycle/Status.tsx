import { Head } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';

export default function Status({ assets = [] }: { assets: any[] }) {
    const columns = React.useMemo(() => [
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
            accessorKey: 'status',
            header: 'Operational Status',
            cell: ({ row }: any) => {
                const status = row.getValue('status');
                return (
                    <Badge variant={
                        status === 'available' ? 'success' : 
                        status === 'under_maintenance' ? 'warning' : 
                        status === 'faulty' ? 'destructive' : 'outline'
                    }>
                        {status || 'Unknown'}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'condition_status',
            header: 'Physical Condition',
            cell: ({ row }: any) => {
                const condition = row.getValue('condition_status');
                return (
                    <span className="capitalize">{condition || 'N/A'}</span>
                );
            }
        },
        {
            accessorKey: 'updated_at',
            header: 'Last Updated',
            cell: ({ row }: any) => new Date(row.getValue('updated_at')).toLocaleDateString()
        }
    ], []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Status Tracking" />
            <div className="flex items-center">
                <Activity className="h-8 w-8 mr-3 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Asset Status Tracking</h1>
            </div>
            <p className="text-muted-foreground">Monitor real-time operational states and historical transitions for all assets.</p>
            
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
                <DataTable 
                    columns={columns} 
                    data={assets} 
                    searchKey="product_name" 
                />
            </div>
        </div>
    );
}

Status.layout = {
    breadcrumbs: [
        {
            title: 'Asset Status Tracking',
            href: '#',
        },
    ],
};
