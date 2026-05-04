import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    User,
    Package,
    CheckCircle2,
    Clock,
    MapPin,
    LogIn,
    LogOut,
    RefreshCw,
    Search,
    Wifi,
    WifiOff,
    X,
    Loader2,
    History as HistoryIcon,
    FileText,
    Calendar,
    Hash,
    Tag,
    Building2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Assignment {
    id: number;
    asset_id: string;
    asset_db_id: number;
    product_name: string;
    category: string;
    site: string;
    user_name: string;
    user_email: string;
    assigned_at: string;
    duration: string;
    remarks: string | null;
}

interface HistoryRecord {
    id: number;
    asset_id: string;
    product_name: string;
    serial_number: string;
    brand: string;
    category: string;
    type: string;
    site: string;
    vendor: string;
    purchase_year: number | null;
    condition: string;
    user_name: string;
    user_email: string;
    assigned_at: string;
    returned_at: string;
    duration: string;
    remarks: string | null;
}

interface AvailableAsset {
    id: number;
    asset_id: string;
    product_name: string;
    category: string;
    site: string;
    status: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
}

interface Stats {
    total_assets: number;
    in_use: number;
    available: number;
    returned_today: number;
    total_history: number;
}

interface HistoryMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface Props {
    liveAssignments: Assignment[];
    availableAssets: AvailableAsset[];
    users: UserOption[];
    stats: Stats;
    history?: HistoryRecord[];
    historyMeta?: HistoryMeta;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
    if (!iso) return '—';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '—';
        const secs = Math.floor((Date.now() - date.getTime()) / 1000);
        if (secs < 60) return `${secs}s ago`;
        if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
        if (secs < 86400) return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ago`;
        return `${Math.floor(secs / 86400)}d ago`;
    } catch {
        return '—';
    }
}

function formatDate(iso: string): string {
    if (!iso) return '—';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '—';
    }
}

function initials(name: string): string {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
    'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
];
function avatarColor(name: string): string {
    if (!name) return 'bg-slate-400';
    let hash = 0;
    for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const POLL_INTERVAL_MS = 8000;

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiveTracking({
    liveAssignments = [],
    availableAssets: initialAssets = [],
    users = [],
    stats: initialStats = { total_assets: 0, in_use: 0, available: 0, returned_today: 0, total_history: 0 },
    history: initialHistory = [],
    historyMeta: initialHistoryMeta = { total: 0, per_page: 50, current_page: 1, last_page: 1 },
}: Props) {
    const [activeTab, setActiveTab]     = useState<'live' | 'history'>('live');
    const [assignments, setAssignments] = useState<Assignment[]>(liveAssignments);
    const [stats, setStats]             = useState<Stats>(initialStats);

    // Live search
    const [search, setSearch]           = useState('');
    const [online, setOnline]           = useState(true);
    const [lastPoll, setLastPoll]       = useState<Date>(new Date());
    const [polling, setPolling]         = useState(false);

    // History state
    const [historyData, setHistoryData] = useState<HistoryRecord[]>(Array.isArray(initialHistory) ? initialHistory : []);
    const [historyMeta, setHistoryMeta] = useState<HistoryMeta>(initialHistoryMeta);
    const [historySearch, setHistorySearch] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(null);

    // Checkout modal
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutAssetId, setCheckoutAssetId] = useState('');
    const [checkoutUserId, setCheckoutUserId]   = useState('');
    const [checkoutRemarks, setCheckoutRemarks] = useState('');
    const [submitting, setSubmitting]   = useState(false);

    // Checkin confirmation
    const [checkinTarget, setCheckinTarget] = useState<Assignment | null>(null);

    // ── Polling ────────────────────────────────────────────────────────────

    const poll = useCallback(async () => {
        setPolling(true);
        try {
            const res = await fetch('/api/live-tracking/poll', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();

            setAssignments(data.liveAssignments || []);
            setStats(prev => ({ ...prev, ...(data.stats || {}) }));
            setLastPoll(new Date());
            setOnline(true);
        } catch (err) {
            console.error("Polling failed", err);
            setOnline(false);
        } finally {
            setPolling(false);
        }
    }, []);

    useEffect(() => {
        const id = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [poll]);

    // ── History Fetching ──────────────────────────────────────────────────

    const fetchHistory = useCallback(async (page = 1, query = historySearch) => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/live-tracking/history?page=${page}&search=${query}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) throw new Error('History fetch failed');
            const data = await res.json();
            
            if (data && Array.isArray(data.data)) {
                setHistoryData(data.data);
                setHistoryMeta(data.meta || { total: 0, per_page: 50, current_page: 1, last_page: 1 });
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoadingHistory(false);
        }
    }, [historySearch]);

    useEffect(() => {
        if (activeTab === 'history') {
            const timer = setTimeout(() => fetchHistory(1), 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, historySearch, fetchHistory]);

    // ── Actions ────────────────────────────────────────────────────────────

    const handleCheckout = () => {
        if (!checkoutAssetId || !checkoutUserId) return;
        setSubmitting(true);
        router.post(
            '/live-tracking/checkout',
            { asset_id: checkoutAssetId, user_id: checkoutUserId, remarks: checkoutRemarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCheckoutOpen(false);
                    setCheckoutAssetId('');
                    setCheckoutUserId('');
                    setCheckoutRemarks('');
                    setSubmitting(false);
                    poll();
                },
                onError: () => setSubmitting(false),
            },
        );
    };

    const handleCheckin = (assignment: Assignment) => {
        router.patch(
            `/live-tracking/${assignment.id}/checkin`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCheckinTarget(null);
                    poll();
                    if (activeTab === 'history') fetchHistory(1);
                },
            },
        );
    };

    // ── Filter ─────────────────────────────────────────────────────────────

    const filtered = (assignments || []).filter(a =>
        search === '' ||
        (a.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.asset_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.site || '').toLowerCase().includes(search.toLowerCase()),
    );

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Tracking" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 relative">
                        <Activity className="h-6 w-6 text-primary" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-background" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Asset Tracking</h1>
                        <p className="text-sm text-muted-foreground">Trace or view asset being used by</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium ${
                        online ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {online ? 'Live' : 'Offline'}
                    </div>
                    <Button size="sm" variant="outline" onClick={poll} disabled={polling}>
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${polling ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setCheckoutOpen(true)}>
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Check Out
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-muted rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('live')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'live' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Live View
                    <Badge variant="secondary" className="ml-1 px-1.5 h-5">{stats?.in_use ?? 0}</Badge>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <HistoryIcon className="w-4 h-4" />
                    History Log
                    <Badge variant="secondary" className="ml-1 px-1.5 h-5">{stats?.total_history ?? 0}</Badge>
                </button>
            </div>

            {activeTab === 'live' ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Assets', value: stats.total_assets, icon: Package, color: 'text-slate-600' },
                            { label: 'In Use', value: stats.in_use, icon: User, color: 'text-blue-600' },
                            { label: 'Available', value: stats.available, icon: CheckCircle2, color: 'text-emerald-600' },
                            { label: 'Returned Today', value: stats.returned_today, icon: LogOut, color: 'text-amber-600' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <Card key={label} className="shadow-sm">
                                <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                                    <div className="p-2 bg-muted/50 rounded-lg"><Icon className={`h-5 w-5 ${color}`} /></div>
                                    <div>
                                        <p className="text-2xl font-bold">{value || 0}</p>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search live assignments…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <Card className="border-dashed py-16 flex flex-col items-center gap-3 text-muted-foreground">
                            <Activity className="h-12 w-12 opacity-20" />
                            <p className="text-lg font-medium">{search ? 'No results found' : 'No assets checked out'}</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map(a => (
                                <Card key={a.id} className="shadow-sm border border-border hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-full ${avatarColor(a.user_name)} flex items-center justify-center text-white text-xs font-bold`}>
                                                    {initials(a.user_name)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-tight">{a.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{a.user_email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-sm font-medium truncate">{a.product_name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded">{a.asset_id}</span>
                                                <span className="text-xs text-muted-foreground">{a.category}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{a.duration}</span>
                                            </div>
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCheckinTarget(a)}>
                                                Return
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search history…"
                            value={historySearch}
                            onChange={e => setHistorySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        {loadingHistory && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Assigned</TableHead>
                                    <TableHead>Returned</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No history found.</TableCell></TableRow>
                                ) : (
                                    historyData.map(record => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <p className="font-medium text-sm">{record.product_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{record.asset_id || '—'}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-sm">{record.user_name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{record.user_email || '—'}</p>
                                            </TableCell>
                                            <TableCell className="text-xs">{formatDate(record.assigned_at)}</TableCell>
                                            <TableCell className="text-xs">{formatDate(record.returned_at)}</TableCell>
                                            <TableCell><Badge variant="outline" className="font-normal">{record.duration || '—'}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedHistory(record)}><FileText className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Pagination */}
                    {historyMeta.last_page > 1 && (
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs text-muted-foreground">
                                Showing {(historyMeta.current_page - 1) * historyMeta.per_page + 1} to {Math.min(historyMeta.current_page * historyMeta.per_page, historyMeta.total)} of {historyMeta.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={historyMeta.current_page === 1 || loadingHistory}
                                    onClick={() => fetchHistory(historyMeta.current_page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={historyMeta.current_page === historyMeta.last_page || loadingHistory}
                                    onClick={() => fetchHistory(historyMeta.current_page + 1)}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Check Out Asset</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Asset</label>
                            <Select value={checkoutAssetId} onValueChange={setCheckoutAssetId}>
                                <SelectTrigger><SelectValue placeholder="Select Asset" /></SelectTrigger>
                                <SelectContent>
                                    {initialAssets.map(a => (
                                        <SelectItem key={a.id} value={String(a.id)}>{a.asset_id} - {a.product_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Assign To</label>
                            <Select value={checkoutUserId} onValueChange={setCheckoutUserId}>
                                <SelectTrigger><SelectValue placeholder="Assign To User" /></SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
                            <textarea
                                value={checkoutRemarks}
                                onChange={e => setCheckoutRemarks(e.target.value)}
                                placeholder="Optional purpose..."
                                className="w-full text-sm border rounded p-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                        <Button onClick={handleCheckout} disabled={!checkoutAssetId || !checkoutUserId || submitting}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirm Check Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!checkinTarget} onOpenChange={open => !open && setCheckinTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Return Asset</DialogTitle></DialogHeader>
                    <DialogDescription>Confirm return of <strong>{checkinTarget?.product_name}</strong> by <strong>{checkinTarget?.user_name}</strong>?</DialogDescription>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckinTarget(null)}>Cancel</Button>
                        <Button onClick={() => checkinTarget && handleCheckin(checkinTarget)}>Confirm Return</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedHistory} onOpenChange={open => !open && setSelectedHistory(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedHistory?.product_name}</DialogTitle>
                        <DialogDescription>Asset ID: {selectedHistory?.asset_id}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 text-sm">
                        <div className="col-span-2 pb-2 border-b">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">Asset Information</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Category / Type</p><p>{selectedHistory?.category} / {selectedHistory?.type}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Location</p><p>{selectedHistory?.site}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Serial Number</p><p>{selectedHistory?.serial_number}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Vendor</p><p>{selectedHistory?.vendor}</p></div>
                            </div>
                        </div>

                        <div className="col-span-2 pb-2 border-b">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">User Assignment</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Assigned To</p><p className="font-medium">{selectedHistory?.user_name}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p><p>{selectedHistory?.user_email}</p></div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">Timeline</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Checked Out</p><p>{selectedHistory && formatDate(selectedHistory.assigned_at)}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Returned</p><p>{selectedHistory && formatDate(selectedHistory.returned_at)}</p></div>
                                <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Total Duration</p><p className="font-medium text-emerald-600">{selectedHistory?.duration}</p></div>
                            </div>
                        </div>
                        
                        <div className="col-span-2 bg-muted/30 p-3 rounded-lg border border-dashed">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 flex items-center gap-1.5">
                                <FileText className="w-3 h-3" /> Remarks
                            </p>
                            <p className="text-xs italic text-foreground leading-relaxed">{selectedHistory?.remarks}</p>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={() => setSelectedHistory(null)} className="w-full sm:w-auto">Close Details</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

LiveTracking.layout = {
    breadcrumbs: [
        { title: 'Asset Management', href: '#' },
        { title: 'Asset Tracking', href: '/live-tracking' },
    ],
};
