import { Head } from '@inertiajs/react';
import { Monitor, Users, Key, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';

type UsageReportProps = {
    licenses: any[];
};

export default function UsageReport({ licenses = [] }: UsageReportProps) {
    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'License Name',
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{row.getValue('name')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'license_type',
                header: 'Type',
                cell: ({ row }: any) => {
                    const type = row.original.license_type;
                    const typeLabels: Record<string, { label: string; icon: any }> = {
                        per_user: { label: 'Per User', icon: Users },
                        per_device: { label: 'Per Device', icon: Monitor },
                        concurrent: { label: 'Concurrent', icon: TrendingUp },
                        subscription: { label: 'Subscription', icon: Key },
                        perpetual: { label: 'Perpetual', icon: Key },
                    };
                    const { label, icon: Icon } = typeLabels[type] || { label: type, icon: Key };
                    return (
                        <Badge variant="outline" className="gap-1">
                            <Icon className="h-3 w-3" />
                            {label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'seats_usage',
                header: 'Seats Usage',
                cell: ({ row }: any) => {
                    const used = row.original.used_seats;
                    const total = row.original.total_seats;
                    const percentage = row.original.utilization_percentage;

                    return (
                        <div className="flex w-full max-w-[180px] flex-col space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{used} / {total} seats</span>
                                <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <Progress
                                value={percentage}
                                className="h-2"
                                indicatorClassName={
                                    percentage >= 90
                                        ? 'bg-red-500'
                                        : percentage >= 70
                                          ? 'bg-amber-500'
                                          : 'bg-emerald-500'
                                }
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: 'compliance_status',
                header: 'Compliance',
                cell: ({ row }: any) => {
                    const status = row.original.compliance_status;
                    return (
                        <Badge
                            variant={
                                status === 'compliant'
                                    ? 'success'
                                    : status === 'expiring_soon'
                                      ? 'warning'
                                      : 'destructive'
                            }
                        >
                            {status === 'compliant' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                                <AlertTriangle className="mr-1 h-3 w-3" />
                            )}
                            {status.replace('_', ' ')}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'vendor',
                header: 'Vendor',
                cell: ({ row }: any) => row.original.vendor || 'N/A',
            },
            {
                accessorKey: 'assignments',
                header: 'Assignments',
                cell: ({ row }: any) => {
                    const assignments = row.original.assignments || [];
                    if (assignments.length === 0) return <span className="text-muted-foreground">No assignments</span>;

                    return (
                        <div className="max-h-[120px] space-y-1 overflow-y-auto">
                            {assignments.slice(0, 3).map((assignment: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1">
                                        {assignment.assignment_type === 'user' ? (
                                            <Users className="h-3 w-3 text-blue-500" />
                                        ) : (
                                            <Monitor className="h-3 w-3 text-purple-500" />
                                        )}
                                        <span className="font-medium">{assignment.assigned_to}</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        Seat #{assignment.seat_number}
                                    </span>
                                </div>
                            ))}
                            {assignments.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                    +{assignments.length - 3} more assignments
                                </div>
                            )}
                        </div>
                    );
                },
            },
        ],
        [],
    );

    // Statistics
    const stats = React.useMemo(() => {
        const totalLicenses = licenses.length;
        const totalSeats = licenses.reduce((sum, l) => sum + l.total_seats, 0);
        const usedSeats = licenses.reduce((sum, l) => sum + l.used_seats, 0);
        const utilizationPercentage = totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0;

        const fullyUtilized = licenses.filter(l => l.used_seats >= l.total_seats).length;
        const available = licenses.filter(l => l.used_seats < l.total_seats).length;

        return {
            totalLicenses,
            totalSeats,
            usedSeats,
            utilizationPercentage,
            fullyUtilized,
            available,
        };
    }, [licenses]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="License Usage Report" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">License Usage Report</h1>
                    <p className="text-muted-foreground mt-1">
                        Detailed view of license utilization and assignment details
                    </p>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Key className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalLicenses}</p>
                                <p className="text-sm text-muted-foreground">Total Licenses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalSeats}</p>
                                <p className="text-sm text-muted-foreground">Total Seats</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.usedSeats}</p>
                                <p className="text-sm text-muted-foreground">Seats in Use</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.utilizationPercentage}%</p>
                                <p className="text-sm text-muted-foreground">Utilization</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <Monitor className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.fullyUtilized}</p>
                                <p className="text-sm text-muted-foreground">Fully Used</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.available}</p>
                                <p className="text-sm text-muted-foreground">Available</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable columns={columns} data={licenses} searchKey="name" />
            </div>
        </div>
    );
}

UsageReport.layout = {
    breadcrumbs: [
        { title: 'Software Licenses', href: '/licenses' },
        { title: 'Usage Report', href: '/licenses/usage-report' },
    ],
};