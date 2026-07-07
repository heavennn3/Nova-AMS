import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MapPin,
    Package,
    Activity,
    Search,
    ShieldAlert,
    Users,
    Percent,
    Wrench,
    Navigation,
    ArrowRight,
    Filter,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    AreaChart,
    Area,
} from 'recharts';

export default function Dashboards({ sites = [] }: { sites: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('ALL');

    // 1. Enrich sites with operational health and status indicators from real backend data
    const enrichedSites = useMemo(() => {
        return sites.map((site) => {
            const healthScore = site.healthScore ?? 100;
            const activeWorkOrders = site.activeWorkOrders ?? 0;

            let status: 'optimal' | 'warning' | 'critical' = 'optimal';
            if (healthScore < 90 || activeWorkOrders >= 3) {
                status = 'critical';
            } else if (healthScore < 94 || activeWorkOrders >= 1) {
                status = 'warning';
            }

            return {
                ...site,
                status,
            };
        });
    }, [sites]);

    // 2. Extract unique regions for the filtering system
    const uniqueRegions = useMemo(() => {
        const regions = sites.map((s) => s.region).filter(Boolean);
        return Array.from(new Set(regions));
    }, [sites]);

    // 3. Filter site records dynamically based on active filters
    const filteredSites = useMemo(() => {
        return enrichedSites.filter((site) => {
            const matchesSearch =
                (site.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (site.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (site.region || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRegion =
                selectedRegion === 'ALL' || site.region === selectedRegion;

            return matchesSearch && matchesRegion;
        });
    }, [enrichedSites, searchQuery, selectedRegion]);

    // 4. Calculate high-level global metrics for summaries
    const totalSites = sites.length;
    const totalAssets = sites.reduce(
        (acc, site) => acc + (site.assets_count || 0),
        0
    );

    const avgSla = useMemo(() => {
        if (enrichedSites.length === 0) return 100.0;
        const sum = enrichedSites.reduce((acc, site) => acc + site.slaCompliance, 0);
        return parseFloat((sum / enrichedSites.length).toFixed(2));
    }, [enrichedSites]);

    const totalWorkOrders = useMemo(() => {
        return enrichedSites.reduce((acc, site) => acc + site.activeWorkOrders, 0);
    }, [enrichedSites]);

    // 5. Transform filtered records to charts metrics
    const chartData = useMemo(() => {
        return filteredSites.map((site) => ({
            name: site.name,
            code: site.code || `S-${site.id}`,
            assets: site.assets_count || 0,
            sla: site.slaCompliance,
            health: site.healthScore,
            techs: site.activeTechs,
        }));
    }, [filteredSites]);

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Multi-Site Dashboards" />

            {/* Header Block */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Multi-Site Dashboard
                    </h1>
                </div>

            </div>

            {/* Global KPI Summary Grid - Simple Box Style */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-blue-900">Total Sites</h3>
                            <p className="text-2xl font-bold text-blue-600">{totalSites}</p>
                            <p className="text-xs text-blue-700 mt-1">Monitored locations</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-2.5">
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-green-900">Tracked Assets</h3>
                            <p className="text-2xl font-bold text-green-600">{totalAssets}</p>
                            <p className="text-xs text-green-700 mt-1">Registered inventory</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-2.5">
                            <Package className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-purple-900">Avg SLA Compliance</h3>
                            <p className="text-2xl font-bold text-purple-600">{avgSla}%</p>
                            <p className="text-xs text-purple-700 mt-1">Fleet SLA score</p>
                        </div>
                        <div className="rounded-full bg-purple-100 p-2.5">
                            <Percent className="h-5 w-5 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-amber-900">Active Work Orders</h3>
                            <p className="text-2xl font-bold text-amber-600">{totalWorkOrders}</p>
                            <p className="text-xs text-amber-700 mt-1">Assigned work orders</p>
                        </div>
                        <div className="rounded-full bg-amber-100 p-2.5">
                            <Wrench className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Toolbar Area */}
            <Card className="bg-card/40 backdrop-blur-sm border-border/80">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Field */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Query by site name, operational code, or regional zone..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Regional Dropdown & Quick Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 border border-border rounded-lg bg-background px-3 h-10">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <select
                                className="bg-transparent text-xs font-semibold outline-none border-none cursor-pointer text-foreground py-1 pr-6"
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                            >
                                <option value="ALL">All Operational Regions</option>
                                {uniqueRegions.map((region) => (
                                    <option key={region} value={region}>
                                        Region: {region}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {searchQuery || selectedRegion !== 'ALL' ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 text-xs font-semibold text-zinc-500 hover:text-foreground"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedRegion('ALL');
                                }}
                            >
                                Reset Filter
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {/* Fleet Analytics Section */}
            {chartData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Asset Density Density BarChart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Asset Load Distribution</CardTitle>
                            <CardDescription>
                                Total assets tracked at each location.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))',
                                        }}
                                        itemStyle={{ fontSize: 11, color: 'hsl(var(--primary))' }}
                                    />
                                    <Bar dataKey="assets" name="Assets Tracked" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Operational SLA Compliance Rate AreaChart */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-bold">Uptime & SLA Compliance</CardTitle>
                            <CardDescription>
                                SLA compliance and health index correlation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorSlaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHealthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <RechartsTooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--background))',
                                        }}
                                        itemStyle={{ fontSize: 11 }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="sla" name="SLA Compliance %" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSlaGrad)" />
                                    <Area type="monotone" dataKey="health" name="Asset Health Score %" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHealthGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            ) : null}

            {/* Individual Site Diagnostics Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredSites.map((site) => (
                    <Card
                        key={site.id}
                        className="transition-all duration-300 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 bg-card/65 backdrop-blur-sm border-border/80"
                    >
                        <CardHeader className="pb-3 border-b border-border/60">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        {site.name}
                                        <span className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
                                            {site.code || 'NO-CODE'}
                                        </span>
                                    </CardTitle>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                        <span>{site.region || 'Unassigned Region'}</span>
                                    </div>
                                </div>

                                {/* Dynamic Status Tag */}
                                {site.status === 'optimal' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <Activity className="h-3 w-3" />
                                        Optimal
                                    </span>
                                ) : site.status === 'warning' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        <ShieldAlert className="h-3 w-3" />
                                        Warning
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive dark:text-red-400">
                                        <ShieldAlert className="h-3 w-3" />
                                        Critical
                                    </span>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-6">
                            {/* Site KPI stats layout */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 bg-muted/30 p-2.5 rounded border border-border/40">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                        Registered Assets
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-extrabold text-foreground">{site.assets_count || 0}</span>
                                        <span className="text-[10px] text-muted-foreground">units</span>
                                    </div>
                                </div>

                                <div className="space-y-1 bg-muted/30 p-2.5 rounded border border-border/40">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                        SLA Compliance
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-extrabold text-foreground">{site.slaCompliance}%</span>
                                        <span className="text-[10px] text-muted-foreground">uptime</span>
                                    </div>
                                </div>

                                <div className="space-y-1 bg-muted/30 p-2.5 rounded border border-border/40">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                        Active Work Orders
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{site.activeWorkOrders}</span>
                                        <span className="text-[10px] text-muted-foreground">issues</span>
                                    </div>
                                </div>

                                <div className="space-y-1 bg-muted/30 p-2.5 rounded border border-border/40">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                                        Active Technicians
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-extrabold text-foreground">{site.activeTechs}</span>
                                        <span className="text-[10px] text-muted-foreground">deployed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Uptime & Response details */}
                            <div className="flex justify-between items-center text-xs py-1 border-y border-border/40 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Navigation className="h-3 w-3" />
                                    Coords: {parseFloat(site.latitude || '0').toFixed(4)}, {parseFloat(site.longitude || '0').toFixed(4)}
                                </span>
                                <span>Response Speed: <strong className="text-foreground">{site.responseTime}m</strong> avg</span>
                            </div>

                            {/* Health score index tracking bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-muted-foreground">Asset Health Index</span>
                                    <span className="font-bold text-foreground">{site.healthScore}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800 border border-border/40">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${site.healthScore >= 95
                                            ? 'bg-emerald-500'
                                            : site.healthScore >= 91
                                                ? 'bg-amber-500'
                                                : 'bg-red-500'
                                            }`}
                                        style={{ width: `${site.healthScore}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold flex-1" asChild>
                                    <Link href="/asset-inventory">
                                        <Package className="mr-1.5 h-3 w-3" /> Log Registry
                                    </Link>
                                </Button>
                                <Button size="sm" className="h-8 text-[11px] font-bold flex-1" asChild>
                                    <Link href="/maintenance/work-orders">
                                        <Wrench className="mr-1.5 h-3 w-3" /> Dispatch Order
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredSites.length === 0 && (
                <Card className="p-12 text-center border-dashed border-2">
                    <CardContent className="space-y-3">
                        <div className="mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 p-3 w-fit">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">No Operational Sites Match Filters</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            Try resetting your search query or choosing another region category in the filter dropdown.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs font-semibold"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedRegion('ALL');
                            }}
                        >
                            Reset Active Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Dashboards.layout = {
    breadcrumbs: [
        {
            title: 'Multi-Site Dashboards',
            href: '#',
        },
    ],
};
