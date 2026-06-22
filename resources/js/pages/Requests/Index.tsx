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
    Eye,
    Plus,
    Search,
    XCircle,
    Clock,
    CheckCircle2,
    Package,
    RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RequestsIndex({ requests = [] }: { requests: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            search === '' ||
            r.request_number?.toLowerCase().includes(search.toLowerCase()) ||
            r.asset?.product_name?.toLowerCase().includes(search.toLowerCase());
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="h-3.5 w-3.5 text-amber-500" />;
            case 'Approved': return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
            case 'Fulfilled': return <Package className="h-3.5 w-3.5 text-blue-500" />;
            case 'Returned': return <RotateCcw className="h-3.5 w-3.5 text-violet-500" />;
            case 'Rejected': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
            case 'Cancelled': return <XCircle className="h-3.5 w-3.5 text-slate-400" />;
            default: return null;
        }
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

    const handleCancel = (id: number) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        router.post(`/requests/${id}/cancel`, {}, { preserveScroll: true });
    };

    // Stats
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        fulfilled: requests.filter(r => r.status === 'Fulfilled').length,
    };

    return (
        <>
            <Head title="My Requests" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Requests</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Track and manage your asset & software requests
                        </p>
                    </div>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => router.get('/requests/create')}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/30' },
                        { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Fulfilled', value: stats.fulfilled, color: 'text-blue-600', bg: 'bg-blue-50' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</div>
                            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
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
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Asset / Category</th>
                                <th className="px-4 py-3 text-left">Duration</th>
                                <th className="px-4 py-3 text-left">Priority</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Submitted</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredRequests.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3.5">
                                        <span className="font-mono text-xs font-semibold text-emerald-600">{r.request_number}</span>
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
                                        ) : r.request_type === 'Software License' && r.reason?.match(/\[License: (.+?)\]/) ? (
                                            <div>
                                                <div className="font-medium">{r.reason.match(/\[License: (.+?)\]/)?.[1]}</div>
                                                <div className="text-xs text-muted-foreground">Software License</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                                        {r.required_from && r.required_until ? (
                                            <div>
                                                <div>{new Date(r.required_from).toLocaleDateString()}</div>
                                                <div>to {new Date(r.required_until).toLocaleDateString()}</div>
                                            </div>
                                        ) : r.required_from ? (
                                            <div>From {new Date(r.required_from).toLocaleDateString()}</div>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3.5">{getPriorityBadge(r.priority)}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            {getStatusIcon(r.status)}
                                            {getStatusBadge(r.status)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => router.get(`/requests/${r.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {r.status === 'Pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleCancel(r.id)}
                                                >
                                                    <XCircle className="h-4 w-4" />
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
                                            <Package className="h-8 w-8 text-muted-foreground/50" />
                                            <p>No requests found.</p>
                                            <Button variant="outline" size="sm" onClick={() => router.get('/requests/create')}>
                                                <Plus className="mr-1 h-3 w-3" /> Submit your first request
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

RequestsIndex.layout = {
    breadcrumbs: [
        { title: 'Requests', href: '/requests' },
    ],
};
