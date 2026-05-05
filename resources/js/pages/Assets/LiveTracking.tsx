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
    site_id: number;
    site_name: string;
    status: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
    site_ids: number[];
}

interface SiteOption {
    id: number;
    name: string;
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
    sites: SiteOption[];
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
    sites = [],
    stats: initialStats = { total_assets: 0, in_use: 0, available: 0, returned_today: 0, total_history: 0 },
    history: initialHistory = [],
    historyMeta: initialHistoryMeta = { total: 0, per_page: 50, current_page: 1, last_page: 1 },
}: Props) {
    const [activeTab, setActiveTab]     = useState<'live' | 'history'>('live');
    const [assignments, setAssignments] = useState<Assignment[]>(liveAssignments);
    const [stats, setStats]             = useState<Stats>(initialStats);

    // Live search & filtering
    const [search, setSearch]           = useState('');
    const [activeSiteFilter, setActiveSiteFilter] = useState<string>('all');
    const [activeStartDate, setActiveStartDate] = useState('');
    const [activeEndDate, setActiveEndDate] = useState('');
    const [online, setOnline]           = useState(true);
    const [lastPoll, setLastPoll]       = useState<Date>(new Date());
    const [polling, setPolling]         = useState(false);

    // History state
    const [historyData, setHistoryData] = useState<HistoryRecord[]>(Array.isArray(initialHistory) ? initialHistory : []);
    const [historyMeta, setHistoryMeta] = useState<HistoryMeta>(initialHistoryMeta);
    const [historySearch, setHistorySearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(null);

    // Checkout modal
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [selectedCheckoutSiteId, setSelectedCheckoutSiteId] = useState<string>('all');
    const [checkoutAssetId, setCheckoutAssetId] = useState('');
    const [checkoutUserId, setCheckoutUserId]   = useState('');
    const [checkoutRemarks, setCheckoutRemarks] = useState('');
    const [assetSearch, setAssetSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [availableAssets, setAvailableAssets] = useState<AvailableAsset[]>(initialAssets);
    const [submitting, setSubmitting]   = useState(false);

    useEffect(() => {
        if (!checkoutOpen) {
            setAssetSearch('');
            setUserSearch('');
            setCheckoutAssetId('');
            setCheckoutUserId('');
            setSelectedCheckoutSiteId('all');
        }
    }, [checkoutOpen]);

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
            if (data.availableAssets) setAvailableAssets(data.availableAssets);
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

    const fetchHistory = useCallback(async (page = 1, query = historySearch, start = startDate, end = endDate) => {
        setLoadingHistory(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                search: query,
                start_date: start,
                end_date: end
            });
            const res = await fetch(`/api/live-tracking/history?${params.toString()}`, {
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
    }, [historySearch, startDate, endDate]);

    useEffect(() => {
        if (activeTab === 'history') {
            const timer = setTimeout(() => fetchHistory(1), 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, historySearch, startDate, endDate, fetchHistory]);

    const handleExport = () => {
        const params = new URLSearchParams({
            search: historySearch,
            start_date: startDate,
            end_date: endDate
        });
        window.location.href = `/api/live-tracking/report?${params.toString()}`;
    };

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

    const filtered = (assignments || []).filter(a => {
        const matchesSearch = search === '' ||
            (a.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.asset_id || '').toLowerCase().includes(search.toLowerCase());
        
        const matchesSite = activeSiteFilter === 'all' || a.site === sites.find(s => String(s.id) === activeSiteFilter)?.name;
        
        const matchesDate = (!activeStartDate || a.assigned_at >= activeStartDate) && 
                            (!activeEndDate || a.assigned_at <= activeEndDate + 'T23:59:59');

        return matchesSearch && matchesSite && matchesDate;
    });

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <Head title="Asset Tracking" />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Asset Withdrawal</h1>
                        <p className="text-sm text-muted-foreground">Trace or view asset being used by</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  
                    <Button size="sm" variant="outline" onClick={poll} disabled={polling}>
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${polling ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={() => setCheckoutOpen(true)}>
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Withdraw Asset
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
                    Active 
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

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by Asset ID"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 h-10"
                            />
                        </div>
                        <Select value={activeSiteFilter} onValueChange={setActiveSiteFilter}>
                            <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="Filter Site" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sites</SelectItem>
                                {sites.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={activeStartDate}
                                onChange={e => setActiveStartDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 h-10"
                            />
                            <span className="text-muted-foreground text-xs">to</span>
                            <input
                                type="date"
                                value={activeEndDate}
                                onChange={e => setActiveEndDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 h-10"
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[100px]">Asset ID</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>User / Email</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Assigned At</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            <Activity className="h-8 w-8 mx-auto opacity-20 mb-2" />
                                            <p>{search || activeSiteFilter !== 'all' || activeStartDate ? 'No Matching Data Found' : 'No Asset Currently Being Used'}</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map(a => (
                                        <TableRow key={a.id} className="hover:bg-muted/10 transition-colors">
                                            <TableCell className="font-mono text-[11px] font-bold text-primary">{a.asset_id}</TableCell>
                                            <TableCell className="font-medium text-sm">{a.product_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full ${avatarColor(a.user_name)} flex items-center justify-center text-[10px] text-white font-bold`}>
                                                        {initials(a.user_name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold leading-none mb-1">{a.user_name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{a.user_email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200">{a.site}</Badge></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{formatDate(a.assigned_at)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    <Clock className="h-3 w-3 text-amber-500" />
                                                    {a.duration}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => setCheckinTarget(a)}>
                                                    Return
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search "
                                value={historySearch}
                                onChange={e => setHistorySearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 h-10"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-lg border border-border h-10">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="bg-transparent text-sm focus:outline-none w-[130px]"
                                />
                                <span className="text-muted-foreground text-xs mx-1">to</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="bg-transparent text-sm focus:outline-none w-[130px]"
                                />
                            </div>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4"
                                onClick={handleExport}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {loadingHistory && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Asset</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Site</TableHead>
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
                                                <p className="text-[10px] text-muted-foreground">{record.user_email || '—'}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">{record.site || '—'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(record.assigned_at)}</TableCell>
                                            <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(record.returned_at)}</TableCell>
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
                    <div className="space-y-6 py-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">1. Select Site</label>
                            <Select value={selectedCheckoutSiteId} onValueChange={(val) => {
                                setSelectedCheckoutSiteId(val);
                                setCheckoutAssetId('');
                                setCheckoutUserId('');
                            }}>
                                <SelectTrigger className="w-full h-11"><SelectValue placeholder="All Sites" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sites</SelectItem>
                                    {sites.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div onMouseLeave={() => setShowAssetDropdown(false)}>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">2. Select Asset (Searchable)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <input
                                    type="text"
                                    placeholder="Type to search asset..."
                                    value={assetSearch}
                                    onFocus={() => setShowAssetDropdown(true)}
                                    onChange={e => {
                                        setAssetSearch(e.target.value);
                                        setShowAssetDropdown(true);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 mb-1"
                                />
                                {showAssetDropdown && (
                                    <div className="absolute top-full left-0 right-0 z-[100] bg-background border rounded-lg shadow-2xl max-h-60 overflow-y-auto mt-1 p-1">
                                        {availableAssets
                                            .filter(a => (selectedCheckoutSiteId === 'all' || a.site_id === Number(selectedCheckoutSiteId)))
                                            .filter(a => assetSearch === '' || a.product_name.toLowerCase().includes(assetSearch.toLowerCase()) || a.asset_id.toLowerCase().includes(assetSearch.toLowerCase()))
                                            .map(a => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCheckoutAssetId(String(a.id));
                                                        setAssetSearch(a.product_name + ' (' + a.asset_id + ')');
                                                        setShowAssetDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex justify-between items-center ${checkoutAssetId === String(a.id) ? 'bg-primary/10' : ''}`}
                                                >
                                                    <div>
                                                        <p className="font-medium">{a.product_name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{a.asset_id} • {a.site_name}</p>
                                                    </div>
                                                    {checkoutAssetId === String(a.id) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                </button>
                                            ))
                                        }
                                        {availableAssets.filter(a => (selectedCheckoutSiteId === 'all' || a.site_id === Number(selectedCheckoutSiteId))).filter(a => assetSearch === '' || a.product_name.toLowerCase().includes(assetSearch.toLowerCase()) || a.asset_id.toLowerCase().includes(assetSearch.toLowerCase())).length === 0 && (
                                            <div className="p-3 text-center text-xs text-muted-foreground">No available assets match.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {checkoutAssetId && !assetSearch.includes('(') && (
                                <p className="text-[10px] text-emerald-600 font-medium mt-1">✓ Selected: {availableAssets.find(a => String(a.id) === checkoutAssetId)?.product_name}</p>
                            )}
                        </div>

                        <div onMouseLeave={() => setShowUserDropdown(false)}>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">3. Assign To User (Searchable)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <input
                                    type="text"
                                    placeholder="Type to search user..."
                                    value={userSearch}
                                    onFocus={() => setShowUserDropdown(true)}
                                    onChange={e => {
                                        setUserSearch(e.target.value);
                                        setShowUserDropdown(true);
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 mb-1"
                                />
                                {showUserDropdown && (
                                    <div className="absolute top-full left-0 right-0 z-[100] bg-background border rounded-lg shadow-2xl max-h-60 overflow-y-auto mt-1 p-1">
                                        {users
                                            .filter(u => (selectedCheckoutSiteId === 'all' || u.site_ids.includes(Number(selectedCheckoutSiteId))))
                                            .filter(u => userSearch === '' || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                            .map(u => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCheckoutUserId(String(u.id));
                                                        setUserSearch(u.name);
                                                        setShowUserDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex justify-between items-center ${checkoutUserId === String(u.id) ? 'bg-primary/10' : ''}`}
                                                >
                                                    <div>
                                                        <p className="font-medium">{u.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{u.email}</p>
                                                    </div>
                                                    {checkoutUserId === String(u.id) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                </button>
                                            ))
                                        }
                                        {users.filter(u => (selectedCheckoutSiteId === 'all' || u.site_ids.includes(Number(selectedCheckoutSiteId)))).filter(u => userSearch === '' || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                                            <div className="p-3 text-center text-xs text-muted-foreground">No users found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Remarks</label>
                            <textarea
                                value={checkoutRemarks}
                                onChange={e => setCheckoutRemarks(e.target.value)}
                                placeholder="Optional purpose..."
                                className="w-full text-sm border rounded p-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-inner"
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
