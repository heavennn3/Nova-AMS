import * as React from 'react';
import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Clock,
    Calendar,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Hourglass,
} from 'lucide-react';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    returned: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const conditionColors: Record<string, string> = {
    good: 'bg-green-100 text-green-800',
    semi_faulty: 'bg-yellow-100 text-yellow-800',
    faulty: 'bg-red-100 text-red-800',
};

function calcDaysRemaining(returnDate: string): { days: number; label: string; isOverdue: boolean } {
    if (!returnDate) return { days: 0, label: '—', isOverdue: false };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const ret = new Date(returnDate);
    ret.setHours(0, 0, 0, 0);
    const diff = Math.round((ret.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { days: Math.abs(diff), label: `${Math.abs(diff)} day(s) overdue`, isOverdue: true };
    if (diff === 0) return { days: 0, label: 'Due today', isOverdue: false };
    return { days: diff, label: `${diff} day(s) remaining`, isOverdue: false };
}

export default function AssetLoanIndex({ loans = [] }: { loans: any[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = loans.filter((l) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            l.asset_name?.toLowerCase().includes(q) ||
            l.asset_id?.toLowerCase().includes(q) ||
            l.loan_id?.toLowerCase().includes(q) ||
            l.purpose?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (d: string) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const stats = useMemo(() => {
        const active = loans.filter((l) => l.status === 'approved');
        const overdue = active.filter((l) => l.expected_return_date && new Date(l.expected_return_date) < new Date());
        return {
            pending: loans.filter((l) => l.status === 'pending').length,
            approved: loans.filter((l) => l.status === 'approved').length,
            overdue: overdue.length,
            returned: loans.filter((l) => l.status === 'returned').length,
        };
    }, [loans]);

    return (
        <>
            <Head title="Asset Loans" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Asset Loans</h1>
                        <p className="text-sm text-muted-foreground mt-1">View your asset loan status and history</p>
                    </div>
                    <Link href="/asset-loans/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Asset Loan
                        </Button>
                    </Link>
                </div>

                {/* Stats with overdue count */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Active Loans</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Overdue</p>
                        <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {stats.overdue}
                            {stats.overdue > 0 && <AlertTriangle className="inline h-5 w-5 ml-1 animate-pulse text-red-500" />}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-sm text-muted-foreground">Returned</p>
                        <p className="text-2xl font-bold text-green-600">{stats.returned}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <div className="relative w-[280px]">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search loans..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-sm"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-[150px] text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table with duration tracking */}
                <div className="rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left font-medium">Loan ID</th>
                                    <th className="p-3 text-left font-medium">Asset</th>
                                    <th className="p-3 text-left font-medium">Asset ID</th>
                                    <th className="p-3 text-left font-medium">Loan Date</th>
                                    <th className="p-3 text-left font-medium">Expected Return</th>
                                    <th className="p-3 text-left font-medium">Duration</th>
                                    <th className="p-3 text-left font-medium">Condition</th>
                                    <th className="p-3 text-left font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-muted-foreground">
                                            <Package className="mx-auto h-12 w-12 mb-3 opacity-30" />
                                            <p>No loan requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((loan) => {
                                        const duration = calcDaysRemaining(loan.expected_return_date);
                                        const isActiveApproved = loan.status === 'approved';
                                        return (
                                            <tr
                                                key={loan.id}
                                                className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                                                    duration.isOverdue && isActiveApproved ? 'bg-red-50/50' : ''
                                                }`}
                                            >
                                                <td className="p-3">
                                                    <Link href={`/requests/${loan.id}?is_loan=true`} className="text-primary hover:underline font-mono text-sm font-medium">
                                                        {loan.loan_id}
                                                    </Link>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium">{loan.asset_name || '—'}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="text-xs text-muted-foreground font-mono">{loan.asset_id || '—'}</p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {formatDate(loan.loan_date)}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {formatDate(loan.expected_return_date)}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {isActiveApproved ? (
                                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                                            duration.isOverdue ? 'text-red-600' : 'text-emerald-600'
                                                        }`}>
                                                            {duration.isOverdue ? (
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <Hourglass className="h-3.5 w-3.5" />
                                                            )}
                                                            {duration.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[loan.condition_status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {loan.condition_status?.replace('_', ' ') || '—'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-800'}`}>
                                                        {loan.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
