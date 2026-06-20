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
    CalendarClock,
    ShieldAlert,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    overdueCheckouts = [],
    warrantyExpiring = [],
}: any) {
    const [telemetry, setTelemetry] = useState({
        cpu: '0.0',
        ram: '0.0',
        disk: 0,
    });

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
    const [selectedActionFilter, setSelectedActionFilter] = useState('all');

    const filteredActivities = recentActivities.filter((activity: any) => {
        const matchesSite = selectedSiteFilter === 'all' || activity.site_id?.toString() === selectedSiteFilter;

        let matchesAction = true;
        if (selectedActionFilter !== 'all') {
            if (selectedActionFilter === 'create') {
                matchesAction = activity.action === 'created';
            } else if (selectedActionFilter === 'update') {
                matchesAction = activity.action === 'updated';
            } else if (selectedActionFilter === 'delete') {
                matchesAction = activity.action === 'deleted' || activity.action === 'restored';
            }
        }

        return matchesSite && matchesAction;
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

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
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
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {currentDateTime.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {currentDateTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                        </div>
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


                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>System Monitoring</CardTitle>
                        </div>
                        <span className="relative flex h-2 w-2">

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
                        <CardTitle>Weather</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Current site weather conditions</p>
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

            {/* Overdue Checkouts & Warranty Expiring Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Overdue Checkouts Section */}
                <Card className="border border-orange-200 dark:border-orange-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center">
                                <CalendarClock className="mr-2 h-5 w-5" /> Overdue Checkouts
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Assets checked out past their expected return date.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            {overdueCheckouts.length} Overdue
                        </span>
                    </CardHeader>
                    <CardContent>
                        {overdueCheckouts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <th className="pb-3 pl-2">Asset</th>
                                            <th className="pb-3">Person</th>
                                            <th className="pb-3">Checkout Date</th>
                                            <th className="pb-3 pr-2 text-right">Days Late</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 text-sm">
                                        {overdueCheckouts.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 pl-2">
                                                    <Link
                                                        href={`/withdrawals/${item.id}`}
                                                        className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                                                    >
                                                        {item.asset_name}
                                                    </Link>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.asset_id}</p>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                                                            {item.user_name.substring(0, 2)}
                                                        </div>
                                                        <span className="font-medium text-foreground">{item.user_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-mono text-xs text-muted-foreground">
                                                    {item.checkout_date}
                                                </td>
                                                <td className="py-3 pr-2 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                                        item.days_late > 14
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                                            : item.days_late > 7
                                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                                    }`}>
                                                        {item.days_late}d late
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-xs">
                                No overdue checkouts. All assets returned on time.
                            </div>
                        )}
                        {overdueCheckouts.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="ghost" className="text-xs" asChild>
                                    <Link href="/withdrawals">View All Withdrawals</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Warranty Expiring Soon Section */}
                <Card className="border border-purple-200 dark:border-purple-900/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-purple-600 dark:text-purple-400 flex items-center">
                                <ShieldAlert className="mr-2 h-5 w-5" /> Warranty Expiring Soon
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Assets with warranty expiring within the next 90 days.</p>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            {warrantyExpiring.length} Expiring
                        </span>
                    </CardHeader>
                    <CardContent>
                        {warrantyExpiring.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <th className="pb-3 pl-2">Asset</th>
                                            <th className="pb-3">Category</th>
                                            <th className="pb-3">Expiry Date</th>
                                            <th className="pb-3 pr-2 text-right">Remaining</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 text-sm">
                                        {warrantyExpiring.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="py-3 pl-2">
                                                    <Link
                                                        href={`/assets/${item.id}`}
                                                        className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
                                                    >
                                                        {item.asset_name}
                                                    </Link>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.asset_id}</p>
                                                </td>
                                                <td className="py-3">
                                                    <span className="inline-flex items-center text-xs text-muted-foreground">
                                                        {item.category}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                                        <MapPin className="inline h-3 w-3 mr-0.5" />{item.site}
                                                    </p>
                                                </td>
                                                <td className="py-3 font-mono text-xs text-muted-foreground">
                                                    {item.expiry_date}
                                                </td>
                                                <td className="py-3 pr-2 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                                        item.days_remaining <= 7
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                                            : item.days_remaining <= 30
                                                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                    }`}>
                                                        {item.days_remaining}d left
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground text-xs">
                                No warranties expiring in the next 90 days.
                            </div>
                        )}
                        {warrantyExpiring.length > 0 && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="ghost" className="text-xs" asChild>
                                    <Link href="/assets">View All Assets</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities Section (All Users + DateTime + Location) */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pb-4 border-b">
                    <div>
                        <CardTitle>Recent Activities</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">NOVA AMS System Activities</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Site Filter Select */}
                        <div className="w-[180px]">
                            <Select
                                value={selectedSiteFilter}
                                onValueChange={setSelectedSiteFilter}
                            >
                                <SelectTrigger className="h-8 text-xs bg-muted/40">
                                    <SelectValue placeholder="All Sites" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sites</SelectItem>
                                    {stats.sitesWithStats?.map((site: any) => (
                                        <SelectItem key={site.id} value={site.id.toString()}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* CRUD Filter Tabs */}
                        <div className="flex bg-muted p-1 rounded-lg border">
                            {(['all', 'create', 'update', 'delete'] as const).map((action) => (
                                <button
                                    key={action}
                                    onClick={() => setSelectedActionFilter(action)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md uppercase transition-all ${selectedActionFilter === action
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {action === 'all' ? 'All' : action + 's'}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
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
                                {filteredActivities.slice(0, 5).map((activity: any) => (
                                    <tr key={activity.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="py-3 pl-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                                                    {activity.user.substring(0, 2)}
                                                </div>
                                                <span className="font-medium">{activity.user}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-foreground">{activity.details}</td>
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
                                {filteredActivities.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                                            No system logs match the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredActivities.length > 5 && (
                        <div className="mt-4 flex justify-end">
                            <Button variant="ghost" className="text-xs" asChild>
                                <Link href="/security/logs">Show More Audit Logs</Link>
                            </Button>
                        </div>
                    )}
                    {filteredActivities.length > 0 && filteredActivities.length <= 5 && (
                        <div className="mt-4 flex justify-center">
                            <Button variant="ghost" className="text-xs" asChild>
                                <Link href="/security/logs">View All Audit Logs</Link>
                            </Button>
                        </div>
                    )}
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
