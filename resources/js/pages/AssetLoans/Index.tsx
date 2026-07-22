import { Head, Link, router, useForm } from '@inertiajs/react';
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
    XCircle,
    CheckCircle2,
    BellRing,
    HandCoins,
} from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const getLoanStatusConfig = (status: string) => {
    const normalized = status?.toLowerCase();
    const config: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
        pending: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', icon: Clock, label: 'Pending' },
        approved: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2, label: 'Approved' },
        returned: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', icon: RotateCcw, label: 'Returned' },
        rejected: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: XCircle, label: 'Rejected' },
        cancelled: { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: XCircle, label: 'Cancelled' },
        return_pending: { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', icon: BellRing, label: 'Return_pending' },
    };

    return config[normalized] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Clock, label: status || '—' };
};

const getConditionConfig = (condition: string) => {
    const normalized = condition?.toLowerCase();
    const config: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
        good: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2, label: 'good' },
        semi_faulty: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', icon: AlertTriangle, label: 'semi faulty' },
        faulty: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: AlertTriangle, label: 'faulty' },
    };

    return config[normalized] || { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30', icon: Clock, label: condition?.replace('_', ' ') || '—' };
};

const getLoanBadge = (cfg: { color: string; bg: string; border: string; icon: any; label: string }) => {
    const Icon = cfg.icon;

    return (
        <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} gap-1`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </Badge>
    );
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
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">My Asset Loans</h1>
                        <p className="text-sm text-muted-foreground">View loan status, return proof, and admin review state</p>
                    </div>
                    <Link href="/asset-loans/create">
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                        >
                            <Plus className="h-4 w-4" />
                            Asset Loan
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="rounded-lg bg-amber-500/10 p-2.5">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold leading-none text-foreground">{stats.pending}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="rounded-lg bg-blue-500/10 p-2.5">
                            <HandCoins className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">Active Loans</p>
                            <p className="text-2xl font-bold leading-none text-foreground">{stats.approved}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="rounded-lg bg-orange-500/10 p-2.5">
                            <BellRing className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">Return Review</p>
                            <p className="text-2xl font-bold leading-none text-foreground">{stats.return_pending}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className={`rounded-lg p-2.5 ${stats.overdue > 0 ? 'bg-red-500/20' : 'bg-slate-500/10'}`}>
                            <AlertTriangle className={`h-5 w-5 ${stats.overdue > 0 ? 'animate-pulse text-red-600' : 'text-slate-600'}`} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">Overdue</p>
                            <p className={`text-2xl font-bold leading-none ${stats.overdue > 0 ? 'text-red-600' : 'text-foreground'}`}>{stats.overdue}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="rounded-lg bg-violet-500/10 p-2.5">
                            <RotateCcw className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none text-muted-foreground">Returned</p>
                            <p className="text-2xl font-bold leading-none text-foreground">{stats.returned}</p>
                        </div>
                    </div>
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

                <div className="rounded-lg border border-border/50 bg-card shadow-sm">
                    <Table className="table-auto text-xs [&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[48px] text-center">No.</TableHead>
                                <TableHead className="w-[110px]">Loan ID</TableHead>
                                <TableHead className="w-[140px]">Asset</TableHead>
                                <TableHead className="w-[105px]">Asset ID</TableHead>
                                <TableHead className="w-[120px]">Loan Date</TableHead>
                                <TableHead className="w-[135px]">Expected Return</TableHead>
                                <TableHead className="w-[155px]">Duration</TableHead>
                                <TableHead className="w-[105px]">Condition</TableHead>
                                <TableHead className="w-[110px]">Status</TableHead>
                                <TableHead className="w-[70px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Package className="h-8 w-8 opacity-20" />
                                            <p>No loan requests found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filtered.map((loan, index) => {
                                const duration = calcDaysRemaining(loan.expected_return_date);
                                const canReturn = loan.status === 'approved';
                                return (
                                    <TableRow key={loan.id} className={duration.isOverdue && canReturn ? 'bg-red-50/60 dark:bg-red-950/15' : ''}>
                                        <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell><Link href={`/requests/${loan.id}?is_loan=true`} className="font-mono text-sm font-medium text-primary hover:underline">{loan.loan_id}</Link></TableCell>
                                        <TableCell><p className="font-medium text-foreground">{loan.asset_name || '—'}</p></TableCell>
                                        <TableCell><p className="font-mono text-xs text-muted-foreground">{loan.asset_id || '—'}</p></TableCell>
                                        <TableCell><div className="flex items-center gap-1.5 text-sm text-foreground"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(loan.loan_date)}</div></TableCell>
                                        <TableCell><div className="flex items-center gap-1.5 text-sm text-foreground"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{formatDate(loan.expected_return_date)}</div></TableCell>
                                        <TableCell>
                                            {canReturn ? getLoanBadge(duration.isOverdue
                                                ? { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: AlertTriangle, label: duration.label }
                                                : { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: Hourglass, label: duration.label }) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getLoanBadge(getConditionConfig(loan.condition_status))}</TableCell>
                                        <TableCell>{getLoanBadge(getLoanStatusConfig(loan.status))}</TableCell>
                                        <TableCell>
                                            <div className="mx-auto flex min-h-8 w-[36px] items-center justify-center gap-1.5">
                                                {canReturn ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => openReturn(loan)}
                                                                aria-label="Return asset"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Return</TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
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
