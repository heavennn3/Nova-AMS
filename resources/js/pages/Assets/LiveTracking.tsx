import { Head, router } from '@inertiajs/react';
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
    Filter,
    Check,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
} from '@/components/ui/table';

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
    if (!iso) {
        return '—';
    }

    try {
        const date = new Date(iso);

        if (isNaN(date.getTime())) {
            return '—';
        }

        const secs = Math.floor((Date.now() - date.getTime()) / 1000);

        if (secs < 60) {
            return `${secs}s ago`;
        }

        if (secs < 3600) {
            return `${Math.floor(secs / 60)}m ago`;
        }

        if (secs < 86400) {
            return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ago`;
        }

        return `${Math.floor(secs / 86400)}d ago`;
    } catch {
        return '—';
    }
}

function formatDate(iso: string): string {
    if (!iso) {
        return '—';
    }

    try {
        const date = new Date(iso);

        if (isNaN(date.getTime())) {
            return '—';
        }

        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}

function initials(name: string): string {
    if (!name) {
        return '??';
    }

    return name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const AVATAR_COLORS = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
];
function avatarColor(name: string): string {
    if (!name) {
        return 'bg-slate-400';
    }

    let hash = 0;

    for (const c of name) {
        hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    }

    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const POLL_INTERVAL_MS = 8000;

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiveTracking({
    liveAssignments = [],
    availableAssets: initialAssets = [],
    users = [],
    sites = [],
    stats: initialStats = {
        total_assets: 0,
        in_use: 0,
        available: 0,
        returned_today: 0,
        total_history: 0,
    },
    history: initialHistory = [],
    historyMeta: initialHistoryMeta = {
        total: 0,
        per_page: 50,
        current_page: 1,
        last_page: 1,
    },
}: Props) {
    const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
    const [assignments, setAssignments] =
        useState<Assignment[]>(liveAssignments);
    const [stats, setStats] = useState<Stats>(initialStats);

    // Live search & filtering
    const [search, setSearch] = useState('');
    const [activeSiteFilter, setActiveSiteFilter] = useState<string>('all');
    const [activeUserFilter, setActiveUserFilter] = useState<string>('all');
    const [activeStartDate, setActiveStartDate] = useState('');
    const [activeEndDate, setActiveEndDate] = useState('');
    const [online, setOnline] = useState(true);
    const [lastPoll, setLastPoll] = useState<Date>(new Date());
    const [polling, setPolling] = useState(false);

    // History state
    const [historyData, setHistoryData] = useState<HistoryRecord[]>(
        Array.isArray(initialHistory) ? initialHistory : [],
    );
    const [historyMeta, setHistoryMeta] =
        useState<HistoryMeta>(initialHistoryMeta);
    const [historySearch, setHistorySearch] = useState('');
    const [historyUserFilter, setHistoryUserFilter] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedHistory, setSelectedHistory] =
        useState<HistoryRecord | null>(null);

    // Checkout modal
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [selectedCheckoutSiteId, setSelectedCheckoutSiteId] =
        useState<string>('all');
    const [checkoutAssetId, setCheckoutAssetId] = useState('');
    const [checkoutUserId, setCheckoutUserId] = useState('');
    const [checkoutRemarks, setCheckoutRemarks] = useState('');
    const [assetSearch, setAssetSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [availableAssets, setAvailableAssets] =
        useState<AvailableAsset[]>(initialAssets);
    const [submitting, setSubmitting] = useState(false);

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

            if (!res.ok) {
                throw new Error('Network error');
            }

            const data = await res.json();

            setAssignments(data.liveAssignments || []);
            setStats((prev) => ({ ...prev, ...(data.stats || {}) }));

            if (data.availableAssets) {
                setAvailableAssets(data.availableAssets);
            }

            setLastPoll(new Date());
            setOnline(true);
        } catch (err) {
            console.error('Polling failed', err);
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

    const fetchHistory = useCallback(
        async (
            page = 1,
            query = historySearch,
            start = startDate,
            end = endDate,
            userId = historyUserFilter,
        ) => {
            setLoadingHistory(true);

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    search: query,
                    start_date: start,
                    end_date: end,
                });

                if (userId !== 'all') {
                    params.set('user_id', userId);
                }

                const res = await fetch(
                    `/api/live-tracking/history?${params.toString()}`,
                    {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    },
                );

                if (!res.ok) {
                    throw new Error('History fetch failed');
                }

                const data = await res.json();

                if (data && Array.isArray(data.data)) {
                    setHistoryData(data.data);
                    setHistoryMeta(
                        data.meta || {
                            total: 0,
                            per_page: 50,
                            current_page: 1,
                            last_page: 1,
                        },
                    );
                }
            } catch (err) {
                console.error('Failed to fetch history', err);
            } finally {
                setLoadingHistory(false);
            }
        },
        [historySearch, startDate, endDate, historyUserFilter],
    );

    useEffect(() => {
        if (activeTab === 'history') {
            const timer = setTimeout(() => fetchHistory(1), 300);

            return () => clearTimeout(timer);
        }
    }, [
        activeTab,
        historySearch,
        startDate,
        endDate,
        historyUserFilter,
        fetchHistory,
    ]);

    const handleExport = () => {
        const params = new URLSearchParams({
            search: historySearch,
            start_date: startDate,
            end_date: endDate,
        });

        if (historyUserFilter !== 'all') {
            params.set('user_id', historyUserFilter);
        }

        window.location.href = `/api/live-tracking/report?${params.toString()}`;
    };

    // ── Actions ────────────────────────────────────────────────────────────

    const handleCheckout = () => {
        if (!checkoutAssetId || !checkoutUserId) {
            return;
        }

        setSubmitting(true);
        router.post(
            '/asset-track/checkout',
            {
                asset_id: checkoutAssetId,
                user_id: checkoutUserId,
                remarks: checkoutRemarks,
            },
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
            `/asset-track/${assignment.id}/checkin`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCheckinTarget(null);
                    poll();

                    if (activeTab === 'history') {
                        fetchHistory(1);
                    }
                },
            },
        );
    };

    // ── Filter ─────────────────────────────────────────────────────────────

    const filtered = (assignments || []).filter((a) => {
        const matchesSearch =
            search === '' ||
            (a.product_name || '')
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (a.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (a.asset_id || '').toLowerCase().includes(search.toLowerCase());

        const matchesSite =
            activeSiteFilter === 'all' ||
            a.site ===
            sites.find((s) => String(s.id) === activeSiteFilter)?.name;

        const matchesUser =
            activeUserFilter === 'all' ||
            a.user_name ===
            users.find((u) => String(u.id) === activeUserFilter)?.name;

        const matchesDate =
            (!activeStartDate || a.assigned_at >= activeStartDate) &&
            (!activeEndDate || a.assigned_at <= activeEndDate + 'T23:59:59');

        return matchesSearch && matchesSite && matchesUser && matchesDate;
    });

    const liveActiveFilterCount =
        (activeSiteFilter !== 'all' ? 1 : 0) +
        (activeUserFilter !== 'all' ? 1 : 0) +
        (activeStartDate || activeEndDate ? 1 : 0);
    const historyActiveFilterCount =
        (historyUserFilter !== 'all' ? 1 : 0) + (startDate || endDate ? 1 : 0);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="w-full space-y-6 p-6">
            <Head title="Asset Tracking" />

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Asset Withdrawal
                        </h1>

                    </div>
                </div>
                <div className="flex items-center gap-2">


                </div>
            </div>

            {/* Tabs */}
            <div className="flex w-fit rounded-lg bg-muted p-1">
                <button
                    onClick={() => setActiveTab('live')}
                    className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'live'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Activity className="h-4 w-4" />
                    Active
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {stats?.in_use ?? 0}
                    </Badge>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'history'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <HistoryIcon className="h-4 w-4" />
                    History Log
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                        {stats?.total_history ?? 0}
                    </Badge>
                </button>
            </div>

            {activeTab === 'live' ? (
                <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[
                            {
                                label: 'Total Assets',
                                value: stats.total_assets,
                                icon: Package,
                                color: 'text-slate-600',
                            },
                            {
                                label: 'In Use',
                                value: stats.in_use,
                                icon: User,
                                color: 'text-blue-600',
                            },
                            {
                                label: 'Available',
                                value: stats.available,
                                icon: CheckCircle2,
                                color: 'text-emerald-600',
                            },
                            {
                                label: 'Returned Today',
                                value: stats.returned_today,
                                icon: LogOut,
                                color: 'text-amber-600',
                            },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <Card key={label} className="shadow-sm">
                                <CardContent className="flex items-center gap-3 px-4 pt-4 pb-3">
                                    <div className="rounded-lg bg-muted/50 p-2">
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {value || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {label}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative max-w-[300px] min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1.5 border-dashed"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filters
                                    {liveActiveFilterCount > 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {liveActiveFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[300px] p-0"
                                align="start"
                            >
                                <div className="border-b p-3">
                                    <p className="text-sm font-semibold">
                                        Filter Active Loans
                                    </p>
                                </div>
                                {/* Site */}
                                <div className="border-b p-3">
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Site
                                    </p>
                                    <div className="max-h-[140px] space-y-0.5 overflow-y-auto">
                                        <button
                                            onClick={() =>
                                                setActiveSiteFilter('all')
                                            }
                                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${activeSiteFilter === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All Sites</span>
                                            {activeSiteFilter === 'all' && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </button>
                                        {sites.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() =>
                                                    setActiveSiteFilter(
                                                        String(s.id),
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${activeSiteFilter === String(s.id) ? 'font-medium' : ''}`}
                                            >
                                                <span>{s.name}</span>
                                                {activeSiteFilter ===
                                                    String(s.id) && (
                                                        <Check className="h-3.5 w-3.5 text-primary" />
                                                    )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* User */}
                                <div className="border-b p-3">
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        User
                                    </p>
                                    <div className="max-h-[140px] space-y-0.5 overflow-y-auto">
                                        <button
                                            onClick={() =>
                                                setActiveUserFilter('all')
                                            }
                                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${activeUserFilter === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All Users</span>
                                            {activeUserFilter === 'all' && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </button>
                                        {users.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() =>
                                                    setActiveUserFilter(
                                                        String(u.id),
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${activeUserFilter === String(u.id) ? 'font-medium' : ''}`}
                                            >
                                                <span>{u.name}</span>
                                                {activeUserFilter ===
                                                    String(u.id) && (
                                                        <Check className="h-3.5 w-3.5 text-primary" />
                                                    )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Date Range */}
                                <div className="border-b p-3">
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Date Range
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={activeStartDate}
                                            onChange={(e) =>
                                                setActiveStartDate(
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            to
                                        </span>
                                        <input
                                            type="date"
                                            value={activeEndDate}
                                            onChange={(e) =>
                                                setActiveEndDate(e.target.value)
                                            }
                                            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                {liveActiveFilterCount > 0 && (
                                    <div className="p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-full text-xs"
                                            onClick={() => {
                                                setActiveSiteFilter('all');
                                                setActiveUserFilter('all');
                                                setActiveStartDate('');
                                                setActiveEndDate('');
                                            }}
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {/* Active filter badges */}
                        {activeSiteFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                                Site:{' '}
                                {
                                    sites.find(
                                        (s) =>
                                            String(s.id) === activeSiteFilter,
                                    )?.name
                                }
                                <button
                                    onClick={() => setActiveSiteFilter('all')}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {activeUserFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                User:{' '}
                                {
                                    users.find(
                                        (u) =>
                                            String(u.id) === activeUserFilter,
                                    )?.name
                                }
                                <button
                                    onClick={() => setActiveUserFilter('all')}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {(activeStartDate || activeEndDate) && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                Date: {activeStartDate || '...'} →{' '}
                                {activeEndDate || '...'}
                                <button
                                    onClick={() => {
                                        setActiveStartDate('');
                                        setActiveEndDate('');
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {liveActiveFilterCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {filtered.length} of {assignments.length}
                            </span>
                        )}
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead className="w-[100px]">
                                        Asset ID
                                    </TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>User / Email</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Assigned At</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <Activity className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                            <p>
                                                {search ||
                                                    activeSiteFilter !== 'all' ||
                                                    activeStartDate
                                                    ? 'No Matching Data Found'
                                                    : 'No Asset Currently Being Used'}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((a) => (
                                        <TableRow
                                            key={a.id}
                                            className="transition-colors hover:bg-muted/10"
                                        >
                                            <TableCell className="font-mono text-[11px] font-bold text-primary">
                                                {a.asset_id}
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {a.product_name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`h-6 w-6 rounded-full ${avatarColor(a.user_name)} flex items-center justify-center text-[10px] font-bold text-white`}
                                                    >
                                                        {initials(a.user_name)}
                                                    </div>
                                                    <div>
                                                        <p className="mb-1 text-xs leading-none font-semibold">
                                                            {a.user_name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {a.user_email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="border-emerald-200 bg-emerald-50/50 text-emerald-700"
                                                >
                                                    {a.site}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(a.assigned_at)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    <Clock className="h-3 w-3 text-amber-500" />
                                                    {a.duration}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                    onClick={() =>
                                                        setCheckinTarget(a)
                                                    }
                                                >
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
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative max-w-[300px] min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search asset, user..."
                                value={historySearch}
                                onChange={(e) =>
                                    setHistorySearch(e.target.value)
                                }
                                className="h-9 w-full rounded-lg border border-border bg-background py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-1.5 border-dashed"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    Filters
                                    {historyActiveFilterCount > 0 && (
                                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                            {historyActiveFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[300px] p-0"
                                align="start"
                            >
                                <div className="border-b p-3">
                                    <p className="text-sm font-semibold">
                                        Filter History
                                    </p>
                                </div>
                                {/* User */}
                                <div className="border-b p-3">
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        User
                                    </p>
                                    <div className="max-h-[160px] space-y-0.5 overflow-y-auto">
                                        <button
                                            onClick={() =>
                                                setHistoryUserFilter('all')
                                            }
                                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${historyUserFilter === 'all' ? 'font-medium' : ''}`}
                                        >
                                            <span>All Users</span>
                                            {historyUserFilter === 'all' && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </button>
                                        {users.map((u) => (
                                            <button
                                                key={u.id}
                                                onClick={() =>
                                                    setHistoryUserFilter(
                                                        String(u.id),
                                                    )
                                                }
                                                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${historyUserFilter === String(u.id) ? 'font-medium' : ''}`}
                                            >
                                                <span>{u.name}</span>
                                                {historyUserFilter ===
                                                    String(u.id) && (
                                                        <Check className="h-3.5 w-3.5 text-primary" />
                                                    )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Date Range */}
                                <div className="border-b p-3">
                                    <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Date Range
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            to
                                        </span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) =>
                                                setEndDate(e.target.value)
                                            }
                                            className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:ring-1 focus:ring-primary/30 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                {historyActiveFilterCount > 0 && (
                                    <div className="p-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-full text-xs"
                                            onClick={() => {
                                                setHistoryUserFilter('all');
                                                setStartDate('');
                                                setEndDate('');
                                            }}
                                        >
                                            Clear all filters
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                        {/* Active filter badges */}
                        {historyUserFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                User:{' '}
                                {
                                    users.find(
                                        (u) =>
                                            String(u.id) === historyUserFilter,
                                    )?.name
                                }
                                <button
                                    onClick={() => setHistoryUserFilter('all')}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {(startDate || endDate) && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                Date: {startDate || '...'} → {endDate || '...'}
                                <button
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <div className="ml-auto">
                            <Button
                                size="sm"
                                className="h-9 bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                                onClick={handleExport}
                            >
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
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
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historyData.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <p className="text-sm font-medium">
                                                    {record.product_name || '—'}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {record.asset_id || '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium">
                                                    {record.user_name ||
                                                        'Unknown'}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {record.user_email || '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-slate-100 font-normal text-slate-700"
                                                >
                                                    {record.site || '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-[11px] whitespace-nowrap text-muted-foreground">
                                                {formatDate(record.assigned_at)}
                                            </TableCell>
                                            <TableCell className="text-[11px] whitespace-nowrap text-muted-foreground">
                                                {formatDate(record.returned_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {record.duration || '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedHistory(
                                                            record,
                                                        )
                                                    }
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
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
                                Showing{' '}
                                {(historyMeta.current_page - 1) *
                                    historyMeta.per_page +
                                    1}{' '}
                                to{' '}
                                {Math.min(
                                    historyMeta.current_page *
                                    historyMeta.per_page,
                                    historyMeta.total,
                                )}{' '}
                                of {historyMeta.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        historyMeta.current_page === 1 ||
                                        loadingHistory
                                    }
                                    onClick={() =>
                                        fetchHistory(
                                            historyMeta.current_page - 1,
                                        )
                                    }
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />{' '}
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        historyMeta.current_page ===
                                        historyMeta.last_page ||
                                        loadingHistory
                                    }
                                    onClick={() =>
                                        fetchHistory(
                                            historyMeta.current_page + 1,
                                        )
                                    }
                                >
                                    Next{' '}
                                    <ChevronRight className="ml-1 h-4 w-4" />
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
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                1. Select Site
                            </label>
                            <Select
                                value={selectedCheckoutSiteId}
                                onValueChange={(val) => {
                                    setSelectedCheckoutSiteId(val);
                                    setCheckoutAssetId('');
                                    setCheckoutUserId('');
                                }}
                            >
                                <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Site" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Sites
                                    </SelectItem>
                                    {sites.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={String(s.id)}
                                        >
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div onMouseLeave={() => setShowAssetDropdown(false)}>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                2. Select Asset (Searchable)
                            </label>
                            <div className="relative">
                                <Search className="absolute top-3 left-3 z-10 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Type to search asset..."
                                    value={assetSearch}
                                    onFocus={() => setShowAssetDropdown(true)}
                                    onChange={(e) => {
                                        setAssetSearch(e.target.value);
                                        setShowAssetDropdown(true);
                                    }}
                                    className="mb-1 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                />
                                {showAssetDropdown && (
                                    <div className="absolute top-full right-0 left-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-lg border bg-background p-1 shadow-2xl">
                                        {availableAssets
                                            .filter(
                                                (a) =>
                                                    selectedCheckoutSiteId ===
                                                    'all' ||
                                                    a.site_id ===
                                                    Number(
                                                        selectedCheckoutSiteId,
                                                    ),
                                            )
                                            .filter(
                                                (a) =>
                                                    assetSearch === '' ||
                                                    a.product_name
                                                        .toLowerCase()
                                                        .includes(
                                                            assetSearch.toLowerCase(),
                                                        ) ||
                                                    a.asset_id
                                                        .toLowerCase()
                                                        .includes(
                                                            assetSearch.toLowerCase(),
                                                        ),
                                            )
                                            .map((a) => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCheckoutAssetId(
                                                            String(a.id),
                                                        );
                                                        setAssetSearch(
                                                            a.product_name +
                                                            ' (' +
                                                            a.asset_id +
                                                            ')',
                                                        );
                                                        setShowAssetDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${checkoutAssetId === String(a.id) ? 'bg-primary/10' : ''}`}
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {a.product_name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {a.asset_id} •{' '}
                                                            {a.site_name}
                                                        </p>
                                                    </div>
                                                    {checkoutAssetId ===
                                                        String(a.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        )}
                                                </button>
                                            ))}
                                        {availableAssets
                                            .filter(
                                                (a) =>
                                                    selectedCheckoutSiteId ===
                                                    'all' ||
                                                    a.site_id ===
                                                    Number(
                                                        selectedCheckoutSiteId,
                                                    ),
                                            )
                                            .filter(
                                                (a) =>
                                                    assetSearch === '' ||
                                                    a.product_name
                                                        .toLowerCase()
                                                        .includes(
                                                            assetSearch.toLowerCase(),
                                                        ) ||
                                                    a.asset_id
                                                        .toLowerCase()
                                                        .includes(
                                                            assetSearch.toLowerCase(),
                                                        ),
                                            ).length === 0 && (
                                                <div className="p-3 text-center text-xs text-muted-foreground">
                                                    No available assets match.
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                            {checkoutAssetId && !assetSearch.includes('(') && (
                                <p className="mt-1 text-[10px] font-medium text-emerald-600">
                                    ✓ Selected:{' '}
                                    {
                                        availableAssets.find(
                                            (a) =>
                                                String(a.id) ===
                                                checkoutAssetId,
                                        )?.product_name
                                    }
                                </p>
                            )}
                        </div>

                        <div onMouseLeave={() => setShowUserDropdown(false)}>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                3. Assign To User (Searchable)
                            </label>
                            <div className="relative">
                                <User className="absolute top-3 left-3 z-10 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Type to search user..."
                                    value={userSearch}
                                    onFocus={() => setShowUserDropdown(true)}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setShowUserDropdown(true);
                                    }}
                                    className="mb-1 w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                />
                                {showUserDropdown && (
                                    <div className="absolute top-full right-0 left-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-lg border bg-background p-1 shadow-2xl">
                                        {users
                                            .filter(
                                                (u) =>
                                                    selectedCheckoutSiteId ===
                                                    'all' ||
                                                    u.site_ids.includes(
                                                        Number(
                                                            selectedCheckoutSiteId,
                                                        ),
                                                    ),
                                            )
                                            .filter(
                                                (u) =>
                                                    userSearch === '' ||
                                                    u.name
                                                        .toLowerCase()
                                                        .includes(
                                                            userSearch.toLowerCase(),
                                                        ) ||
                                                    u.email
                                                        .toLowerCase()
                                                        .includes(
                                                            userSearch.toLowerCase(),
                                                        ),
                                            )
                                            .map((u) => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCheckoutUserId(
                                                            String(u.id),
                                                        );
                                                        setUserSearch(u.name);
                                                        setShowUserDropdown(
                                                            false,
                                                        );
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${checkoutUserId === String(u.id) ? 'bg-primary/10' : ''}`}
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {u.name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                    {checkoutUserId ===
                                                        String(u.id) && (
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                        )}
                                                </button>
                                            ))}
                                        {users
                                            .filter(
                                                (u) =>
                                                    selectedCheckoutSiteId ===
                                                    'all' ||
                                                    u.site_ids.includes(
                                                        Number(
                                                            selectedCheckoutSiteId,
                                                        ),
                                                    ),
                                            )
                                            .filter(
                                                (u) =>
                                                    userSearch === '' ||
                                                    u.name
                                                        .toLowerCase()
                                                        .includes(
                                                            userSearch.toLowerCase(),
                                                        ) ||
                                                    u.email
                                                        .toLowerCase()
                                                        .includes(
                                                            userSearch.toLowerCase(),
                                                        ),
                                            ).length === 0 && (
                                                <div className="p-3 text-center text-xs text-muted-foreground">
                                                    No users found.
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Remarks
                            </label>
                            <textarea
                                value={checkoutRemarks}
                                onChange={(e) =>
                                    setCheckoutRemarks(e.target.value)
                                }
                                placeholder="Optional purpose..."
                                className="h-20 w-full rounded border p-2 text-sm shadow-inner focus:ring-2 focus:ring-primary/30 focus:outline-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCheckoutOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            disabled={
                                !checkoutAssetId ||
                                !checkoutUserId ||
                                submitting
                            }
                        >
                            {submitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm Check Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!checkinTarget}
                onOpenChange={(open) => !open && setCheckinTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Asset</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Confirm return of{' '}
                        <strong>{checkinTarget?.product_name}</strong> by{' '}
                        <strong>{checkinTarget?.user_name}</strong>?
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCheckinTarget(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                checkinTarget && handleCheckin(checkinTarget)
                            }
                        >
                            Confirm Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!selectedHistory}
                onOpenChange={(open) => !open && setSelectedHistory(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedHistory?.product_name}
                        </DialogTitle>
                        <DialogDescription>
                            Asset ID: {selectedHistory?.asset_id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 text-sm">
                        <div className="col-span-2 border-b pb-2">
                            <p className="mb-1 text-[10px] font-bold tracking-wider text-primary uppercase">
                                Asset Information
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Category / Type
                                    </p>
                                    <p>
                                        {selectedHistory?.category} /{' '}
                                        {selectedHistory?.type}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Location
                                    </p>
                                    <p>{selectedHistory?.site}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Serial Number
                                    </p>
                                    <p>{selectedHistory?.serial_number}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Vendor
                                    </p>
                                    <p>{selectedHistory?.vendor}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 border-b pb-2">
                            <p className="mb-1 text-[10px] font-bold tracking-wider text-primary uppercase">
                                User Assignment
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Assigned To
                                    </p>
                                    <p className="font-medium">
                                        {selectedHistory?.user_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Email
                                    </p>
                                    <p>{selectedHistory?.user_email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <p className="mb-1 text-[10px] font-bold tracking-wider text-primary uppercase">
                                Timeline
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Checked Out
                                    </p>
                                    <p>
                                        {selectedHistory &&
                                            formatDate(
                                                selectedHistory.assigned_at,
                                            )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Returned
                                    </p>
                                    <p>
                                        {selectedHistory &&
                                            formatDate(
                                                selectedHistory.returned_at,
                                            )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                        Total Duration
                                    </p>
                                    <p className="font-medium text-emerald-600">
                                        {selectedHistory?.duration}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 rounded-lg border border-dashed bg-muted/30 p-3">
                            <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                <FileText className="h-3 w-3" /> Remarks
                            </p>
                            <p className="text-xs leading-relaxed text-foreground italic">
                                {selectedHistory?.remarks}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setSelectedHistory(null)}
                            className="w-full sm:w-auto"
                        >
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

LiveTracking.layout = {
    breadcrumbs: [
        { title: 'Asset Management', href: '#' },
        { title: 'Asset Tracking', href: '/asset-track' },
    ],
};
