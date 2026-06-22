import * as React from 'react';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Search,
    ArrowDownToLine,
    ArrowUpFromLine,
    Package,
    Plus,
    Clock,
    CheckCircle2,
    RotateCcw,
    Calendar,
    Inbox,
    AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CheckOutInIndex({ assignments = [], pendingRequests = [] }: { assignments: any[]; pendingRequests: any[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [checkinId, setCheckinId] = useState<number | null>(null);

    const filtered = assignments.filter((a) => {
        const matchesSearch =
            search === '' ||
            a.asset?.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            a.asset?.asset_id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeCount = assignments.filter(a => a.status === 'active').length;
    const returnedCount = assignments.filter(a => a.status === 'returned').length;
    const pendingCount = pendingRequests.length;

    const handleCheckin = () => {
        if (!checkinId) return;
        router.post(`/checkout/${checkinId}/checkin`, {}, {
            preserveScroll: true,
            onSuccess: () => setCheckinId(null),
        });
    };

    const formatDate = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (d: string) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title="Check Out / Check In" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Check Out / Check In</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your asset checkouts and returns
                        </p>
                    </div>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => router.get('/checkout/new')}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Check Out Asset
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-lg border p-4 flex items-center gap-3">
                        <div className="rounded-lg p-2.5 bg-amber-100">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pending</div>
                            <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
                        </div>
                    </div>
                    <div className="rounded-lg border p-4 flex items-center gap-3">
                        <div className="rounded-lg p-2.5 bg-emerald-100">
                            <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Checked Out</div>
                            <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
                        </div>
                    </div>
                    <div className="rounded-lg border p-4 flex items-center gap-3">
                        <div className="rounded-lg p-2.5 bg-violet-100">
                            <ArrowUpFromLine className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Returned</div>
                            <div className="text-2xl font-bold text-violet-700">{returnedCount}</div>
                        </div>
                    </div>
                    <div className="rounded-lg border p-4 flex items-center gap-3">
                        <div className="rounded-lg p-2.5 bg-slate-100">
                            <Package className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total</div>
                            <div className="text-2xl font-bold">{assignments.length}</div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="border-b px-5 py-3 bg-amber-50/50 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <h2 className="font-semibold text-sm">Pending Checkout Requests</h2>
                            <span className="text-xs text-muted-foreground ml-auto">{pendingRequests.length} awaiting approval</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">Ref</th>
                                        <th className="px-4 py-2.5 text-left">Asset</th>
                                        <th className="px-4 py-2.5 text-left">Tag</th>
                                        <th className="px-4 py-2.5 text-left">Submitted</th>
                                        <th className="px-4 py-2.5 text-left">Expected Return</th>
                                        <th className="px-4 py-2.5 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {pendingRequests.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-2.5 font-mono text-xs font-medium">{r.request_number}</td>
                                            <td className="px-4 py-2.5 font-medium">{r.asset?.product_name || '—'}</td>
                                            <td className="px-4 py-2.5 font-mono text-xs text-emerald-700">{r.asset?.asset_id || '—'}</td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(r.created_at)}</td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.required_until ? formatDate(r.required_until) : 'Indefinite'}</td>
                                            <td className="px-4 py-2.5">
                                                {r.status === 'Pending' ? (
                                                    <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 gap-1">
                                                        <Clock className="h-3 w-3" /> Pending
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Approved
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search"
                            className="pl-8 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Checked Out</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {filtered.length} of {assignments.length} records
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left">Asset</th>
                                    <th className="px-4 py-3 text-left">Tag</th>
                                    <th className="px-4 py-3 text-left">Site</th>
                                    <th className="px-4 py-3 text-left">Checked Out</th>
                                    <th className="px-4 py-3 text-left">Returned</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Remarks</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.map((a) => {
                                    const isActive = a.status === 'active';
                                    // Check for overdue (parse expected return from remarks)
                                    let isOverdue = false;
                                    const returnMatch = a.remarks?.match(/Expected return: (\d{4}-\d{2}-\d{2})/);
                                    if (returnMatch && isActive) {
                                        isOverdue = new Date(returnMatch[1]) < new Date();
                                    }

                                    return (
                                        <tr key={a.id} className={`transition-colors ${isOverdue ? 'bg-rose-50/50' : 'hover:bg-muted/30'}`}>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                                                    <span className="font-medium">{a.asset?.product_name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono text-xs font-semibold text-emerald-600">{a.asset?.asset_id || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-muted-foreground">{a.site?.name || '—'}</td>
                                            <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateTime(a.assigned_at)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                                {a.returned_at ? formatDateTime(a.returned_at) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {isActive ? (
                                                    <Badge variant="outline" className={`gap-1 ${isOverdue ? 'text-rose-700 border-rose-200 bg-rose-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'}`}>
                                                        {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                        {isOverdue ? 'Overdue' : 'Checked Out'}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-violet-700 border-violet-200 bg-violet-50 gap-1">
                                                        <RotateCcw className="h-3 w-3" /> Returned
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                                                {a.remarks?.replace(/\s*\|\s*Expected return:.*$/, '') || '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                {isActive && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-violet-600 border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                                        onClick={() => setCheckinId(a.id)}
                                                    >
                                                        <ArrowUpFromLine className="h-3.5 w-3.5 mr-1" /> Check In
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <Inbox className="h-8 w-8 text-muted-foreground/40" />
                                                <p className="font-medium">No records found</p>
                                                <p className="text-xs">Check out an asset to see it here</p>
                                                <Button variant="outline" size="sm" onClick={() => router.get('/checkout/new')}>
                                                    <Plus className="mr-1 h-3 w-3" /> Check Out Asset
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Check In Confirmation */}
            <Dialog open={!!checkinId} onOpenChange={() => setCheckinId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="rounded-lg p-2 bg-violet-100">
                                <ArrowUpFromLine className="h-4 w-4 text-violet-600" />
                            </div>
                            Confirm Check In
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to check in this asset? The asset will be marked as available again.
                        </p>
                        {(() => {
                            const assignment = assignments.find(a => a.id === checkinId);
                            if (!assignment) return null;
                            return (
                                <div className="mt-3 rounded-lg border bg-muted/30 p-3 text-sm">
                                    <div className="font-semibold">{assignment.asset?.product_name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{assignment.asset?.asset_id}</div>
                                </div>
                            );
                        })()}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckinId(null)}>Cancel</Button>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={handleCheckin}>
                            <ArrowUpFromLine className="h-4 w-4 mr-2" /> Confirm Check In
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CheckOutInIndex.layout = {
    breadcrumbs: [
        { title: 'Check Out / Check In', href: '/checkout' },
    ],
};
