import { Head } from '@inertiajs/react';
import { History, FileText, Settings, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';

type AuditProps = {
    audits: any[];
};

export default function Audit({ audits = [] }: AuditProps) {
    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'created_at',
                header: 'Timestamp',
                cell: ({ row }: any) => {
                    const timestamp = row.getValue('created_at');
                    return new Date(timestamp).toLocaleString();
                },
            },
            {
                accessorKey: 'user.name',
                header: 'User',
                cell: ({ row }: any) => row.original.user?.name || 'System',
            },
            {
                accessorKey: 'event',
                header: 'Event',
                cell: ({ row }: any) => {
                    const event = row.getValue('event');
                    const eventStyles: Record<string, { variant: string; icon: any }> = {
                        created: { variant: 'success', icon: FileText },
                        updated: { variant: 'default', icon: Settings },
                        deleted: { variant: 'destructive', icon: AlertCircle },
                        restored: { variant: 'success', icon: FileText },
                        assigned: { variant: 'default', icon: User },
                        transferred: { variant: 'default', icon: User },
                    };

                    const style = eventStyles[event] || { variant: 'outline', icon: FileText };
                    const Icon = style.icon;

                    return (
                        <Badge variant={style.variant as any} className="gap-1">
                            <Icon className="h-3 w-3" />
                            {event}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'auditable_type',
                header: 'Entity Type',
                cell: ({ row }: any) => {
                    const type = row.getValue('auditable_type');
                    if (!type) return 'N/A';
                    return type.split('\\').pop();
                },
            },
            {
                accessorKey: 'auditable_id',
                header: 'Entity ID',
                cell: ({ row }: any) => `#${row.getValue('auditable_id')}`,
            },
            {
                accessorKey: 'ip_address',
                header: 'IP Address',
                cell: ({ row }: any) => row.getValue('ip_address') || 'N/A',
            },
            {
                accessorKey: 'user_agent',
                header: 'User Agent',
                cell: ({ row }: any) => {
                    const userAgent = row.getValue('user_agent');
                    if (!userAgent) return 'N/A';
                    return (
                        <span className="max-w-[300px] truncate text-xs">
                            {userAgent}
                        </span>
                    );
                },
            },
        ],
        [],
    );

    // Statistics
    const stats = React.useMemo(() => {
        const today = audits.filter(a => {
            const auditDate = new Date(a.created_at).toDateString();
            return auditDate === new Date().toDateString();
        }).length;

        const thisWeek = audits.filter(a => {
            const auditDate = new Date(a.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return auditDate >= weekAgo;
        }).length;

        const thisMonth = audits.filter(a => {
            const auditDate = new Date(a.created_at);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return auditDate >= monthAgo;
        }).length;

        return { today, thisWeek, thisMonth, total: audits.length };
    }, [audits]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Audit Trail" />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <History className="mr-3 h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Audit Trail
                    </h1>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <History className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.today}</p>
                                <p className="text-sm text-muted-foreground">Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                                <p className="text-sm text-muted-foreground">This Week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <Settings className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                                <p className="text-sm text-muted-foreground">This Month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                <User className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Events</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable
                    columns={columns}
                    data={audits}
                    searchKey="event"
                />
            </div>
        </div>
    );
}

Audit.layout = {
    breadcrumbs: [
        {
            title: 'Audit Trail',
            href: '#',
        },
    ],
};
