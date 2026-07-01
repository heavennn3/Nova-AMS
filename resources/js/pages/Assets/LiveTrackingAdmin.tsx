import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Activity,
    Package,
    CheckCircle2,
    Clock,
    MapPin,
    User,
    Mail,
    AlertTriangle,
    Bell,
    Send,
    Filter,
    RefreshCw,
    Download,
    Building2,
    Calendar,
    Hash,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Assignment {
    id: number;
    asset_id: string;
    asset_db_id: number;
    product_name: string;
    category: string;
    site: string;
    site_id: number;
    location: string;
    user_name: string;
    user_email: string;
    assigned_at: string;
    expected_return_date: string;
    duration: string;
    is_overdue: boolean;
    days_overdue: number;
    remarks: string | null;
}

interface SiteAssignment {
    site: {
        id: number;
        name: string;
        code: string;
    };
    assignments: Assignment[];
    total_count: number;
    overdue_count: number;
}

export default function LiveTrackingAdmin({
    assignmentsBySite = [],
    stats = {
        total_assets: 0,
        in_use: 0,
        available: 0,
        returned_today: 0,
        total_history: 0,
    },
    sites = [],
    filters = {
        site_id: 'all',
        status: 'all',
    },
    is_admin = false,
}: {
    assignmentsBySite: SiteAssignment[];
    stats: {
        total_assets: number;
        in_use: number;
        available: number;
        returned_today: number;
        total_history: number;
    };
    sites: any[];
    filters: {
        site_id: string;
        status: string;
    };
    is_admin: boolean;
}) {
    const { auth } = usePage<any>().props;

    const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
    const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
    const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());
    const [localSiteFilter, setLocalSiteFilter] = useState(filters.site_id);

    const reminderForm = useForm({
        assignment_ids: [] as number[],
    });

    // Auto-expand all sites on load for admin
    useEffect(() => {
        if (is_admin && assignmentsBySite.length > 0) {
            const allSiteIds = new Set(assignmentsBySite.map(sa => sa.site.id));
            setExpandedSites(allSiteIds);
        }
    }, [assignmentsBySite, is_admin]);

    // Handle filter changes
    const handleFilterChange = (siteId: string) => {
        setLocalSiteFilter(siteId);
        const params = new URLSearchParams(window.location.search);
        if (siteId !== 'all') {
            params.set('site_id', siteId);
        } else {
            params.delete('site_id');
        }
        window.location.href = `${window.location.pathname}?${params.toString()}`;
    };

    // Toggle site expansion
    const toggleSite = (siteId: number) => {
        const newExpanded = new Set(expandedSites);
        if (newExpanded.has(siteId)) {
            newExpanded.delete(siteId);
        } else {
            newExpanded.add(siteId);
        }
        setExpandedSites(newExpanded);
    };

    // Toggle assignment selection
    const toggleAssignment = (assignmentId: number) => {
        const newSelected = selectedAssignments.includes(assignmentId)
            ? selectedAssignments.filter(id => id !== assignmentId)
            : [...selectedAssignments, assignmentId];
        setSelectedAssignments(newSelected);
    };

    // Toggle all assignments in a site
    const toggleSiteAssignments = (siteAssignments: Assignment[]) => {
        const siteIds = siteAssignments.map(a => a.id);
        const allSelected = siteIds.every(id => selectedAssignments.includes(id));

        if (allSelected) {
            setSelectedAssignments(selectedAssignments.filter(id => !siteIds.includes(id)));
        } else {
            setSelectedAssignments([...new Set([...selectedAssignments, ...siteIds])]);
        }
    };

    // Send single reminder
    const sendSingleReminder = (assignment: Assignment) => {
        if (!confirm(`Send reminder to ${assignment.user_name} about ${assignment.product_name}?`)) return;

        router.post(`/live-tracking/${assignment.id}/send-reminder`, {}, {
            onSuccess: () => {
                toast.success('Reminder sent successfully!');
            },
            onError: () => {
                toast.error('Failed to send reminder');
            },
        });
    };

    // Send bulk reminders
    const sendBulkReminders = () => {
        if (selectedAssignments.length === 0) {
            toast.error('Please select at least one assignment');
            return;
        }

        reminderForm.setData('assignment_ids', selectedAssignments);
        reminderForm.post('/live-tracking/bulk-reminders', {
            onSuccess: () => {
                setIsReminderDialogOpen(false);
                setSelectedAssignments([]);
                toast.success(`Sent ${selectedAssignments.length} reminders successfully!`);
            },
            onError: () => {
                toast.error('Failed to send some reminders');
            },
        });
    };

    // Check in asset
    const checkInAsset = (assignment: Assignment) => {
        if (!confirm(`Check in ${assignment.product_name} from ${assignment.user_name}?`)) return;

        router.patch(`/live-tracking/${assignment.id}/checkin`, {}, {
            onSuccess: () => {
                toast.success('Asset checked in successfully!');
                window.location.reload();
            },
            onError: () => {
                toast.error('Failed to check in asset');
            },
        });
    };

    // Calculate overdue stats
    const overdueAssignments = assignmentsBySite.flatMap(sa =>
        sa.assignments.filter(a => a.is_overdue)
    );
    const totalOverdue = overdueAssignments.length;

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Live Tracking - Admin Dashboard" />

            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Activity className="mr-3 h-8 w-8 text-primary" />
                        Asset Live Tracking
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time asset withdrawal tracking across all sites
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Link href="/withdrawals">
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            View All Withdrawals
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                                <p className="text-3xl font-bold">{stats.total_assets}</p>
                            </div>
                            <Package className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">In Use</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.in_use}</p>
                            </div>
                            <Activity className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Available</p>
                                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Returned Today</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.returned_today}</p>
                            </div>
                            <Calendar className="h-5 w-5 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${totalOverdue > 0 ? 'border-l-red-500' : 'border-l-gray-500'}`}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                                <p className={`text-3xl font-bold ${totalOverdue > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {totalOverdue}
                                </p>
                            </div>
                            <AlertTriangle className={`h-5 w-5 ${totalOverdue > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Bulk Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Filter by Site:</span>
                                <Select value={localSiteFilter} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Sites" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sites</SelectItem>
                                        {sites.map((site) => (
                                            <SelectItem key={site.id} value={site.id.toString()}>
                                                {site.name} ({site.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedAssignments.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {selectedAssignments.length} selected
                                </span>
                                <Button onClick={() => setIsReminderDialogOpen(true)} size="sm">
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Reminders
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Site-Grouped Assignments */}
            <div className="space-y-4">
                {assignmentsBySite.map((siteAssignment) => {
                    const isExpanded = expandedSites.has(siteAssignment.site.id);
                    const allSiteSelected = siteAssignment.assignments.length > 0 &&
                        siteAssignment.assignments.every(a => selectedAssignments.includes(a.id));

                    return (
                        <Card key={siteAssignment.site.id} className={siteAssignment.overdue_count > 0 ? 'border-red-200' : ''}>
                            <CardHeader
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleSite(siteAssignment.site.id)}
                            >
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        <span>{siteAssignment.site.name}</span>
                                        <Badge variant="secondary">{siteAssignment.site.code}</Badge>
                                        <Badge>{siteAssignment.total_count} Active</Badge>
                                        {siteAssignment.overdue_count > 0 && (
                                            <Badge className="bg-red-100 text-red-700 border-red-200">
                                                {siteAssignment.overdue_count} Overdue
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={allSiteSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleSiteAssignments(siteAssignment.assignments);
                                            }}
                                        />
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="p-6">
                                    {siteAssignment.assignments.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No active assignments for this site
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {siteAssignment.assignments.map((assignment) => {
                                                const isSelected = selectedAssignments.includes(assignment.id);
                                                const isOverdue = assignment.is_overdue;

                                                return (
                                                    <div
                                                        key={assignment.id}
                                                        className={`p-4 border rounded-lg hover:bg-muted/10 transition-colors ${
                                                            isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-4">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onChange={() => toggleAssignment(assignment.id)}
                                                                    className="mt-1"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-start gap-3">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="font-semibold text-sm">
                                                                                    {assignment.product_name}
                                                                                </span>
                                                                                {isOverdue && (
                                                                                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                                        {assignment.days_overdue}d Overdue
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground space-y-1">
                                                                                <div className="flex items-center gap-1">
                                                                                    <Hash className="h-3 w-3" />
                                                                                    {assignment.asset_id}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <User className="h-3 w-3" />
                                                                                    {assignment.user_name}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Mail className="h-3 w-3" />
                                                                                    {assignment.user_email}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <MapPin className="h-3 w-3" />
                                                                                    {assignment.location}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Clock className="h-3 w-3" />
                                                                                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    Expected: {new Date(assignment.expected_return_date).toLocaleDateString()}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => sendSingleReminder(assignment)}
                                                                    className="h-8"
                                                                >
                                                                    <Bell className="h-3 w-3 mr-1" />
                                                                    Remind
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => checkInAsset(assignment)}
                                                                    className="h-8"
                                                                >
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Check In
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Bulk Reminder Confirmation Dialog */}
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Bulk Reminders</DialogTitle>
                        <DialogDescription>
                            Send reminder emails to {selectedAssignments.length} selected user(s) about their overdue assets.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>Recipients will receive an email with:</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                                <li>• Asset details and assignment information</li>
                                <li>• Expected return date</li>
                                <li>• Number of days overdue</li>
                                <li>• Instructions for return</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={sendBulkReminders} disabled={reminderForm.processing}>
                            {reminderForm.processing ? 'Sending...' : 'Send Reminders'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Instructions Card */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-2">Admin Features</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• View all asset withdrawals grouped by site</li>
                                <li>• Send individual reminder emails to users</li>
                                <li>• Send bulk reminders to multiple users</li>
                                <li>• Check in assets directly from this view</li>
                                <li>• Filter by site to focus on specific locations</li>
                                <li>• Select multiple assignments for bulk operations</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

LiveTrackingAdmin.layout = {
    breadcrumbs: [
        {
            title: 'Asset Tracking',
            href: '/live-tracking',
        },
        {
            title: 'Admin Dashboard',
            href: '#',
        },
    ],
};