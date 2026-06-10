import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Wrench,
    Calendar,
    FileText,
    Package,
    Users,
    Briefcase,
    FileWarning,
    ShieldCheck,
    ShoppingCart,
    Globe,
} from 'lucide-react';

export default function OperationsMaintenance() {
    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Operations & Maintenance" />

            <div>
                <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                    <Wrench className="mr-3 h-8 w-8 text-primary" />
                    Operations & Maintenance Dashboard
                </h1>
             
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Wrench className="mr-2 h-5 w-5 text-primary" />
                            Comprehensive Maintenance
                        </CardTitle>
                        <CardDescription>
                            Manage daily schedules, work orders, and technician
                            deployments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Link
                            href="/maintenance/scheduling"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <Calendar className="mr-3 h-8 w-8 rounded-md bg-blue-100 p-1.5 text-blue-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Preventive Scheduling
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Plan routine checks
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/maintenance/work-orders"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <FileText className="mr-3 h-8 w-8 rounded-md bg-orange-100 p-1.5 text-orange-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Work Orders
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Active repairs & tasks
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/maintenance/history"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <Globe className="mr-3 h-8 w-8 rounded-md bg-purple-100 p-1.5 text-purple-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Maintenance History
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Review past work
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/maintenance/parts"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <Package className="mr-3 h-8 w-8 rounded-md bg-indigo-100 p-1.5 text-indigo-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Spare Parts
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Inventory management
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/maintenance/technicians"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 sm:col-span-2"
                        >
                            <Users className="mr-3 h-8 w-8 rounded-md bg-teal-100 p-1.5 text-teal-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Technician Assignment
                                </h3>
                               
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Briefcase className="mr-2 h-5 w-5 text-amber-500" />
                            Vendor & Contract Management
                        </CardTitle>
                        <CardDescription>
                            Monitor SLAs, track performance, and handle
                            procurements.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Link
                            href="/vendors/performance"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <Briefcase className="mr-3 h-8 w-8 rounded-md bg-emerald-100 p-1.5 text-emerald-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Performance Tracking
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Vendor KPIs & reviews
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/vendors/alerts"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <FileWarning className="mr-3 h-8 w-8 rounded-md bg-red-100 p-1.5 text-red-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Expiration Alerts
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Upcoming renewals
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/vendors/slas"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <ShieldCheck className="mr-3 h-8 w-8 rounded-md bg-sky-100 p-1.5 text-sky-500" />
                            <div>
                                <h3 className="text-sm font-semibold">SLAs</h3>
                                <p className="text-xs text-muted-foreground">
                                    Service level agreements
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/vendors/po"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                        >
                            <ShoppingCart className="mr-3 h-8 w-8 rounded-md bg-pink-100 p-1.5 text-pink-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Purchase Orders
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Procurement tracking
                                </p>
                            </div>
                        </Link>
                        <Link
                            href="/vendors/portal"
                            className="flex items-center rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 sm:col-span-2"
                        >
                            <Globe className="mr-3 h-8 w-8 rounded-md bg-slate-100 p-1.5 text-slate-500" />
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Vendor Portal
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    External access & communication
                                </p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

OperationsMaintenance.layout = {
    breadcrumbs: [
        {
            title: 'Operations & Maintenance',
            href: '#',
        },
    ],
};
