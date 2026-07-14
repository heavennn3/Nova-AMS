import { Head, Link, useForm } from '@inertiajs/react';
import {
    Plus,
    Search,
    Clock,
    Calendar,
    Package,
    AlertTriangle,
    Hourglass,
    RotateCcw,
    ImagePlus,
    X,
} from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    returned: 'bg-green-100 text-green-800 border-green-200',
    return_pending: 'bg-amber-100 text-amber-800 border-amber-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const conditionColors: Record<string, string> = {
    good: 'bg-green-100 text-green-800',
    semi_faulty: 'bg-yellow-100 text-yellow-800',
    faulty: 'bg-red-100 text-red-800',
};

function parseDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
}

function calcDaysRemaining(returnDate: string): { days: number; label: string; isOverdue: boolean } {
    if (!returnDate) return { days: 0, label: '—', isOverdue: false };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const ret = parseDate(returnDate);
    if (!ret) return { days: 0, label: '—', isOverdue: false };

    const diff = Math.round((ret.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { days: Math.abs(diff), label: `${Math.abs(diff)} day(s) overdue`, isOverdue: true };
    if (diff === 0) return { days: 0, label: 'Due today', isOverdue: false };
    return { days: diff, label: `${diff} day(s) remaining`, isOverdue: false };
}

export default function AssetLoanIndex({ loans = [] }: { loans: any[] }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [returnLoan, setReturnLoan] = useState<any | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const returnForm = useForm({ return_notes: '', proof_photo: null as File | null });

    const filtered = loans.filter((l) => {
        const q = search.toLowerCase();
        const matchesSearch = !q || l.asset_name?.toLowerCase().includes(q) || l.asset_id?.toLowerCase().includes(q) || l.loan_id?.toLowerCase().includes(q) || l.purpose?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (d: string) => {
        const date = parseDate(d);
        return date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    };

    const stats = useMemo(() => {
        const active = loans.filter((l) => l.status === 'approved');
        const overdue = active.filter((l) => calcDaysRemaining(l.expected_return_date).isOverdue);
        return {
            pending: loans.filter((l) => l.status === 'pending').length,
            approved: loans.filter((l) => l.status === 'approved').length,
            overdue: overdue.length,
            returned: loans.filter((l) => l.status === 'returned').length,
            return_pending: loans.filter((l) => l.status === 'return_pending').length,
        };
    }, [loans]);

    const openReturn = (loan: any) => {
        setReturnLoan(loan);
        setProofPreview(null);
        returnForm.setData('return_notes', '');
        returnForm.setData('proof_photo', null);
    };

    const submitReturn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!returnLoan) return;
        returnForm.post(`/asset-loans/${returnLoan.id}/return`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setReturnLoan(null);
                // Reload the page to get updated loan data with proof photo
                router.reload();
            },
        });
    };

    return (
        <>
            <Head title="Asset Loans" />

            <div className="flex flex-col space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Asset Loans</h1>
                        <p className="mt-1 text-sm text-muted-foreground">View loan status, return proof, and admin review state</p>
                    </div>
                    <Link href="/asset-loans/create"><Button><Plus className="mr-2 h-4 w-4" /> Asset Loan</Button></Link>
                </div>

                <div className="grid grid-cols-5 gap-4">
                    <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
                    <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Active Loans</p><p className="text-2xl font-bold text-blue-600">{stats.approved}</p></div>
                    <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Return Review</p><p className="text-2xl font-bold text-amber-600">{stats.return_pending}</p></div>
                    <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Overdue</p><p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{stats.overdue}{stats.overdue > 0 && <AlertTriangle className="ml-1 inline h-5 w-5 animate-pulse text-red-500" />}</p></div>
                    <div className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">Returned</p><p className="text-2xl font-bold text-green-600">{stats.returned}</p></div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-[280px]">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-[150px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="return_pending">Return Review</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
                                    <th className="p-3 text-left font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} className="p-12 text-center text-muted-foreground"><Package className="mx-auto mb-3 h-12 w-12 opacity-30" /><p>No loan requests found</p></td></tr>
                                ) : filtered.map((loan) => {
                                    const duration = calcDaysRemaining(loan.expected_return_date);
                                    const canReturn = loan.status === 'approved';
                                    return (
                                        <tr key={loan.id} className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${duration.isOverdue && canReturn ? 'bg-red-50/50' : ''}`}>
                                            <td className="p-3"><Link href={`/requests/${loan.id}?is_loan=true`} className="font-mono text-sm font-medium text-primary hover:underline">{loan.loan_id}</Link></td>
                                            <td className="p-3"><p className="font-medium">{loan.asset_name || '—'}</p></td>
                                            <td className="p-3"><p className="font-mono text-xs text-muted-foreground">{loan.asset_id || '—'}</p></td>
                                            <td className="p-3"><div className="flex items-center gap-1.5 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(loan.loan_date)}</div></td>
                                            <td className="p-3"><div className="flex items-center gap-1.5 text-sm"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(loan.expected_return_date)}</div></td>
                                            <td className="p-3">{canReturn ? <span className={`inline-flex items-center gap-1 text-xs font-semibold ${duration.isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>{duration.isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}{duration.label}</span> : <span className="text-xs text-muted-foreground">—</span>}</td>
                                            <td className="p-3"><span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${conditionColors[loan.condition_status] || 'bg-gray-100 text-gray-800'}`}>{loan.condition_status?.replace('_', ' ') || '—'}</span></td>
                                            <td className="p-3"><span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColors[loan.status] || 'bg-gray-100 text-gray-800'}`}>{loan.status}</span></td>
                                            <td className="p-3">
                                                {canReturn ? (
                                                    <Button type="button" size="sm" variant="outline" onClick={() => openReturn(loan)}>
                                                        <RotateCcw className="mr-2 h-4 w-4" /> Return
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={!!returnLoan} onOpenChange={(open) => !open && setReturnLoan(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Submit return for review</DialogTitle>
                        <DialogDescription>Upload a proof photo (required). Asset stays active until admin approves return.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitReturn} className="space-y-4">
                        <div className="space-y-2 rounded-lg border bg-muted/20 p-3 text-sm">
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Asset</span><span className="font-medium">{returnLoan?.asset_name || '—'}</span></div>
                            <div className="flex items-center justify-between"><span className="text-muted-foreground">Loan ID</span><span className="font-mono text-xs">{returnLoan?.loan_id}</span></div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="return-notes">Return notes</Label>
                            <Textarea id="return-notes" value={returnForm.data.return_notes} onChange={(e) => returnForm.setData('return_notes', e.target.value)} placeholder="Condition on return, damage notes, extra remarks..." className="min-h-28" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proof-photo">Proof photo <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"><ImagePlus className="h-5 w-5 text-muted-foreground" /></div>
                                <Input
                                    id="proof-photo"
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        returnForm.setData('proof_photo', file);
                                        setProofPreview(file ? URL.createObjectURL(file) : null);
                                    }}
                                />
                            </div>
                            {proofPreview && <img src={proofPreview} alt="Proof preview" className="max-h-48 rounded-lg border object-cover" />}
                            {!proofPreview && (
                                <p className="text-xs text-muted-foreground">Please upload a clear photo of the returned item for admin review.</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setReturnLoan(null)}><X className="mr-2 h-4 w-4" />Cancel</Button>
                            <Button type="submit" disabled={returnForm.processing}>{returnForm.processing ? 'Submitting...' : 'Submit return'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
