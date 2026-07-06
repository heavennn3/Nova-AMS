import * as React from 'react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
    Filter,
    AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminIndex({ requests = [], sites = [] }: { requests: any[]; sites: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedSite, setSelectedSite] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Selection
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Action dialogs
    const [actionRequest, setActionRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'fulfill' | 'return' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    // Batch dialogs
    const [batchAction, setBatchAction] = useState<'approve' | 'reject' | null>(null);
    const [batchNotes, setBatchNotes] = useState('');

    const toggleRow = (id: number) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        const pendingIds = filteredRequests.filter(r => r.status === 'Pending').map(r => r.id);
        if (pendingIds.every(id => selectedRows.has(id))) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(pendingIds));
        }
    };

    const pendingSelected = [...selectedRows].filter(id => requests.find(r => r.id === id && r.status === 'Pending'));

    const submitBatchAction = () => {
        if (!batchAction || pendingSelected.length === 0) return;
        const url = `/requests/batch-${batchAction}`;
        router.post(url, { ids: pendingSelected, admin_notes: batchNotes }, {
            preserveScroll: true,
            onSuccess: () => { setBatchAction(null); setBatchNotes(''); setSelectedRows(new Set()); },
        });
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
    });

    const getStatusConfig = (status: string) => {
        const config: Record<string, { color: string; bg: string; border: string; icon: any }> = {
            Pending: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
            Approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
            Fulfilled: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Package },
            Returned: { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: RotateCcw },
            Rejected: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle },
            Cancelled: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: XCircle },
        };
        return config[status] || { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock };
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
                    <Badge variant="outline" className="text-rose-700 border-rose-200 bg-rose-50 gap-1">
                        <AlertTriangle className="h-3 w-3" /> Urgent
                    </Badge>
                );
            case 'High':
                return (
                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 gap-1">
                        <BellRing className="h-3 w-3" /> High
                    </Badge>
                );
            default:
                return <span className="text-sm text-muted-foreground">Normal</span>;
        }
    };

    const openAction = (request: any, type: 'approve' | 'reject' | 'fulfill' | 'return') => {
        setActionRequest(request);
        setActionType(type);
        setAdminNotes('');
    };

    const submitAction = () => {
        if (!actionRequest || !actionType) return;

        // Check if this is a loan request
        const isLoanRequest = actionRequest.type === 'loan' || actionRequest.original_model === 'AssetLoan';

        router.post(`/requests/${actionRequest.id}/${actionType}`, {
            admin_notes: adminNotes,
            is_loan_request: isLoanRequest ? 'true' : 'false'
        }, {
            preserveScroll: true,
            onSuccess: () => { setActionRequest(null); setActionType(null); setAdminNotes(''); },
        });
    };

    const actionConfig: Record<string, { title: string; buttonText: string; buttonClass: string; requireNotes: boolean }> = {
        approve: { title: 'Approve Request', buttonText: 'Approve', buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', requireNotes: false },
        reject: { title: 'Reject Request', buttonText: 'Reject', buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white', requireNotes: true },
        fulfill: { title: 'Mark as Fulfilled', buttonText: 'Fulfill', buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white', requireNotes: false },
        return: { title: 'Mark as Returned', buttonText: 'Mark Returned', buttonClass: 'bg-violet-600 hover:bg-violet-700 text-white', requireNotes: false },
    };

    // Stats
    const pendingCount = requests.filter(r => r.status === 'Pending' || r.status === 'pending').length;
    const urgentPendingCount = requests.filter(r => (r.status === 'Pending' || r.status === 'pending') && r.priority === 'Urgent').length;
    const stats = [
        { label: 'Pending Review', value: pendingCount, color: 'text-amber-700', bg: 'from-amber-50 to-amber-100/50', iconBg: 'bg-amber-100', icon: Clock, ring: pendingCount > 0 ? 'ring-2 ring-amber-300/50' : '' },
        { label: 'Approved', value: requests.filter(r => r.status === 'Approved' || r.status === 'approved').length, color: 'text-emerald-700', bg: 'from-emerald-50 to-emerald-100/50', iconBg: 'bg-emerald-100', icon: CheckCircle2, ring: '' },
        { label: 'Fulfilled', value: requests.filter(r => r.status === 'Fulfilled').length, color: 'text-blue-700', bg: 'from-blue-50 to-blue-100/50', iconBg: 'bg-blue-100', icon: Package, ring: '' },
        { label: 'Rejected', value: requests.filter(r => r.status === 'Rejected' || r.status === 'rejected').length, color: 'text-rose-700', bg: 'from-rose-50 to-rose-100/50', iconBg: 'bg-rose-100', icon: XCircle, ring: '' },
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
                        {pendingCount > 0 && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 animate-pulse">
                                <Bell className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-700">
                                    {pendingCount} pending
                                    {urgentPendingCount > 0 && (
                                        <span className="text-rose-600"> ({urgentPendingCount} urgent)</span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                    {stats.map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 bg-gradient-to-br ${s.bg} ${s.ring} flex items-center gap-3 transition-all`}>
                            <div className={`rounded-lg p-2.5 ${s.iconBg}`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</div>
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="rounded-xl border bg-card shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold text-muted-foreground">Filters</span>
                        {hasFilters && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto" onClick={clearFilters}>
                                Clear All
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div className="relative col-span-2 md:col-span-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search"
                                className="pl-8 h-9 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={selectedSite} onValueChange={setSelectedSite}>
                            <SelectTrigger className="h-9 text-sm">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <SelectValue placeholder="All Sites" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sites</SelectItem>
                                {sites.map((site: any) => (
                                    <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                                <SelectItem value="Returned">Returned</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Borrow">Borrow</SelectItem>
                                <SelectItem value="Checkout">Checkout</SelectItem>
                                <SelectItem value="Software License">Software License</SelectItem>
                                <SelectItem value="Maintenance Request">Maintenance</SelectItem>
                                <SelectItem value="Purchase Request">Purchase</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                className="h-9 text-sm pl-8"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                title="From date"
                            />
                        </div>
                        <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                className="h-9 text-sm pl-8"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                title="To date"
                            />
                        </div>
                    </div>
                </div>

                {/* Batch Action Bar */}
                {pendingSelected.length > 0 && (
                    <div className="flex items-center gap-3 bg-primary/5 border rounded-xl px-5 py-3">
                        <Checkbox checked={true} className="pointer-events-none" />
                        <span className="text-sm font-semibold">{pendingSelected.length} pending request(s) selected</span>
                        <div className="ml-auto flex gap-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setBatchAction('approve'); setBatchNotes(''); }}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Batch Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setBatchAction('reject'); setBatchNotes(''); }}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Batch Reject
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedRows(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="bg-muted/30 border-b px-4 py-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Showing {filteredRequests.length} of {requests.length} requests
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-3 py-3 w-10">
                                        <Checkbox
                                            checked={filteredRequests.filter(r => r.status === 'Pending').length > 0 && filteredRequests.filter(r => r.status === 'Pending').every(r => selectedRows.has(r.id))}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left">Request #</th>
                                    <th className="px-4 py-3 text-left">Requester</th>
                                    <th className="px-4 py-3 text-left">Site</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Asset / License</th>
                                    <th className="px-4 py-3 text-left">Priority</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Submitted</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredRequests.map((r) => {
                                    const isPending = r.status === 'Pending';
                                    const isUrgent = isPending && r.priority === 'Urgent';
                                    const isHigh = isPending && r.priority === 'High';
                                    return (
                                        <tr
                                            key={r.id}
                                            className={`transition-colors ${isUrgent ? 'bg-rose-50/50 hover:bg-rose-50' :
                                                    isHigh ? 'bg-amber-50/30 hover:bg-amber-50/50' :
                                                        isPending ? 'bg-amber-50/20 hover:bg-amber-50/30' :
                                                            'hover:bg-muted/30'
                                                }`}
                                        >
                                            <td className="px-3 py-3.5 w-10">
                                                {isPending ? (
                                                    <Checkbox
                                                        checked={selectedRows.has(r.id)}
                                                        onCheckedChange={() => toggleRow(r.id)}
                                                    />
                                                ) : <span className="block w-4" />}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    {isPending && (
                                                        <span className={`h-2 w-2 rounded-full ${isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} />
                                                    )}
                                                    <span className="font-mono text-xs font-semibold text-emerald-700">{r.request_number}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-medium text-foreground">{r.user?.name}</div>
                                                <div className="text-[11px] text-muted-foreground">{r.user?.email}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {r.user?.site ? (
                                                    <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 gap-1 text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {r.user.site.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-transparent text-xs">
                                                    {r.request_type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {r.asset ? (
                                                    <div>
                                                        <div className="font-medium text-foreground text-xs">{r.asset.product_name}</div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">{r.asset.asset_id}</div>
                                                    </div>
                                                ) : r.license ? (
                                                    <div>
                                                        <div className="font-medium text-xs text-violet-700">{r.license.name}</div>
                                                        <div className="text-[11px] text-muted-foreground">{r.license.available_seats ?? '?'} seat(s) available</div>
                                                    </div>
                                                ) : r.category ? (
                                                    <div className="font-medium text-xs">{r.category.name}</div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">{getPriorityBadge(r.priority)}</td>
                                            <td className="px-4 py-3.5">{getStatusBadge(r.status)}</td>
                                            <td className="px-4 py-3.5 text-muted-foreground text-xs">
                                                {new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.get(`/requests/${r.id}`)}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {r.status === 'Pending' && (
                                                        <>
                                                            <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2" onClick={() => openAction(r, 'approve')}>
                                                                <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => openAction(r, 'reject')}>
                                                                <XCircle className="h-3 w-3 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {r.status === 'Approved' && (
                                                        <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2" onClick={() => openAction(r, 'fulfill')}>
                                                            <Package className="h-3 w-3 mr-1" /> Fulfill
                                                        </Button>
                                                    )}
                                                    {r.status === 'Fulfilled' && ['Borrow', 'Checkout'].includes(r.request_type) && (
                                                        <Button size="sm" className="h-7 bg-violet-600 hover:bg-violet-700 text-white text-xs px-2" onClick={() => openAction(r, 'return')}>
                                                            <RotateCcw className="h-3 w-3 mr-1" /> Return
                                                        </Button>
                                                    )}
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
            <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setActionRequest(null); }}>
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
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-muted-foreground text-xs block mb-1">Reason:</span>
                                        <p className="text-sm bg-white/60 rounded p-2">{actionRequest.reason}</p>
                                    </div>
                                )}
                                {actionRequest.license && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-muted-foreground text-xs block mb-1">License:</span>
                                        <div className="flex items-center justify-between bg-violet-50 rounded p-2">
                                            <div>
                                                <div className="text-sm font-medium text-violet-700">{actionRequest.license.name}</div>
                                                {actionRequest.license.product_key && (
                                                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Key: {actionRequest.license.product_key}</div>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50 text-xs">
                                                {actionRequest.license.available_seats ?? '?'} seat(s) left
                                            </Badge>
                                        </div>
                                        {actionType === 'fulfill' && (
                                            <p className="text-[11px] text-emerald-600 mt-1.5">A license seat will be automatically assigned to {actionRequest.user?.name} upon fulfillment.</p>
                                        )}
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
                        <Button variant="outline" onClick={() => { setActionType(null); setActionRequest(null); }}>
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

            {/* Batch Action Dialog */}
            <Dialog open={!!batchAction} onOpenChange={() => setBatchAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {batchAction === 'approve' ? 'Batch Approve' : 'Batch Reject'} {pendingSelected.length} Request(s)
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            <span className="text-muted-foreground">Selected requests: </span>
                            <span className="font-semibold">{pendingSelected.length} pending</span>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Admin Notes {batchAction === 'reject' && <span className="text-rose-500">*</span>}
                            </Label>
                            <Textarea
                                value={batchNotes}
                                onChange={(e) => setBatchNotes(e.target.value)}
                                placeholder={batchAction === 'reject' ? 'Provide a reason for rejection...' : 'Optional notes for all selected requests...'}
                                className="min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBatchAction(null)}>Cancel</Button>
                        <Button
                            onClick={submitBatchAction}
                            className={batchAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
                            disabled={batchAction === 'reject' && !batchNotes.trim()}
                        >
                            {batchAction === 'approve' ? 'Approve All' : 'Reject All'} ({pendingSelected.length})
                        </Button>
                    </DialogFooter>
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
