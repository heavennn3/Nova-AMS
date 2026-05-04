import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, Wrench, AlertTriangle, Activity, DollarSign, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';

export default function Dashboard({ 
    totalAssets = 0, 
    availableAssets = 0, 
    inUseAssets = 0, 
    underMaintenance = 0, 
    faultyAssets = 0 
}: any) {
    
    const statusData = [
        { name: 'Available', value: availableAssets, color: '#10b981' },
        { name: 'In Use', value: inUseAssets, color: '#3b82f6' },
        { name: 'Maintenance', value: underMaintenance, color: '#f59e0b' },
        { name: 'Faulty', value: faultyAssets, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Mock data for visualizations
    const utilizationData = [
        { name: 'Jan', rate: 65 },
        { name: 'Feb', rate: 68 },
        { name: 'Mar', rate: 74 },
        { name: 'Apr', rate: 82 },
        { name: 'May', rate: 80 },
        { name: 'Jun', rate: 85 },
    ];

    const categoryData = [
        { name: 'IT Equipment', count: 145 },
        { name: 'Furniture', count: 210 },
        { name: 'Vehicles', count: 25 },
        { name: 'Machinery', count: 48 },
        { name: 'Electronics', count: 92 },
    ];

    const maintenanceCosts = [
        { month: 'Jan', cost: 1200 },
        { month: 'Feb', cost: 1900 },
        { month: 'Mar', cost: 1500 },
        { month: 'Apr', cost: 2200 },
        { month: 'May', cost: 1100 },
        { month: 'Jun', cost: 3500 },
    ];

    const depreciationData = [
        { year: '2021', value: 150000 },
        { year: '2022', value: 135000 },
        { year: '2023', value: 118000 },
        { year: '2024', value: 95000 },
        { year: '2025', value: 80000 },
        { year: '2026', value: 68000 },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Dashboard" />
            
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Activity className="h-8 w-8 mr-3 text-primary" />
                    System Overview
                </h1>
                <p className="text-muted-foreground mt-2">
                    High-level metrics and real-time asset utilization.
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="border-l-4 border-l-slate-500">
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

                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Available</p>
                                <p className="text-3xl font-bold">{availableAssets}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">In Use</p>
                                <p className="text-3xl font-bold">{inUseAssets}</p>
                            </div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                                <p className="text-3xl font-bold">{underMaintenance}</p>
                            </div>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Faulty</p>
                                <p className="text-3xl font-bold">{faultyAssets}</p>
                            </div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Asset Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex justify-start items-center">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value) => [`${value} Assets`, 'Count']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-left text-muted-foreground">
                                <Package className="h-12 w-12 mb-2 opacity-20" />
                                <p>No asset data available to display.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Assets by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    formatter={(value) => [`${value} Units`, 'Quantity']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Utilization Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `${value}%`} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                    formatter={(value) => [`${value}%`, 'Utilization']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontSize: '12px' }}
                                />
                                <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Maintenance Costs</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={maintenanceCosts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `$${value}`} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <RechartsTooltip 
                                    formatter={(value) => [`$${value}`, 'Cost']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="cost" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCost)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Portfolio Value</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={depreciationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                                <RechartsTooltip 
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', fontSize: '12px' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
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
            title: 'Dashboard',
            href: '#',
        },
    ],
};
