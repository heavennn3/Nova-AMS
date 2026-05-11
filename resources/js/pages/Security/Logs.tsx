import { Head, router } from '@inertiajs/react';
import { ShieldAlert, Eye, History, User, Activity, Globe } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import * as React from 'react';

export default function Logs({ logs = [] }: { logs: any[] }) {
    const columns = React.useMemo(() => [
        {
            accessorKey: 'created_at',
            header: 'Timestamp',
            headerText: 'Timestamp',
            cell: ({ row }: any) => <span className="font-mono text-xs">{row.getValue('created_at')}</span>
        },
        {
            accessorKey: 'user_name',
            header: 'User',
            headerText: 'User',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                    </div>
                    <span className="font-medium">{row.getValue('user_name')}</span>
                </div>
            )
        },
        {
            accessorKey: 'event',
            header: 'Action',
            headerText: 'Action',
            cell: ({ row }: any) => {
                const event = row.getValue('event') as string;
                const colors: any = {
                    created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    updated: 'bg-amber-100 text-amber-700 border-amber-200',
                    deleted: 'bg-red-100 text-red-700 border-red-200',
                    login: 'bg-blue-100 text-blue-700 border-blue-200',
                };
                return (
                    <Badge variant="outline" className={`${colors[event] || 'bg-slate-100'} capitalize px-2 py-0 h-5 text-[10px]`}>
                        {event}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'auditable_type',
            header: 'Resource',
            headerText: 'Resource',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>{row.getValue('auditable_type')}</span>
                </div>
            )
        },
        {
            accessorKey: 'ip_address',
            header: 'Source IP',
            headerText: 'Source IP',
            cell: ({ row }: any) => (
                <div className="flex flex-col text-[10px] text-muted-foreground font-mono leading-tight">
                    <div className="flex items-center">
                        <Globe className="h-2.5 w-2.5 mr-1" />
                        {row.getValue('ip_address')}
                    </div>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Changes',
            cell: ({ row }: any) => {
                const log = row.original;
                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/5">
                                <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center">
                                    <History className="h-5 w-5 mr-2 text-primary" />
                                    Change Audit Detail
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Previous State</h4>
                                    <pre className="bg-muted p-3 rounded-lg text-[10px] overflow-auto border min-h-[200px]">
                                        {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-emerald-600">Updated State</h4>
                                    <pre className="bg-emerald-50/50 p-3 rounded-lg text-[10px] overflow-auto border border-emerald-100 min-h-[200px]">
                                        {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
        }
    ], []);

    return (
        <div className="p-8 space-y-8 w-full">
            <Head title="System Audit Logs" />

            <div className="flex justify-between items-end">
                <div className="text-left">
                    <div className="flex items-center space-x-2 text-primary mb-1">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Compliance & Governance</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">System Activity Logs</h1>
                    <p className="text-muted-foreground mt-2">Nova AMS Track & View Activities Logs.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.get('/security/logs')}>
                        All Logs
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.get('/security/logs', { event: 'login' })}>
                        <History className="w-4 h-4 mr-2" /> Login History
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.get('/security/logs', { event: 'created' })}>
                        Creations
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.get('/security/logs', { event: 'deleted' })}>
                        Deletions
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={logs}
                    searchKey="user_name"
                />
            </div>
        </div>
    );
}

Logs.layout = {
    breadcrumbs: [
        {
            title: 'System Security',
            href: '#',
        },
        {
            title: 'Audit Logs',
            href: '/security/logs',
        },
    ],
};
