import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Calendar, FileText, Package, Users, Briefcase, FileWarning, ShieldCheck, ShoppingCart, Globe } from 'lucide-react';

export default function OperationsMaintenance() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <Head title="Operations & Maintenance" />

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                    <Wrench className="h-8 w-8 mr-3 text-primary" />
                    Operations & Maintenance Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Central hub for managing maintenance activities, vendor SLAs, and facility operations.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Wrench className="h-5 w-5 mr-2 text-primary" />
                            Comprehensive Maintenance
                        </CardTitle>
                        <CardDescription>Manage daily schedules, work orders, and technician deployments.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/maintenance/scheduling" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Calendar className="h-8 w-8 mr-3 text-blue-500 bg-blue-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Preventive Scheduling</h3>
                                <p className="text-xs text-muted-foreground">Plan routine checks</p>
                            </div>
                        </Link>
                        <Link href="/maintenance/work-orders" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <FileText className="h-8 w-8 mr-3 text-orange-500 bg-orange-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Work Orders</h3>
                                <p className="text-xs text-muted-foreground">Active repairs & tasks</p>
                            </div>
                        </Link>
                        <Link href="/maintenance/history" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Globe className="h-8 w-8 mr-3 text-purple-500 bg-purple-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Maintenance History</h3>
                                <p className="text-xs text-muted-foreground">Review past work</p>
                            </div>
                        </Link>
                        <Link href="/maintenance/parts" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Package className="h-8 w-8 mr-3 text-indigo-500 bg-indigo-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Spare Parts</h3>
                                <p className="text-xs text-muted-foreground">Inventory management</p>
                            </div>
                        </Link>
                        <Link href="/maintenance/technicians" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors sm:col-span-2">
                            <Users className="h-8 w-8 mr-3 text-teal-500 bg-teal-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Technician Assignment</h3>
                                <p className="text-xs text-muted-foreground">Manage personnel and workload</p>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Briefcase className="h-5 w-5 mr-2 text-amber-500" />
                            Vendor & Contract Management
                        </CardTitle>
                        <CardDescription>Monitor SLAs, track performance, and handle procurements.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/vendors/performance" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Briefcase className="h-8 w-8 mr-3 text-emerald-500 bg-emerald-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Performance Tracking</h3>
                                <p className="text-xs text-muted-foreground">Vendor KPIs & reviews</p>
                            </div>
                        </Link>
                        <Link href="/vendors/alerts" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <FileWarning className="h-8 w-8 mr-3 text-red-500 bg-red-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Expiration Alerts</h3>
                                <p className="text-xs text-muted-foreground">Upcoming renewals</p>
                            </div>
                        </Link>
                        <Link href="/vendors/slas" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <ShieldCheck className="h-8 w-8 mr-3 text-sky-500 bg-sky-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">SLAs</h3>
                                <p className="text-xs text-muted-foreground">Service level agreements</p>
                            </div>
                        </Link>
                        <Link href="/vendors/po" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <ShoppingCart className="h-8 w-8 mr-3 text-pink-500 bg-pink-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Purchase Orders</h3>
                                <p className="text-xs text-muted-foreground">Procurement tracking</p>
                            </div>
                        </Link>
                        <Link href="/vendors/portal" className="flex items-center p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors sm:col-span-2">
                            <Globe className="h-8 w-8 mr-3 text-slate-500 bg-slate-100 p-1.5 rounded-md" />
                            <div>
                                <h3 className="font-semibold text-sm">Vendor Portal</h3>
                                <p className="text-xs text-muted-foreground">External access & communication</p>
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
