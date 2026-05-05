import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Wrench, AlertTriangle, Activity, DollarSign, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';

export default function Dashboard({ 
    totalAssets = 0, 
    availableAssets = 0, 
    inUseAssets = 0, 
    underMaintenance = 0, 
    faultyAssets = 0,
    categoryData = [],
    siteData = [],
    recentActivities = []
}: any) {
    
    const statusData = [
        { name: 'Available', value: availableAssets, color: '#10b981' },
        { name: 'In Use', value: inUseAssets, color: '#3b82f6' },
        { name: 'Maintenance', value: underMaintenance, color: '#f59e0b' },
        { name: 'Faulty', value: faultyAssets, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Mock data for visualizations that aren't dynamic yet
    const utilizationData = [
        { name: 'Jan', rate: 65 },
        { name: 'Feb', rate: 68 },
        { name: 'Mar', rate: 74 },
        { name: 'Apr', rate: 82 },
        { name: 'May', rate: 80 },
        { name: 'Jun', rate: 85 },
    ];

    const maintenanceCosts = [
        { month: 'Jan', cost: 1200 },
        { month: 'Feb', cost: 1900 },
        { month: 'Mar', cost: 1500 },
        { month: 'Apr', cost: 2200 },
        { month: 'May', cost: 1100 },
        { month: 'Jun', cost: 3500 },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="System Dashboard" />
            
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <Activity className="h-8 w-8 mr-3 text-primary" />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Overview
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline">Download Report</Button>
                    <Button>Refresh Data</Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-slate-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                                <p className="text-3xl font-bold">{totalAssets}</p>
                            </div>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <Package className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                                <p className="text-3xl font-bold text-emerald-600">{availableAssets + inUseAssets}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Active In-Use</p>
                                <p className="text-3xl font-bold text-blue-600">{inUseAssets}</p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Service Required</p>
                                <p className="text-3xl font-bold text-amber-600">{underMaintenance}</p>
                            </div>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Critical Faults</p>
                                <p className="text-3xl font-bold text-red-600">{faultyAssets}</p>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Asset Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex justify-center items-center">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-muted-foreground">No data available.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Inventory by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activities & Site Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary" />
                            Recent Asset Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity: any) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            activity.status === 'available' ? 'bg-emerald-500' :
                                            activity.status === 'faulty' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                        <div>
                                            <p className="text-sm font-medium">{activity.product_name}</p>
                                            <p className="text-xs text-muted-foreground">{activity.asset_id} • {activity.site}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                            activity.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            activity.status === 'faulty' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                            {activity.status}
                                        </span>
                                        <p className="text-[10px] text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs" asChild>
                            <Link href="/asset-inventory">View All Assets</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Site Resource Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={siteData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Intelligence Dashboard',
            href: '#',
        },
    ],
};
