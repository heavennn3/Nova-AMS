import { Head, router } from '@inertiajs/react';
import {
    Eye,
    Search,
    CheckCircle,
    XCircle,
    Package,
    RotateCcw,
    Clock,
    CheckCircle2,
    Inbox,
    Bell,
    BellRing,
    MapPin,
    CalendarDays,
    AlertTriangle,
    Image as ImageIcon,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AdminIndex({ requests = [], sites = [] }: { requests: any[]; sites: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedSite, setSelectedSite] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Action dialogs
    const [actionRequest, setActionRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
    const [isProofPreviewOpen, setIsProofPreviewOpen] = useState(false);

    const statusSortOrder: Record<string, number> = {
        pending: 0,
        return_pending: 1,
        approved: 2,
        returned: 3,
        rejected: 4,
    };

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            search === '' ||
            r.request_number?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase());
        // Handle both capital and lowercase status values
        const normalizedStatus = r.status?.toLowerCase();
        const matchesStatus =
            selectedStatus === 'all' || normalizedStatus === selectedStatus.toLowerCase();
        const matchesType =
            selectedType === 'all' || r.request_type === selectedType;
        const matchesSite =
            selectedSite === 'all' || r.user?.site_id?.toString() === selectedSite;
        const matchesDateFrom =
            !dateFrom || new Date(r.created_at) >= new Date(dateFrom);
        const matchesDateTo =
            !dateTo || new Date(r.created_at) <= new Date(dateTo + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesType && matchesSite && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
        const aOrder = statusSortOrder[a.status?.toLowerCase()] ?? 99;
        const bOrder = statusSortOrder[b.status?.toLowerCase()] ?? 99;

        return aOrder - bOrder || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const getStatusConfig = (status: string) => {
        const config: Record<string, { color: string; bg: string; border: string; icon: any }> = {
            Pending: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', icon: Clock },
            Approved: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2 },

            Returned: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', icon: RotateCcw },
            Rejected: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: XCircle },
            Cancelled: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: XCircle },
            'Return_pending': { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', icon: BellRing },
        };

        return config[status] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Clock };
    };

    const getStatusBadge = (status: string) => {
        const cfg = getStatusConfig(status);
        const Icon = cfg.icon;

        return (
            <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} gap-1`}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return (
                    <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50 gap-1 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10">
                        <AlertTriangle className="h-3 w-3" /> Urgent
                    </Badge>
                );
            case 'High':
                return (
                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 gap-1 dark:text-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <BellRing className="h-3 w-3" /> High
                    </Badge>
                );
            default:
                return <span className="text-sm text-muted-foreground">Normal</span>;
        }
    };

    const openAction = (request: any, type: 'approve' | 'reject' | 'return') => {
        setActionRequest(request);
        setActionType(type);
        setAdminNotes('');

        // Set proof image preview if available for returns or return approvals
        if (type === 'return' || request.status === 'Return_pending') {
            const proofPath = request.return_proof_path || request.proof_photo_path || request.return_proof_photo;
            setProofImagePreview(proofPath ? `/storage/${proofPath}` : null);
        } else {
            setProofImagePreview(null);
        }
    };

    const submitAction = () => {
        if (!actionRequest || !actionType) {
            return;
        }

        // Check if this is a loan request
        const isLoanRequest = actionRequest.type === 'loan' || actionRequest.original_model === 'AssetLoan';

        router.post(`/requests/${actionRequest.id}/${actionType}`, {
            admin_notes: adminNotes,
            is_loan_request: isLoanRequest ? 'true' : 'false'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setActionRequest(null); setActionType(null); setAdminNotes('');
            },
        });
    };

    const actionConfig: Record<string, { title: string; buttonText: string; buttonClass: string; requireNotes: boolean }> = {
        approve: { title: 'Approve Request', buttonText: 'Approve', buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', requireNotes: false },
        reject: { title: 'Reject Request', buttonText: 'Reject', buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white', requireNotes: true },
        return: { title: 'Mark as Returned', buttonText: 'Mark Returned', buttonClass: 'bg-violet-600 hover:bg-violet-700 text-white', requireNotes: false },
    };

    // Stats
    const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'pending').length;
    const urgentPendingCount = requests.filter(r => (r.status === 'Pending' || r.status === 'pending') && r.priority === 'Urgent').length;
    const returnPendingCount = requests.filter(r => r.status === 'Return_pending').length;
    const stats = [
        { label: 'Pending Review', value: pendingCount, color: 'text-amber-600', iconBg: 'bg-amber-500/10', icon: Clock, pulse: pendingCount > 0 },
        { label: 'Approved', value: requests.filter(r => r.status === 'Approved' || r.status === 'approved').length, color: 'text-emerald-600', iconBg: 'bg-emerald-500/10', icon: CheckCircle2 },
        { label: 'Return Review', value: returnPendingCount, color: 'text-orange-600', iconBg: 'bg-orange-500/10', icon: BellRing, pulse: returnPendingCount > 0 },

        { label: 'Rejected', value: requests.filter(r => r.status === 'Rejected' || r.status === 'rejected').length, color: 'text-rose-600', iconBg: 'bg-rose-500/10', icon: XCircle },
    ];

    const clearFilters = () => {
        setSearch('');
        setSelectedStatus('all');
        setSelectedType('all');
        setSelectedSite('all');
        setDateFrom('');
        setDateTo('');
    };

    const hasFilters = search || selectedStatus !== 'all' || selectedType !== 'all' || selectedSite !== 'all' || dateFrom || dateTo;

    return (
        <>
            <Head title="Manage Requests" />

            <div className="flex flex-col space-y-6 p-8">
                {/* Header with notification */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Requests</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Review, approve, and manage all user requests
                            </p>
                        </div>
                        {(pendingCount > 0 || returnPendingCount > 0) && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 animate-pulse dark:bg-amber-500/10 dark:border-amber-500/30">
                                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                    {pendingCount > 0 && `${pendingCount} pending`}
                                    {pendingCount > 0 && returnPendingCount > 0 && ' • '}
                                    {returnPendingCount > 0 && `${returnPendingCount} return review`}
                                    {urgentPendingCount > 0 && (
                                        <span className="text-rose-600 dark:text-rose-300"> ({urgentPendingCount} urgent)</span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {stats.map(s => (
                        <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                            <div className={`rounded-lg p-2.5 ${s.iconBg}`}>
                                <s.icon className={`h-5 w-5 ${s.color} ${s.pulse ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none text-muted-foreground">{s.label}</p>
                                <p className="text-2xl font-bold leading-none text-foreground">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-[280px]">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="h-8 pl-8 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={selectedSite} onValueChange={setSelectedSite}>
                        <SelectTrigger className="h-8 w-[150px] text-sm">
                            <SelectValue placeholder="Site" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sites</SelectItem>
                            {sites.map((site: any) => (
                                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="h-8 w-[150px] text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>

                            <SelectItem value="Returned">Returned</SelectItem>
                            <SelectItem value="Return_pending">Return Review</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>

                        </SelectContent>
                    </Select>



                    <div className="flex h-8 items-center overflow-hidden rounded-md border border-input bg-background shadow-sm">

                        <Input
                            type="date"
                            className="h-8 w-[140px] rounded-none border-0 px-2 text-xs shadow-none focus-visible:ring-0"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            title="From date"
                        />
                    </div>

                    <div className="flex h-8 items-center overflow-hidden rounded-md border border-input bg-background shadow-sm">

                        <Input
                            type="date"
                            className="h-8 w-[140px] rounded-none border-0 px-2 text-xs shadow-none focus-visible:ring-0"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            title="To date"
                        />
                    </div>

                    {hasFilters && (
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearFilters}>
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto text-xs">
                            <thead className="bg-muted/30 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="w-[95px] px-2 py-2 text-left">Request ID</th>
                                    <th className="w-[190px] px-2 py-2 text-left">Name</th>
                                    <th className="w-[130px] px-2 py-2 text-left">Site</th>
                                    <th className="w-[95px] px-2 py-2 text-left">Type</th>
                                    <th className="w-[155px] px-2 py-2 text-left">Asset / License</th>
                                    <th className="w-[90px] px-2 py-2 text-left">Priority</th>
                                    <th className="w-[120px] px-2 py-2 text-left">Status</th>
                                    <th className="w-[105px] px-2 py-2 text-left">Submitted</th>
                                    <th className="w-[90px] px-2 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRequests.map((r) => {
                                    const isPending = r.status === 'Pending';
                                    const isReturnPending = r.status === 'Return_pending';
                                    const isUrgent = isPending && r.priority === 'Urgent';
                                    const isHigh = isPending && r.priority === 'High';

                                    return (
                                        <tr
                                            key={r.id}
                                            className={`transition-colors ${isUrgent ? 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-500/10 dark:hover:bg-rose-500/15' :
                                                isHigh ? 'bg-amber-50/30 hover:bg-amber-50/50 dark:bg-amber-500/10 dark:hover:bg-amber-500/15' :
                                                    isReturnPending ? 'bg-orange-50/30 hover:bg-orange-50/50 dark:bg-orange-500/10 dark:hover:bg-orange-500/15' :
                                                        isPending ? 'bg-amber-50/20 hover:bg-amber-50/30 dark:bg-amber-500/5 dark:hover:bg-amber-500/10' :
                                                            'hover:bg-muted/30'
                                                }`}
                                        >
                                            <td className="px-2 py-2">
                                                <div className="flex items-center gap-2">
                                                    {isPending && (
                                                        <span className={`h-2 w-2 rounded-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} />
                                                    )}
                                                    {isReturnPending && (
                                                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                                    )}
                                                    <span className="text-xs font-normal text-foreground">{r.request_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="font-medium text-foreground">{r.user?.name}</div>
                                                <div className="text-[11px] text-muted-foreground">{r.user?.email}</div>
                                            </td>
                                            <td className="px-2 py-2">
                                                <Badge
                                                    variant="outline"
                                                    className="grid w-[118px] grid-cols-[16px_1fr] items-center gap-1 border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                                                >
                                                    <span className="flex size-4 items-center justify-center">
                                                        <MapPin className="size-3 shrink-0" />
                                                    </span>
                                                    <span className="truncate text-left">{r.user?.site?.name || 'HQ'}</span>
                                                </Badge>
                                            </td>
                                            <td className="px-2 py-2">
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-transparent text-xs dark:bg-indigo-500/10 dark:text-indigo-300">
                                                    {r.request_type}
                                                </Badge>
                                            </td>
                                            <td className="px-2 py-2">
                                                {r.asset ? (
                                                    <div>
                                                        <div className="font-medium text-foreground text-xs">{r.asset.product_name}</div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">{r.asset.asset_id}</div>
                                                    </div>
                                                ) : r.license ? (
                                                    <div>
                                                        <div className="font-medium text-xs text-violet-700 dark:text-violet-300">{r.license.name}</div>
                                                        <div className="text-[11px] text-muted-foreground">{r.license.available_seats ?? '?'} seat(s) available</div>
                                                    </div>
                                                ) : r.category ? (
                                                    <div className="font-medium text-xs">{r.category.name}</div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-2 py-2">{getPriorityBadge(r.priority)}</td>
                                            <td className="px-2 py-2">{getStatusBadge(r.status)}</td>
                                            <td className="px-2 py-2 text-muted-foreground text-xs">
                                                {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-2 py-2 text-right">
                                                <div className="ml-auto grid w-[132px] grid-cols-4 items-center justify-items-center gap-1">
                                                    {(r.return_proof_path || r.proof_photo_path || r.return_proof_photo) ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 border border-violet-200 bg-violet-50 p-0 text-violet-700 hover:bg-violet-100 hover:text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
                                                            onClick={() => {
                                                                setProofImagePreview(`/storage/${r.return_proof_path || r.proof_photo_path || r.return_proof_photo}`);
                                                                setIsProofPreviewOpen(true);
                                                            }}
                                                            title="View proof photo"
                                                            aria-label="View proof photo"
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                        </Button>
                                                    ) : <span />}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 border border-blue-200 bg-blue-50 p-0 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                                                                onClick={() => router.get(`/requests/${r.id}${r.type === 'loan' || r.original_model === 'AssetLoan' ? '?is_loan=true' : ''}`)}
                                                                aria-label="View request details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>View details</TooltipContent>
                                                    </Tooltip>
                                                    {r.status === 'Pending' ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 border border-emerald-200 bg-emerald-50 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                                                                    onClick={() => openAction(r, 'approve')}
                                                                    aria-label="Approve request"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Approve</TooltipContent>
                                                        </Tooltip>
                                                    ) : r.status === 'Return_pending' && r.type === 'loan' ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 border border-orange-200 bg-orange-50 p-0 text-orange-700 hover:bg-orange-100 hover:text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
                                                                    onClick={() => openAction(r, 'return')}
                                                                    aria-label="Approve return"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Approve return</TooltipContent>
                                                        </Tooltip>
                                                    ) : <span />}
                                                    {r.status === 'Pending' ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 border border-rose-200 bg-rose-50 p-0 text-rose-700 hover:bg-rose-100 hover:text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                                                                    onClick={() => openAction(r, 'reject')}
                                                                    aria-label="Reject request"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Reject</TooltipContent>
                                                        </Tooltip>
                                                    ) : <span />}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Inbox className="h-8 w-8 text-muted-foreground/40" />
                                                <p className="font-medium">No requests found</p>
                                                {hasFilters && (
                                                    <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Dialog */}
            <Dialog open={!!actionType} onOpenChange={() => {
                setActionType(null); setActionRequest(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionType && actionConfig[actionType]?.title}</DialogTitle>
                    </DialogHeader>
                    {actionRequest && (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Request #</span>
                                    <span className="font-mono font-semibold text-emerald-700">{actionRequest.request_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Requester</span>
                                    <span className="font-medium">{actionRequest.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Site</span>
                                    <span>{actionRequest.user?.site?.name || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <span>{actionRequest.request_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Priority</span>
                                    <span>{actionRequest.priority}</span>
                                </div>
                                {actionRequest.reason && (
                                    <>
                                        <div className="pt-2 border-t mt-2">
                                            <span className="text-muted-foreground text-xs block mb-1">Reason:</span>
                                            <p className="text-sm bg-white/60 rounded p-2 dark:bg-background/60">{actionRequest.reason}</p>
                                        </div>
                                        {actionRequest.return_notes && (
                                            <div className="pt-2 border-t mt-2">
                                                <span className="text-muted-foreground text-xs block mb-1">Return Notes:</span>
                                                <p className="text-sm bg-blue-50/60 rounded p-2 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30">{actionRequest.return_notes}</p>
                                            </div>
                                        )}
                                        {(proofImagePreview || actionRequest.return_proof_path || actionRequest.proof_photo_path || actionRequest.return_proof_photo) && (
                                            <div className="pt-2 border-t mt-2">
                                                <span className="text-foreground text-sm font-semibold block mb-2 flex items-center gap-1">
                                                    <ImageIcon className="h-4 w-4 text-violet-600" />
                                                    Return Proof Photo
                                                </span>
                                                <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-700">
                                                    {proofImagePreview ? (
                                                        <img
                                                            src={proofImagePreview}
                                                            alt="Return proof"
                                                            className="w-full max-h-64 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="bg-slate-50 p-4 text-center text-sm text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                                                            Image not available
                                                        </div>
                                                    )}
                                                </div>
                                                {proofImagePreview && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Review the proof photo above before approving the return.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Missing proof photo warning for return approvals */}
                                        {actionType === 'return' && !(proofImagePreview || actionRequest.return_proof_path || actionRequest.proof_photo_path || actionRequest.return_proof_photo) && (
                                            <div className="pt-2 border-t mt-2">
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 dark:bg-amber-500/10 dark:border-amber-500/30">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 dark:text-amber-300" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">No proof photo available</p>
                                                            <p className="text-xs text-amber-700 mt-1 dark:text-amber-300">
                                                                The user did not upload a proof photo for this return. You can still approve, but please consider requesting proof.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                                {actionRequest.license && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-muted-foreground text-xs block mb-1">License:</span>
                                        <div className="flex items-center justify-between bg-violet-50 rounded p-2 dark:bg-violet-500/10">
                                            <div>
                                                <div className="text-sm font-medium text-violet-700 dark:text-violet-300">{actionRequest.license.name}</div>
                                                {actionRequest.license.product_key && (
                                                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Key: {actionRequest.license.product_key}</div>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 text-xs dark:text-violet-300 dark:border-violet-500/30 dark:bg-violet-500/10">
                                                {actionRequest.license.available_seats ?? '?'} seat(s) left
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Admin Notes {actionType && actionConfig[actionType]?.requireNotes && <span className="text-rose-500">*</span>}
                                </Label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder={actionType === 'reject' ? 'Provide a reason for rejection...' : 'Optional notes...'}
                                    className="min-h-[80px]"
                                    required={actionType ? actionConfig[actionType]?.requireNotes : false}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setActionType(null); setActionRequest(null);
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAction}
                            className={actionType ? actionConfig[actionType]?.buttonClass : ''}
                            disabled={actionType === 'reject' && !adminNotes.trim()}
                        >
                            {actionType && actionConfig[actionType]?.buttonText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Proof Photo Preview Dialog */}
            <Dialog open={isProofPreviewOpen && !!proofImagePreview} onOpenChange={(open) => {
                setIsProofPreviewOpen(open);
                if (!open && !actionRequest) setProofImagePreview(null);
            }}>
                <DialogContent className="max-w-4xl border-0 bg-black/95 p-3 shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Proof Photo Preview</DialogTitle>
                    </DialogHeader>
                    {proofImagePreview && (
                        <img
                            src={proofImagePreview}
                            alt="Return proof preview"
                            className="max-h-[85vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>


        </>
    );
}

AdminIndex.layout = {
    breadcrumbs: [
        { title: 'Manage Requests', href: '/requests/admin' },
    ],
};
