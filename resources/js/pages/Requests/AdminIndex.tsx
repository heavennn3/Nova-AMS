import * as React from 'react';
import { useState } from 'react';
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
    AlertTriangle,
    Inbox,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminIndex({ requests = [] }: { requests: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    // Action dialogs
    const [actionRequest, setActionRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'fulfill' | 'return' | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            search === '' ||
            r.request_number?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            selectedStatus === 'all' || r.status === selectedStatus;
        const matchesType =
            selectedType === 'all' || r.request_type === selectedType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'text-amber-600 border-amber-200 bg-amber-50',
            Approved: 'text-emerald-600 border-emerald-200 bg-emerald-50',
            Fulfilled: 'text-blue-600 border-blue-200 bg-blue-50',
            Returned: 'text-violet-600 border-violet-200 bg-violet-50',
            Rejected: 'text-red-600 border-red-200 bg-red-50',
            Cancelled: 'text-slate-500 border-slate-200 bg-slate-50',
        };
        return <Badge variant="outline" className={styles[status] || ''}>{status}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Urgent</Badge>;
            case 'High':
                return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">High</Badge>;
            default:
                return <span className="text-sm text-muted-foreground">{priority}</span>;
        }
    };

    const openAction = (request: any, type: 'approve' | 'reject' | 'fulfill' | 'return') => {
        setActionRequest(request);
        setActionType(type);
        setAdminNotes('');
    };

    const submitAction = () => {
        if (!actionRequest || !actionType) return;
        const url = `/requests/${actionRequest.id}/${actionType}`;
        router.post(url, { admin_notes: adminNotes }, {
            preserveScroll: true,
            onSuccess: () => { setActionRequest(null); setActionType(null); setAdminNotes(''); },
        });
    };

    const actionConfig: Record<string, { title: string; buttonText: string; buttonClass: string; requireNotes: boolean }> = {
        approve: { title: 'Approve Request', buttonText: 'Approve', buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', requireNotes: false },
        reject: { title: 'Reject Request', buttonText: 'Reject', buttonClass: 'bg-red-600 hover:bg-red-700 text-white', requireNotes: true },
        fulfill: { title: 'Mark as Fulfilled', buttonText: 'Fulfill', buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white', requireNotes: false },
        return: { title: 'Mark as Returned', buttonText: 'Mark Returned', buttonClass: 'bg-violet-600 hover:bg-violet-700 text-white', requireNotes: false },
    };

    // Stats
    const stats = {
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        fulfilled: requests.filter(r => r.status === 'Fulfilled').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
    };

    return (
        <>
            <Head title="Manage Requests" />

            <div className="flex flex-col space-y-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Requests</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review, approve, and manage all user requests
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Pending Review', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
                        { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                        { label: 'Fulfilled', value: stats.fulfilled, color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
                        { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 ${s.bg} flex items-center gap-3`}>
                            <div className={`rounded-lg p-2 bg-white/60`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</div>
                                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by request # or requester..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All statuses" />
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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All types" />
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
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Request #</th>
                                <th className="px-4 py-3 text-left">Requester</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Asset / Category</th>
                                <th className="px-4 py-3 text-left">Priority</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Submitted</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredRequests.map((r) => (
                                <tr key={r.id} className={`hover:bg-muted/30 transition-colors ${r.status === 'Pending' && r.priority === 'Urgent' ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-4 py-3.5">
                                        <span className="font-mono text-xs font-semibold text-emerald-600">{r.request_number}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="font-medium">{r.user?.name}</div>
                                        <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-transparent text-xs">
                                            {r.request_type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {r.asset ? (
                                            <div>
                                                <div className="font-medium">{r.asset.product_name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{r.asset.asset_id}</div>
                                            </div>
                                        ) : r.category ? (
                                            <div className="font-medium">{r.category.name}</div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">{getPriorityBadge(r.priority)}</td>
                                    <td className="px-4 py-3.5">{getStatusBadge(r.status)}</td>
                                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                                        {new Date(r.created_at).toLocaleDateString()}
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
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Inbox className="h-8 w-8 text-muted-foreground/50" />
                                            <p>No requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Request #</span>
                                    <span className="font-mono font-semibold text-emerald-600">{actionRequest.request_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Requester</span>
                                    <span className="font-medium">{actionRequest.user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <span>{actionRequest.request_type}</span>
                                </div>
                                {actionRequest.reason && (
                                    <div className="pt-2 border-t mt-2">
                                        <span className="text-muted-foreground text-xs">Reason:</span>
                                        <p className="text-sm mt-0.5">{actionRequest.reason}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Admin Notes {actionType && actionConfig[actionType]?.requireNotes && <span className="text-red-500">*</span>}
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
        </>
    );
}
