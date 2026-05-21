import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    CheckCircle,
    Wrench,
    AlertTriangle,
    Activity,
    DollarSign,
    TrendingDown,
    Headset,
    Cpu,
    Layers,
    HardDrive,
    Plus,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
    LineChart,
    Line,
} from 'recharts';

export default function Dashboard({
    stats = {
        totalAssets: 0,
        totalSites: 0,
        activeWorkOrders: 0,
        openTickets: 0,
    },
    charts = { assetsByStatus: [], assetsBySite: [], monthlyAssets: [] },
    recentActivities = [],
}: any) {
    const [telemetry, setTelemetry] = useState({
        cpu: '0.0',
        ram: '0.0',
        disk: 0,
    });

    useEffect(() => {
        let active = true;
        const fetchTelemetry = async () => {
            try {
                const response = await fetch('/api/system/monitoring');
                if (response.ok && active) {
                    const data = await response.json();
                    setTelemetry(data);
                }
            } catch (err) {
                console.error('Telemetry fetch failed:', err);
            }
        };

        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 5000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    const colors = [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
    ];

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Nova AMS Dashboard" />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Overview of assets, maintenance, and site operations.
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const csvContent =
                                'data:text/csv;charset=utf-8,' +
                                'Metric,Value\n' +
                                `Total Assets,${stats.totalAssets}\n` +
                                `Sites Managed,${stats.totalSites}\n` +
                                `Active Work Orders,${stats.activeWorkOrders}\n` +
                                `Open Tickets,${stats.openTickets}`;

                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute(
                                'download',
                                'dashboard_summary.csv',
                            );
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                    >
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Export Data
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Assets
                                </p>
                                <p className="text-3xl font-bold">
                                    {stats.totalAssets}
                                </p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-2">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Sites Managed
                                </p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {stats.totalSites}
                                </p>
                            </div>
                            <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                                <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Active Work Orders
                                </p>
                                <p className="text-3xl font-bold text-amber-600">
                                    {stats.activeWorkOrders}
                                </p>
                            </div>
                            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Open Tickets
                                </p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {stats.openTickets}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Headset className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Acquisition Velocity Area Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Asset Lifecycle & Acquisition Velocity</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Physical assets registered over the last 6 months.</p>
                        </div>
                        <span className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded border border-border">DATABASE_LOGS</span>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        {charts.monthlyAssets && charts.monthlyAssets.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={charts.monthlyAssets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                        }}
                                        labelStyle={{ fontWeight: 'bold', fontSize: 11 }}
                                        itemStyle={{ fontSize: 11, color: 'hsl(var(--primary))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Assets Registered"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAssets)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">
                                No registration logs recorded in the past 6 months.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Infrastructure Telemetry & Quick Action panel */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>System Telemetry & Controls</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Live physical server load & quick dispatch.</p>
                        </div>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Live telemetry progress bars */}
                        <div className="space-y-3.5">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center"><Cpu className="mr-1.5 h-3.5 w-3.5 text-zinc-500" /> CPU Cluster</span>
                                    <span>{telemetry.cpu}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                                    <div
                                        className="h-full bg-zinc-900 rounded-full transition-all duration-500 dark:bg-white"
                                        style={{ width: `${Math.min(100, Math.max(0, parseFloat(telemetry.cpu || '0')))}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center"><Layers className="mr-1.5 h-3.5 w-3.5 text-zinc-500" /> RAM Buffers</span>
                                    <span>{telemetry.ram}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                                    <div
                                        className="h-full bg-zinc-900 rounded-full transition-all duration-500 dark:bg-white"
                                        style={{ width: `${Math.min(100, Math.max(0, parseFloat(telemetry.ram || '0')))}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="flex items-center"><HardDrive className="mr-1.5 h-3.5 w-3.5 text-zinc-500" /> NVMe Array</span>
                                    <span>{telemetry.disk}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
                                    <div
                                        className="h-full bg-zinc-900 rounded-full transition-all duration-500 dark:bg-white"
                                        style={{ width: `${Math.min(100, Math.max(0, telemetry.disk || 0))}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Quick dispatcher actions */}
                        <div className="pt-2 space-y-2 border-t border-border/80">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Platform Dispatcher</p>
                            <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" size="sm" className="h-8.5 justify-start text-xs font-semibold" asChild>
                                    <Link href="/assets/create">
                                        <Plus className="mr-2 h-3.5 w-3.5" /> Register Hardware Asset
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" className="h-8.5 justify-start text-xs font-semibold" asChild>
                                    <Link href="/maintenance/work-orders">
                                        <Wrench className="mr-2 h-3.5 w-3.5" /> Create Maintenance Order
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* recent activity*/}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">

                            Recent Operations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map(
                                (activity: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`h-2 w-2 rounded-full ${activity.type === 'asset'
                                                    ? 'bg-primary'
                                                    : 'bg-amber-500'
                                                    }`}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                            {recentActivities.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    No recent activities.
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className="mt-4 w-full text-xs"
                            asChild
                        >
                            <Link href="/asset-inventory">View Audit Log</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'NOVA AMS Dashboard',
            href: '#',
        },
    ],
};
