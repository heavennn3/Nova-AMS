import { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Wrench,
    Package,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    MapPin,
    User,
    Calendar,
    Activity,
    Settings,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface WorkOrder {
    id: number;
    title: string;
    status: string;
    priority: string;
    assigned_to: string;
    due_date: string;
    asset?: {
        name: string;
        asset_id: string;
    };
}

interface SparePartAlert {
    id: number;
    name: string;
    part_number: string;
    stock_level: number;
    minimum_stock_level: number;
    location: string;
    site: string;
}

interface SiteStat {
    id: number;
    name: string;
    code: string;
    assets_count: number;
    pending_maintenance: number;
    operational_rate: number;
}

export default function TechnicianDashboard({
    myWorkOrders = [],
    lowStockParts = [],
    siteStats = [],
    recentActivities = [],
    pendingApprovals = 0,
}: {
    myWorkOrders: WorkOrder[];
    lowStockParts: SparePartAlert[];
    siteStats: SiteStat[];
    recentActivities: any[];
    pendingApprovals: number;
}) {
    const { auth } = usePage<any>().props;
    const user = auth.user;

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredWorkOrders = myWorkOrders.filter((wo: WorkOrder) => {
        if (selectedStatus === 'all') return true;
        return wo.status === selectedStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'in progress':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Calculate summary stats
    const totalTasks = myWorkOrders.length;
    const completedTasks = myWorkOrders.filter(wo => wo.status === 'completed').length;
    const pendingTasks = myWorkOrders.filter(wo => wo.status === 'pending').length;
    const inProgressTasks = myWorkOrders.filter(wo => wo.status === 'in progress').length;
    const criticalParts = lowStockParts.filter(part => part.stock_level === 0).length;
    const lowParts = lowStockParts.filter(part => part.stock_level > 0 && part.stock_level <= part.minimum_stock_level).length;

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Technician O&M Dashboard" />

            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Settings className="mr-3 h-8 w-8 text-primary" />
                        O&M Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name || 'Technician'} • Your Operations & Maintenance Command Center
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-xs font-semibold text-primary">
                            {currentDateTime.toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="text-lg font-bold text-primary tabular-nums">
                            {currentDateTime.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            })}
                        </div>
                    </div>
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="border-l-4 border-l-blue-500 bg-card/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                                <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
                                <p className="text-xs text-muted-foreground">Assigned to you</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 bg-card/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-amber-600">{pendingTasks}</p>
                                <p className="text-xs text-muted-foreground">Awaiting action</p>
                            </div>
                            <div className="rounded-full bg-amber-100 p-2">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 bg-card/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-3xl font-bold text-purple-600">{inProgressTasks}</p>
                                <p className="text-xs text-muted-foreground">Currently working</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-2">
                                <Wrench className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 bg-card/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                                <p className="text-xs text-muted-foreground">Tasks finished</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 bg-card/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                                <p className="text-3xl font-bold text-red-600">{criticalParts + lowParts}</p>
                                <p className="text-xs text-muted-foreground">{criticalParts} critical, {lowParts} low</p>
                            </div>
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* My Work Orders */}
                <Card className="border-t-4 border-t-blue-500 bg-card/45 shadow-sm backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="flex items-center">
                                <Wrench className="mr-2 h-5 w-5 text-blue-500" />
                                My Work Orders
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Active maintenance tasks</p>
                        </div>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/40">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {filteredWorkOrders.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                No work orders found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredWorkOrders.slice(0, 6).map((wo) => (
                                    <div key={wo.id} className="p-4 border border-border/60 rounded-lg hover:bg-muted/10 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={`text-xs ${getPriorityColor(wo.priority)} text-white border-0`}>
                                                        {wo.priority.toUpperCase()}
                                                    </Badge>
                                                    <Badge className={`text-xs ${getStatusColor(wo.status)}`}>
                                                        {wo.status}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold text-sm">{wo.title}</h4>
                                                {wo.asset && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Asset: {wo.asset.name} ({wo.asset.asset_id})
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        Due: {wo.due_date}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <User className="h-3 w-3 mr-1" />
                                                        {wo.assigned_to}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`/maintenance/work-orders/${wo.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {filteredWorkOrders.length > 6 && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/maintenance/work-orders">
                                        View All Work Orders
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Spare Parts Alerts */}
                <Card className="border-t-4 border-t-red-500 bg-card/45 shadow-sm backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                                Spare Parts Alerts
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Low stock & critical items</p>
                        </div>
                        <Link href="/spare-parts/dashboard">
                            <Button variant="outline" size="sm">
                                Manage Parts
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {lowStockParts.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                All spare parts are at adequate stock levels
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lowStockParts.slice(0, 6).map((part) => (
                                    <div key={part.id} className="flex items-center justify-between p-3 border border-border/60 rounded-lg hover:bg-muted/10 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {part.stock_level === 0 ? (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                                        OUT OF STOCK
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                                        LOW STOCK
                                                    </Badge>
                                                )}
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {part.part_number}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-sm">{part.name}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {part.site} • {part.location}
                                            </p>
                                        </div>
                                        <div className="text-right ml-3">
                                            <p className="text-sm font-bold text-red-600">
                                                {part.stock_level} / {part.minimum_stock_level}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Stock Level</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {lowStockParts.length > 6 && (
                            <div className="mt-4 flex justify-center">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/spare-parts/dashboard">
                                        View All Alerts
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Site Stats & Recent Activities */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Site Statistics */}
                <Card className="border-t-4 border-t-emerald-500 bg-card/45 shadow-sm backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5 text-emerald-500" />
                            Site Statistics
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Your assigned sites overview</p>
                    </CardHeader>
                    <CardContent>
                        {siteStats.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                No sites assigned
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {siteStats.map((site) => (
                                    <div key={site.id} className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-muted/10 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{site.name}</h4>
                                            <p className="text-xs text-muted-foreground font-mono mt-1">
                                                {site.code}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs">
                                                <span className="flex items-center text-muted-foreground">
                                                    <Package className="h-3 w-3 mr-1" />
                                                    {site.assets_count} Assets
                                                </span>
                                                <span className="flex items-center text-muted-foreground">
                                                    <Wrench className="h-3 w-3 mr-1" />
                                                    {site.pending_maintenance} Pending
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-3">
                                            <div className="flex items-center justify-end">
                                                <span className={`text-sm font-bold ${
                                                    site.operational_rate >= 90 ? 'text-green-600' :
                                                    site.operational_rate >= 70 ? 'text-amber-600' :
                                                    'text-red-600'
                                                }`}>
                                                    {site.operational_rate}%
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    Op Rate
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        site.operational_rate >= 90 ? 'bg-green-500' :
                                                        site.operational_rate >= 70 ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${site.operational_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="border-t-4 border-t-purple-500 bg-card/45 shadow-sm backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-purple-500" />
                                Recent Activities
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">Your recent system actions</p>
                        </div>
                        <Link href="/security/logs">
                            <Button variant="ghost" size="sm">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentActivities.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                No recent activities
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.slice(0, 6).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 border border-border/60 rounded-lg hover:bg-muted/10 transition-colors">
                                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <Activity className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.details || activity.action}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{activity.user || 'Unknown user'}</span>
                                                <span>•</span>
                                                <span>{activity.date_time || activity.created_at}</span>
                                            </div>
                                            {activity.location && (
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {activity.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions Footer */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-900/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm">Quick Actions</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Common tasks for technicians
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/maintenance/work-orders/create">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    New Work Order
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/spare-parts/dashboard">
                                    <Package className="mr-2 h-4 w-4" />
                                    Request Parts
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/assets">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Update Asset Status
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

TechnicianDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Technician Dashboard',
            href: '#',
        },
    ],
};