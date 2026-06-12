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
    Users,
    Sun,
    CloudRain,
    Cloud,
    CloudLightning,
    Clock,
    MapPin,
} from 'lucide-react';
import {
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';

const WeatherIcon = ({ condition }: { condition: string }) => {
    switch (condition) {
        case 'Sunny':
            return <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />;
        case 'Light Rain':
            return <CloudRain className="h-5 w-5 text-blue-400" />;
        case 'Thunderstorm':
            return <CloudLightning className="h-5 w-5 text-purple-500 animate-pulse" />;
        default:
            return <Cloud className="h-5 w-5 text-slate-400" />;
    }
};

export default function Dashboard({
    stats = {
        totalAssets: 0,
        totalSites: 0,
        totalUsers: 0,
        activeWorkOrders: 0,
        openTickets: 0,
        lowSpareParts: [],
        sitesWithStats: [],
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

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Nova AMS Dashboard" />

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
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
                                `Total Users,${stats.totalUsers}\n` +
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

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-l-4 border-l-primary bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Assets
                                </p>
                                <p className="text-3xl font-bold">{stats.totalAssets}</p>
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

                <Card className="border-l-4 border-l-purple-500 bg-card/50 shadow-sm backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Users
                                </p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {stats.totalUsers || 0}
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Asset Lifecycle & Registration Velocity</CardTitle>
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

            {/* Low Spareparts & Site Weather Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Low Stock Alerts */}
                <Card className="border border-red-100 dark:border-red-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5" /> Low Spareparts Alert
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Inventory stock levels running below minimum thresholds.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Action Required
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-border/60">
                            {stats.lowSpareParts && stats.lowSpareParts.length > 0 ? (
                                stats.lowSpareParts.map((part: any) => (
                                    <div key={part.id} className="py-3 flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-foreground">{part.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                                <span className="font-mono bg-muted px-1.5 py-0.2 rounded border mr-2">{part.part_number}</span>
                                                <MapPin className="h-3 w-3 mr-1 text-slate-400" /> {part.site}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center rounded bg-amber-50 dark:bg-amber-950/20 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                                Stock: {part.stock_level} (Min: {part.minimum_stock_level})
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-xs">
                                    All sparepart inventory levels are within normal range.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Site managed with Live Weather */}
                <Card>
                    <CardHeader pb-2>
                        <CardTitle>Site Meteorological Monitoring</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Current local conditions for site asset operations.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.sitesWithStats && stats.sitesWithStats.length > 0 ? (
                                stats.sitesWithStats.map((site: any) => (
                                    <div key={site.id} className="flex items-center justify-between p-3 border border-border/80 bg-muted/20 rounded-xl">
                                        <div className="space-y-1">
                                            <p className="font-bold text-foreground text-sm truncate max-w-[150px]">{site.name}</p>
                                            <p className="text-[10px] font-mono text-muted-foreground uppercase">{site.code} • {site.assets_count} Assets</p>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-muted/40 p-2 rounded-lg">
                                            <WeatherIcon condition={site.weather.condition} />
                                            <div className="text-right">
                                                <p className="text-sm font-bold">{site.weather.temp}</p>
                                                <p className="text-[9px] text-muted-foreground">{site.weather.condition}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-8 text-center text-muted-foreground text-xs">
                                    No registered sites found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities Section (All Users + DateTime + Location) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>System Activity Logs</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Full operational log showing activities across all sites.</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Action</th>
                                    <th className="pb-3">Location / Site</th>
                                    <th className="pb-3 pr-2 text-right">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-sm">
                                {recentActivities.map((activity: any) => (
                                    <tr key={activity.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                                                    {activity.user.substring(0, 2)}
                                                </div>
                                                <span className="font-medium">{activity.user}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-foreground">{activity.action}</td>
                                        <td className="py-3">
                                            <span className="inline-flex items-center text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                                {activity.location}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-2 text-right font-mono text-xs text-muted-foreground flex items-center justify-end">
                                            <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                            {activity.date_time}
                                        </td>
                                    </tr>
                                ))}
                                {recentActivities.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                                            No system logs recorded.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="ghost" className="text-xs" asChild>
                            <Link href="/security/logs">View All Audit Logs</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
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
