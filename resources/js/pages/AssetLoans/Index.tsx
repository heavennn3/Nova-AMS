import * as React from 'react';
import { useState } from 'react';
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
    CheckCircle2,
    XCircle,
    RotateCcw,
    Calendar,
    Package,
    ArrowLeft,
    Ban,
    Check,
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

export default function AssetLoanIndex({ loans = [] }: { loans: any[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = loans.filter((l) => {
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            l.asset?.product_name?.toLowerCase().includes(q) ||
            l.asset?.asset_id?.toLowerCase().includes(q) ||
            l.purpose?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (d: string) =>
        d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <>
            <Head title="Asset Loans" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Asset Loans</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your asset loan requests</p>
                    </div>
                    <Link href="/asset-loans/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Loan
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', value: loans.filter((l) => l.status === 'pending').length, color: 'text-yellow-600' },
                        { label: 'Approved', value: loans.filter((l) => l.status === 'approved').length, color: 'text-blue-600' },
                        { label: 'Active Loans', value: loans.filter((l) => l.status === 'approved').length, color: 'text-blue-600' },
                        { label: 'Returned', value: loans.filter((l) => l.status === 'returned').length, color: 'text-green-600' },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border bg-card p-4">
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
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

                {/* Table */}
                <div className="rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="p-3 text-left font-medium">Asset</th>
                                    <th className="p-3 text-left font-medium">Borrower</th>
                                    <th className="p-3 text-left font-medium">Loan Date</th>
                                    <th className="p-3 text-left font-medium">Expected Return</th>
                                    <th className="p-3 text-left font-medium">Condition</th>
                                    <th className="p-3 text-left font-medium">Status</th>
                                    <th className="p-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-muted-foreground">
                                            <Package className="mx-auto h-12 w-12 mb-3 opacity-30" />
                                            <p>No loan requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((loan) => (
                                        <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="p-3">
                                                <p className="font-medium">{loan.asset?.product_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{loan.asset?.asset_id || ''}</p>
                                            </td>
                                            <td className="p-3">{loan.user?.name || '—'}</td>
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
                                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[loan.condition_status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {loan.condition_status?.replace('_', ' ') || '—'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {loan.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    {loan.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-green-600"
                                                                onClick={() => router.post(`/asset-loans/${loan.id}/approve`, {}, { preserveScroll: true })}
                                                            >
                                                                <Check className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-red-600"
                                                                onClick={() => router.post(`/asset-loans/${loan.id}/reject`, {}, { preserveScroll: true })}
                                                            >
                                                                <Ban className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {loan.status === 'approved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-green-600"
                                                            onClick={() => router.post(`/asset-loans/${loan.id}/return`, {}, { preserveScroll: true })}
                                                        >
                                                            <RotateCcw className="h-3.5 w-3.5" /> Return
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
