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
} from '@/components/ui/dialog';
import {
    Search,
    Package,
    Key,
    Wrench,
    ShoppingCart,
    Monitor,
    ArrowRightLeft,
    RotateCcw,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Calendar,
    FileText,
    User,
    Filter,
    Inbox,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TransactionsIndex({ transactions = [] }: { transactions: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [detailItem, setDetailItem] = useState<any>(null);

    const filtered = transactions.filter((t) => {
        const matchesSearch =
            search === '' ||
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.reference?.toLowerCase().includes(search.toLowerCase());
        const matchesType =
            selectedType === 'all' || t.type === selectedType || t.subtype === selectedType;
        const matchesStatus =
            selectedStatus === 'all' || t.status === selectedStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getTypeIcon = (item: any) => {
        switch (item.subtype) {
            case 'Borrow': return <Package className="h-4 w-4" />;
            case 'Checkout': case 'Checked Out': return <Monitor className="h-4 w-4" />;
            case 'Software License': return <Key className="h-4 w-4" />;
            case 'Maintenance Request': return <Wrench className="h-4 w-4" />;
            case 'Purchase Request': return <ShoppingCart className="h-4 w-4" />;
            case 'Returned': return <RotateCcw className="h-4 w-4" />;
            default: return <ArrowRightLeft className="h-4 w-4" />;
        }
    };

    const getTypeColor = (item: any) => {
        switch (item.subtype) {
            case 'Borrow': return 'bg-blue-100 text-blue-600';
            case 'Checkout': case 'Checked Out': return 'bg-emerald-100 text-emerald-600';
            case 'Software License': return 'bg-violet-100 text-violet-600';
            case 'Maintenance Request': return 'bg-amber-100 text-amber-600';
            case 'Purchase Request': return 'bg-rose-100 text-rose-600';
            case 'Returned': return 'bg-slate-100 text-slate-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusConfig = (status: string) => {
        const map: Record<string, { color: string; bg: string; border: string; icon: any }> = {
            Pending: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
            Approved: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
            Fulfilled: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Package },
            Returned: { color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', icon: RotateCcw },
            Rejected: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle },
            Cancelled: { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: XCircle },
            Active: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
        };
        return map[status] || { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clock };
    };

    const formatDate = (date: string) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (date: string) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Stats
    const stats = {
        total: transactions.length,
        pending: transactions.filter(t => t.status === 'Pending').length,
        active: transactions.filter(t => t.status === 'Active' || t.status === 'Approved' || t.status === 'Fulfilled').length,
        completed: transactions.filter(t => t.status === 'Returned' || t.status === 'Rejected' || t.status === 'Cancelled').length,
    };

    const hasFilters = search || selectedType !== 'all' || selectedStatus !== 'all';

    return (
        <>
            <Head title="Transactions Logs" />

            <div className="flex flex-col space-y-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Transactions</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View complete activity history — requests, checkouts, returns, and more
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'from-slate-50 to-slate-100/50', iconBg: 'bg-slate-100', icon: FileText },
                        { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'from-amber-50 to-amber-100/50', iconBg: 'bg-amber-100', icon: Clock },
                        { label: 'Active', value: stats.active, color: 'text-emerald-700', bg: 'from-emerald-50 to-emerald-100/50', iconBg: 'bg-emerald-100', icon: CheckCircle2 },
                        { label: 'Completed', value: stats.completed, color: 'text-violet-700', bg: 'from-violet-50 to-violet-100/50', iconBg: 'bg-violet-100', icon: RotateCcw },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 bg-gradient-to-br ${s.bg} flex items-center gap-3`}>
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
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            className="pl-8 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[170px] h-9">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Borrow">Borrow</SelectItem>
                            <SelectItem value="Checkout">Checkout</SelectItem>
                            <SelectItem value="Software License">License</SelectItem>
                            <SelectItem value="Maintenance Request">Maintenance</SelectItem>
                            <SelectItem value="Purchase Request">Purchase</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" className="h-9" onClick={() => { setSearch(''); setSelectedType('all'); setSelectedStatus('all'); }}>
                            Clear
                        </Button>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                        {filtered.length} of {transactions.length} transactions
                    </span>
                </div>

                {/* Timeline */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="divide-y">
                        {filtered.map((item) => {
                            const statusCfg = getStatusConfig(item.status);
                            const StatusIcon = statusCfg.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setDetailItem(item)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`shrink-0 rounded-lg p-2.5 ${getTypeColor(item)}`}>
                                        {getTypeIcon(item)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-semibold text-sm text-foreground truncate">{item.title}</span>
                                            {item.meta?.priority === 'Urgent' && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {item.reference && (
                                                <span className="font-mono font-medium text-emerald-600">{item.reference}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(item.date)}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                {item.subtype}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <Badge variant="outline" className={`${statusCfg.color} ${statusCfg.border} ${statusCfg.bg} gap-1 shrink-0`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {item.status}
                                    </Badge>
                                </button>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground">
                                <Inbox className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                <p className="font-medium">No transactions found</p>
                                <p className="text-xs mt-1">Your requests and assignments will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className={`rounded-lg p-2 ${detailItem ? getTypeColor(detailItem) : ''}`}>
                                {detailItem && getTypeIcon(detailItem)}
                            </div>
                            Transaction Detail
                        </DialogTitle>
                    </DialogHeader>
                    {detailItem && (
                        <div className="space-y-4">
                            {/* Title & Status */}
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-semibold">{detailItem.title}</h3>
                                    {detailItem.reference && (
                                        <span className="text-xs font-mono text-emerald-600">{detailItem.reference}</span>
                                    )}
                                </div>
                                {(() => {
                                    const cfg = getStatusConfig(detailItem.status);
                                    const Icon = cfg.icon;
                                    return (
                                        <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} gap-1 text-sm px-3 py-1`}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {detailItem.status}
                                        </Badge>
                                    );
                                })()}
                            </div>

                            {/* Info Grid */}
                            <div className="rounded-lg border bg-muted/30 divide-y text-sm">
                                <div className="flex justify-between px-4 py-2.5">
                                    <span className="text-muted-foreground">Type</span>
                                    <Badge variant="secondary" className="text-xs">{detailItem.subtype}</Badge>
                                </div>
                                <div className="flex justify-between px-4 py-2.5">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="font-medium">{formatDateTime(detailItem.date)}</span>
                                </div>
                                {detailItem.meta?.asset_name && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Asset</span>
                                        <div className="text-right">
                                            <span className="font-medium">{detailItem.meta.asset_name}</span>
                                            {detailItem.meta.asset_id && (
                                                <span className="text-xs text-muted-foreground font-mono ml-1">({detailItem.meta.asset_id})</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {detailItem.meta?.category && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{detailItem.meta.category}</span>
                                    </div>
                                )}
                                {detailItem.meta?.priority && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Priority</span>
                                        <span className={`font-medium ${detailItem.meta.priority === 'Urgent' ? 'text-rose-600' : detailItem.meta.priority === 'High' ? 'text-amber-600' : ''}`}>
                                            {detailItem.meta.priority}
                                        </span>
                                    </div>
                                )}
                                {detailItem.meta?.site && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Site</span>
                                        <span className="font-medium">{detailItem.meta.site}</span>
                                    </div>
                                )}
                                {detailItem.meta?.required_from && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Duration</span>
                                        <span className="font-medium">
                                            {formatDate(detailItem.meta.required_from)} — {formatDate(detailItem.meta.required_until)}
                                        </span>
                                    </div>
                                )}
                                {detailItem.meta?.assigned_at && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Assigned At</span>
                                        <span className="font-medium">{formatDateTime(detailItem.meta.assigned_at)}</span>
                                    </div>
                                )}
                                {detailItem.meta?.approved_by && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Approved By</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {detailItem.meta.approved_by}
                                        </span>
                                    </div>
                                )}
                                {detailItem.meta?.approved_at && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Approved At</span>
                                        <span className="font-medium">{formatDateTime(detailItem.meta.approved_at)}</span>
                                    </div>
                                )}
                                {detailItem.meta?.fulfilled_at && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Fulfilled At</span>
                                        <span className="font-medium">{formatDateTime(detailItem.meta.fulfilled_at)}</span>
                                    </div>
                                )}
                                {(detailItem.meta?.returned_at) && (
                                    <div className="flex justify-between px-4 py-2.5">
                                        <span className="text-muted-foreground">Returned At</span>
                                        <span className="font-medium">{formatDateTime(detailItem.meta.returned_at)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Reason / Description */}
                            {detailItem.description && (
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</span>
                                    <p className="mt-1 text-sm bg-muted/30 rounded-lg p-3 leading-relaxed">
                                        {detailItem.description.replace(/\[License: .+?\]\s*/, '')}
                                    </p>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {detailItem.meta?.admin_notes && (
                                <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Notes</span>
                                    <p className="mt-1 text-sm bg-blue-50/50 border border-blue-100 rounded-lg p-3 leading-relaxed">
                                        {detailItem.meta.admin_notes}
                                    </p>
                                </div>
                            )}

                            {/* View full request link */}
                            {detailItem.type === 'request' && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => { setDetailItem(null); router.get(`/requests/${detailItem.id}`); }}
                                >
                                    <FileText className="h-4 w-4 mr-2" /> View Full Request
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

TransactionsIndex.layout = {
    breadcrumbs: [
        { title: 'Transactions', href: '/transactions' },
    ],
};
