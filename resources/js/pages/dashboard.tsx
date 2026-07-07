import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
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
        pendingRequests: 0,
    },
    charts = { assetsByStatus: [], assetsBySite: [], monthlyAssets: [] },
    recentActivities = [],
    overdueCheckouts = [],
    warrantyExpiring = [],
}: any) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth.user?.roles?.includes('Admin');

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
                    <div className="text-sm text-muted-foreground/70 tabular-nums">
                        {currentDateTime.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })} · {currentDateTime.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })}
                    </div>
                    <div className="flex space-x-3">

                    </div>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Link href="/assets" className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalAssets}</p>
                    </div>
                </Link>

                <Link href="/sites" className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-emerald-500/10 p-3">
                        <Activity className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sites</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.totalSites}</p>
                    </div>
                </Link>

                <Link href="/users" className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-indigo-500/10 p-3">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.totalUsers}</p>
                    </div>
                </Link>

                <Link href="/assets" className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-cyan-500/10 p-3">
                        <Plus className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Recently Added</p>
                        <p className="text-2xl font-bold text-cyan-600">{stats.totalRecentAdded}</p>
                    </div>
                </Link>

                <Link href="/support/tickets" className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="rounded-full bg-rose-500/10 p-3">
                        <Headset className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Open Tickets</p>
                        <p className="text-2xl font-bold text-rose-600">{stats.openTickets}</p>
                    </div>
                </Link>
            </div>

            {/* Row 2: Urgent Alerts & Overdues */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Low Stock Alerts */}
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-red-500/10 p-2.5">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Low Spareparts Alert</h3>

                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                            {stats.lowSpareParts?.length ?? 0} Low
                        </span>
                    </div>
                    <div className="divide-y divide-border/60 px-5 py-2">
                        {stats.lowSpareParts && stats.lowSpareParts.length > 0 ? (
                            stats.lowSpareParts.map((part: any) => (
                                <div key={part.id} className="py-3 flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-foreground">{part.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded border mr-2">{part.part_number}</span>
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
                </div>

                {/* Overdue Checkouts Section */}
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-orange-500/10 p-2.5">
                                <CalendarClock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Overdue Checkouts</h3>

                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-400">
                            {overdueCheckouts.length} Overdue
                        </span>
                    </div>
                    <div className="px-5 py-2">
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
                                                    <span className="font-semibold text-foreground">
                                                        {item.asset_name}
                                                    </span>
                                                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{item.asset_id}</p>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                                                            {item.user_name?.substring(0, 2)}
                                                        </div>
                                                        <span className="font-medium text-foreground">{item.user_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-mono text-xs text-muted-foreground">
                                                    {item.checkout_date}
                                                </td>
                                                <td className="py-3 pr-2 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${item.days_late > 14
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
                    </div>
                </div>
            </div>

            {/* Row 3: Status & Information */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Warranty Expiring Soon Section */}
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-purple-500/10 p-2.5">
                                <ShieldAlert className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">License Expiring Soon</h3>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                            {warrantyExpiring.length} Expiring
                        </span>
                    </div>
                    <div className="px-5 py-2">
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
                                                        className="font-semibold text-primary hover:underline transition-colors cursor-pointer"
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
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${item.days_remaining <= 7
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
                                No software license expiring soon.
                            </div>
                        )}
                        {warrantyExpiring.length > 0 && (
                            <div className="mt-4 flex justify-center pb-2">
                                <Button variant="ghost" className="text-xs" asChild>
                                    <Link href="/assets">View All Assets</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activities Section */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b px-5 py-4 gap-4 sm:gap-0">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Recent Activities</h3>

                    </div>

                </div>
                <div className="overflow-x-auto px-5 py-2">
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
                                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
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
                    <div className="flex justify-end border-t px-5 py-3">
                        <Button variant="ghost" className="text-xs" asChild>
                            <Link href="/security/logs">Show More Audit Logs</Link>
                        </Button>
                    </div>
                )}
                {filteredActivities.length > 0 && filteredActivities.length <= 5 && (
                    <div className="flex justify-center border-t px-5 py-3">
                        <Button variant="ghost" className="text-xs" asChild>
                            <Link href="/security/logs">View All Audit Logs</Link>
                        </Button>
                    </div>
                )}
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
