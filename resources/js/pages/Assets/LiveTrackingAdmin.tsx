import { Head, usePage, useForm, router } from '@inertiajs/react';
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
    Search,
    RefreshCw,
    Building2,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    Eye,
    Wrench,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    source?: 'assignment' | 'loan';
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
        total_returned: 0,
        overdue: 0,
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
        total_returned: number;
        overdue: number;
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

    // New filter states
    const [overdueFilter, setOverdueFilter] = useState<'all' | 'overdue' | 'on-time'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [assignedDateFrom, setAssignedDateFrom] = useState<string>('');
    const [assignedDateTo, setAssignedDateTo] = useState<string>('');
    const [returnDateFrom, setReturnDateFrom] = useState<string>('');
    const [returnDateTo, setReturnDateTo] = useState<string>('');

    const formatTimeDistance = (ms: number) => {
        const absHours = Math.ceil(Math.abs(ms) / (1000 * 60 * 60));

        if (absHours < 24) {
            return `${absHours} hour${absHours === 1 ? '' : 's'}`;
        }

        const days = Math.ceil(absHours / 24);
        return `${days} day${days === 1 ? '' : 's'}`;
    };

    const getReturnStatus = (date: string) => {
        const diff = new Date(date).getTime() - Date.now();
        const label = formatTimeDistance(diff);

        return diff < 0
            ? { overdue: true, message: `${label} overdue` }
            : { overdue: false, message: `${label} remaining` };
    };

    const getLoanAge = (date: string) => `${formatTimeDistance(Date.now() - new Date(date).getTime())} loaned`;

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

        // Apply overdue filter
        if (overdueFilter === 'overdue') {
            assignments = assignments.filter(a => a.is_overdue);
        } else if (overdueFilter === 'on-time') {
            assignments = assignments.filter(a => !a.is_overdue);
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            assignments = assignments.filter(a => a.category === categoryFilter);
        }

        // Apply assigned date range filter
        if (assignedDateFrom) {
            assignments = assignments.filter(a => new Date(a.assigned_at) >= new Date(assignedDateFrom));
        }
        if (assignedDateTo) {
            assignments = assignments.filter(a => new Date(a.assigned_at) <= new Date(assignedDateTo));
        }

        // Apply return date range filter
        if (returnDateFrom) {
            assignments = assignments.filter(a => new Date(a.expected_return_date) >= new Date(returnDateFrom));
        }
        if (returnDateTo) {
            assignments = assignments.filter(a => new Date(a.expected_return_date) <= new Date(returnDateTo));
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
    }, [assignmentsBySite, localSiteFilter, overdueFilter, categoryFilter, assignedDateFrom, assignedDateTo, returnDateFrom, returnDateTo, searchTerm]);

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
        if (!confirm(`Send reminder to ${assignment.user_name} about ${assignment.product_name}?`)) {
            return;
        }

        router.post(`/asset-track/${assignment.id}/send-reminder`, { source: assignment.source ?? 'assignment' }, {
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
        if (!confirm(`Check in ${assignment.product_name} from ${assignment.user_name}?`)) {
            return;
        }

        router.patch(`/asset-track/${assignment.id}/checkin`, { source: assignment.source ?? 'assignment' }, {
            onSuccess: () => {
                toast.success('Asset checked in successfully!');
                window.location.reload();
            },
            onError: () => {
                toast.error('Failed to check in asset');
            },
        });
    };

    // Helper: Get unique categories from all assignments
    const getUniqueCategories = () => {
        const categories = assignmentsBySite.flatMap(sa =>
            sa.assignments.map(a => a.category)
        ).filter(Boolean);
        return Array.from(new Set(categories)).sort();
    };

    // Helper: Clear all filters
    const clearAllFilters = () => {
        setLocalSiteFilter('all');
        setOverdueFilter('all');
        setCategoryFilter('all');
        setAssignedDateFrom('');
        setAssignedDateTo('');
        setReturnDateFrom('');
        setReturnDateTo('');
        setSearchTerm('');
    };

    // Helper: Count active filters
    const getActiveFilterCount = () => {
        let count = 0;
        if (localSiteFilter !== 'all') count++;
        if (overdueFilter !== 'all') count++;
        if (categoryFilter !== 'all') count++;
        if (assignedDateFrom) count++;
        if (assignedDateTo) count++;
        if (returnDateFrom) count++;
        if (returnDateTo) count++;
        if (searchTerm) count++;
        return count;
    };

    // Data table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Loan ID" />
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 font-mono text-xs text-primary hover:underline"
                        onClick={() => viewDetails(assignment)}
                    >
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
                    <div className="flex min-h-12 flex-col justify-center gap-1.5">
                        <div className="text-sm font-semibold leading-none">{assignment.product_name}</div>
                        <div className="flex items-center gap-2 text-xs leading-none text-muted-foreground">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                {assignment.asset_id}
                            </span>
                            {assignment.category && (
                                <span>{assignment.category}</span>
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
                    <div className="flex min-h-12 flex-col justify-center gap-1.5">
                        <div className="flex items-center gap-2 text-sm leading-none">
                            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>{assignment.user_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs leading-none text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span>{assignment.user_email}</span>
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
                    <div className="flex min-h-12 items-center gap-2 text-sm">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>{assignment.site}</span>
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

                const loanAge = getLoanAge(assignment.assigned_at);

                return (
                    <div className="flex min-h-12 flex-col justify-center gap-1.5">
                        <div className="text-sm leading-none">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                        </div>
                        <Badge className="w-fit gap-1 bg-blue-100 text-xs text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30">
                            <Clock className="h-3 w-3" />
                            {loanAge}
                        </Badge>
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
                const returnStatus = getReturnStatus(assignment.expected_return_date);

                return (
                    <div className="flex min-h-12 flex-col justify-center gap-1.5">
                        <div className="text-sm leading-none">
                            {expectedDate.toLocaleDateString()}
                        </div>
                        {returnStatus.overdue ? (
                            <Badge className="w-fit gap-1 bg-red-100 text-xs text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30">
                                <AlertTriangle className="h-3 w-3" />
                                {returnStatus.message}
                            </Badge>
                        ) : (
                            <Badge className="w-fit gap-1 bg-green-100 text-xs text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                {returnStatus.message}
                            </Badge>
                        )}
                    </div>
                );
            },
        },

        {
            id: 'actions',
            header: () => (
                <div className="text-right">Actions</div>
            ),
            cell: ({ row }: any) => {
                const assignment = row.original;
                const actions = [
                    { label: 'View Details', icon: Eye, onClick: () => viewDetails(assignment) },
                    { label: 'Send Reminder', icon: Bell, onClick: () => sendSingleReminder(assignment) },
                    { label: 'Check In', icon: CheckCircle2, onClick: () => checkInAsset(assignment) },
                ];

                return (
                    <div className="flex min-h-12 items-center justify-end gap-1.5">
                        {actions.map((action) => (
                            <Button
                                key={action.label}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={action.onClick}
                                title={action.label}
                                aria-label={action.label}
                            >
                                <action.icon className="h-4 w-4" />
                            </Button>
                        ))}
                    </div>
                );
            },
        },
    ], []);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Withdrawal Tracking" />



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
            <div className="grid grid-cols-3 gap-4">
                <div
                    className={`bg-blue-50 border border-blue-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg dark:bg-blue-500/10 dark:border-blue-500/30 `} >
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">In Use</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.in_use}</p>
                </div>





                <div
                    className={`bg-green-50 border border-green-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg dark:bg-green-500/10 dark:border-green-500/30 `}

                >
                    <h3 className="font-semibold text-green-900 dark:text-green-200">Returned Today</h3>


                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.returned_today}</p>

                </div>


                <div
                    className={`bg-red-50 border border-red-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg dark:bg-red-500/10 dark:border-red-500/30 `}

                >
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Overdue </h3>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.overdue}</p>

                </div>

            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>

                <Select value={localSiteFilter} onValueChange={setLocalSiteFilter}>
                    <SelectTrigger className="h-8 w-[150px] text-sm">
                        <SelectValue placeholder="Site" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                                {site.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 w-[170px] text-sm">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getUniqueCategories().map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={overdueFilter} onValueChange={(value: any) => setOverdueFilter(value)}>
                    <SelectTrigger className="h-8 w-[150px] text-sm">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="overdue">Overdue Only</SelectItem>
                        <SelectItem value="on-time">On-Time Only</SelectItem>
                    </SelectContent>
                </Select>

                {getActiveFilterCount() > 0 && (
                    <Button variant="outline" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Clear
                    </Button>
                )}
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
                                            {getReturnStatus(selectedAssignment.expected_return_date).overdue ? (
                                                <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {getReturnStatus(selectedAssignment.expected_return_date).message}
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    {getReturnStatus(selectedAssignment.expected_return_date).message}
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