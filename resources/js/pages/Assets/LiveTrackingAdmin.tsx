import { Head, usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
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
    Building2,
    Calendar,
    Hash,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    Eye,
    Wrench,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableActions } from '@/components/data-table/data-table-actions';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [localSiteFilter, setLocalSiteFilter] = useState(filters.site_id);
    const [searchTerm, setSearchTerm] = useState('');

    const reminderForm = useForm({
        assignment_ids: [] as number[],
    });

    // Flatten all assignments for data table
    const allAssignments = useMemo(() => {
        let assignments = assignmentsBySite.flatMap(sa =>
            sa.assignments.map(a => ({
                ...a,
                site_code: sa.site.code,
            }))
        );

        // Apply site filter
        if (localSiteFilter !== 'all') {
            assignments = assignments.filter(a => a.site_id === parseInt(localSiteFilter));
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            assignments = assignments.filter(a =>
                a.product_name.toLowerCase().includes(term) ||
                a.asset_id.toLowerCase().includes(term) ||
                a.user_name.toLowerCase().includes(term) ||
                a.user_email.toLowerCase().includes(term) ||
                a.site.toLowerCase().includes(term)
            );
        }

        return assignments;
    }, [assignmentsBySite, localSiteFilter, searchTerm]);

    // Calculate overdue stats
    const overdueAssignments = allAssignments.filter(a => a.is_overdue);

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

    // Toggle assignment selection
    const toggleAssignment = (assignmentId: number) => {
        const newSelected = selectedAssignments.includes(assignmentId)
            ? selectedAssignments.filter(id => id !== assignmentId)
            : [...selectedAssignments, assignmentId];
        setSelectedAssignments(newSelected);
    };

    // View assignment details
    const viewDetails = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsDetailsDialogOpen(true);
    };

    // Send single reminder
    const sendSingleReminder = (assignment: Assignment) => {
        if (!confirm(`Send reminder to ${assignment.user_name} about ${assignment.product_name}?`)) return;

        router.post(`/asset-track/${assignment.id}/send-reminder`, {}, {
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
        reminderForm.post('/asset-track/bulk-reminders', {
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

        router.patch(`/asset-track/${assignment.id}/checkin`, {}, {
            onSuccess: () => {
                toast.success('Asset checked in successfully!');
                window.location.reload();
            },
            onError: () => {
                toast.error('Failed to check in asset');
            },
        });
    };

    // Data table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="ID" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-mono text-xs text-primary hover:underline"
                        onClick={() => viewDetails(assignment)}
                    >
                        <Hash className="h-3 w-3 mr-1" />
                        #{assignment.id}
                    </Button>
                );
            },
        },
        {
            accessorKey: 'asset_info',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Asset Information" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <div className="space-y-1">
                        <div className="font-semibold text-sm">{assignment.product_name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                {assignment.asset_id}
                            </span>
                            {assignment.category && (
                                <span>• {assignment.category}</span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'user_info',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned To" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {assignment.user_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {assignment.user_email}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'site_info',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Location" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {assignment.site}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {assignment.location}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'assigned_at',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned Date" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <div className="text-sm">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                );
            },
        },
        {
            accessorKey: 'expected_return_date',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Expected Return" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                const expectedDate = new Date(assignment.expected_return_date);
                const isOverdue = assignment.is_overdue;

                return (
                    <div className="space-y-1">
                        <div className="text-sm">
                            {expectedDate.toLocaleDateString()}
                        </div>
                        {isOverdue ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {assignment.days_overdue}d overdue
                            </Badge>
                        ) : (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                On track
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'duration',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Duration" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <div className="text-sm text-muted-foreground">
                        {assignment.duration}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                return (
                    <DataTableActions
                        items={[
                            {
                                label: 'View Details',
                                icon: Eye,
                                onClick: () => viewDetails(assignment),
                                show: true,
                            },
                            {
                                label: 'Send Reminder',
                                icon: Bell,
                                onClick: () => sendSingleReminder(assignment),
                                show: true,
                            },
                            {
                                label: 'Check In',
                                icon: CheckCircle2,
                                onClick: () => checkInAsset(assignment),
                                show: true,
                            },
                        ]}
                    />
                );
            },
        },
    ], []);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Withdrawal Tracking" />

            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Activity className="mr-3 h-8 w-8 text-primary" />
                        Asset Track
                    </h1>

                </div>
                <div className="flex gap-2">
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <Activity className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">In Use</p>
                        <p className="text-2xl font-bold">{stats.in_use}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Returned</p>
                        <p className="text-2xl font-bold">{stats.total_returned}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-purple-500/10 p-3">
                        <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Returned Today</p>
                        <p className="text-2xl font-bold">{stats.returned_today}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className={`rounded-full p-3 ${stats.overdue > 0 ? 'bg-red-500/10' : 'bg-gray-100'}`}>
                        <AlertTriangle className={`h-6 w-6 ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Overdue</p>
                        <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-500'}`}>{stats.overdue}</p>
                    </div>
                </div>
            </div>



            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Active Loans
                        </div>

                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={allAssignments}
                        search={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                </CardContent>
            </Card>

            {/* Assignment Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Withdrawal Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about this asset withdrawal
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAssignment && (
                        <div className="space-y-6">
                            {/* Asset Information */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Package className="h-4 w-4 text-primary" />
                                    Asset Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Asset ID</Label>
                                        <div className="font-mono bg-muted px-2 py-1 rounded mt-1">
                                            {selectedAssignment.asset_id}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Product Name</Label>
                                        <div className="font-semibold mt-1">
                                            {selectedAssignment.product_name}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Category</Label>
                                        <div className="mt-1">
                                            {selectedAssignment.category || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Withdrawal ID</Label>
                                        <div className="font-mono text-xs mt-1">
                                            #{selectedAssignment.id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Assigned User
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Name</Label>
                                        <div className="font-semibold mt-1">
                                            {selectedAssignment.user_name}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            {selectedAssignment.user_email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Information */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    Location Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Site</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building2 className="h-3 w-3 text-muted-foreground" />
                                            {selectedAssignment.site}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Location</Label>
                                        <div className="mt-1">
                                            {selectedAssignment.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Information */}
                            <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Timeline Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Assigned Date</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            {new Date(selectedAssignment.assigned_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Expected Return</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            {new Date(selectedAssignment.expected_return_date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Duration</Label>
                                        <div className="font-semibold mt-1">
                                            {selectedAssignment.duration}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Status</Label>
                                        <div className="mt-1">
                                            {selectedAssignment.is_overdue ? (
                                                <Badge className="bg-red-100 text-red-700 border-red-200">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {selectedAssignment.days_overdue} days overdue
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Active - On track
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            {selectedAssignment.remarks && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-primary" />
                                        Remarks
                                    </h4>
                                    <div className="text-sm bg-muted p-3 rounded-lg">
                                        {selectedAssignment.remarks}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                            Close
                        </Button>
                        {selectedAssignment && (
                            <>
                                <Button variant="outline" onClick={() => {
                                    setIsDetailsDialogOpen(false);
                                    sendSingleReminder(selectedAssignment);
                                }}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Reminder
                                </Button>
                                <Button onClick={() => {
                                    setIsDetailsDialogOpen(false);
                                    checkInAsset(selectedAssignment);
                                }}>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Check In Asset
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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


        </div>
    );
}

LiveTrackingAdmin.layout = {
    breadcrumbs: [
        {
            title: 'Asset Tracking',
            href: '/asset-track',
        },
        {
            title: 'Admin Dashboard',
            href: '#',
        },
    ],
};