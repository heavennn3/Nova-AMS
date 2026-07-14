import { Head, useForm, router } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
    MapPin,
    ArrowRight,
    Search,
    User,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Asset {
    id: number;
    asset_id: string;
    product_name: string;
    site_id: number;
    category: string;
    status: string;
}

interface Site {
    id: number;
    name: string;
    code: string;
}

interface Transfer {
    id: number;
    asset_id: number;
    asset_tag: string;
    asset_name: string;
    from_site: string;
    to_site: string;
    requested_by: string;
    approved_by: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    transfer_date: string | null;
    notes: string | null;
    created_at: string;
}

export default function Transfers({
    sites = [],
    assets = [],
    transfers = [],
}: {
    sites: Site[];
    assets: Asset[];
    transfers: Transfer[];
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [fromSiteId, setFromSiteId] = useState('all');
    const [assetCategory, setAssetCategory] = useState('all');
    const [assetStatus, setAssetStatus] = useState('available');
    const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        asset_ids: [] as number[],
        to_site_id: '',
        notes: '',
    });

    const [assetSearch, setAssetSearch] = useState('');
    const assetCategories = useMemo(() => [...new Set(assets.map(asset => asset.category).filter(Boolean))], [assets]);
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const q = assetSearch.toLowerCase();
            const matchesSearch = !q ||
                (asset.product_name || '').toLowerCase().includes(q) ||
                (asset.asset_id || '').toLowerCase().includes(q);
            const matchesSite = fromSiteId === 'all' || String(asset.site_id) === fromSiteId;
            const matchesCategory = assetCategory === 'all' || asset.category === assetCategory;
            const matchesStatus = assetStatus === 'all' || asset.status === assetStatus;

            return matchesSearch && matchesSite && matchesCategory && matchesStatus;
        });
    }, [assets, assetSearch, fromSiteId, assetCategory, assetStatus]);

    const counts = useMemo(() => ({
        pending: transfers.filter(t => t.status === 'pending').length,
        approved: transfers.filter(t => t.status === 'approved').length,
        completed: transfers.filter(t => t.status === 'completed').length,
        rejected: transfers.filter(t => t.status === 'rejected').length,
    }), [transfers]);

    const filteredTransfers = useMemo(() => {
        return transfers.filter(transfer => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                (transfer.asset_tag || '').toLowerCase().includes(q) ||
                (transfer.asset_name || '').toLowerCase().includes(q) ||
                (transfer.from_site || '').toLowerCase().includes(q) ||
                (transfer.to_site || '').toLowerCase().includes(q) ||
                (transfer.notes || '').toLowerCase().includes(q);

            const matchesStatus = filterStatus === 'ALL' || transfer.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [transfers, searchQuery, filterStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/multi-site/transfers', {
            asset_ids: selectedAssetIds,
            to_site_id: data.to_site_id,
            notes: data.notes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedAssetIds([]);
                setAssetSearch('');
                toast.success('Transfer requested');
            },
        });
    };

    const handleUpdateStatus = (id: number, status: 'approved' | 'rejected' | 'completed') => {
        const label = { approved: 'approve', rejected: 'reject', completed: 'complete' }[status];

        if (confirm(`Are you sure you want to ${label} this transfer?`)) {
            router.patch(`/multi-site/transfers/${id}/status`, { status }, {
                preserveScroll: true,
                onSuccess: () => toast.success(`Transfer ${label}d`),
            });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const badges: Record<string, { cls: string; icon: any; label: string }> = {
            pending: { cls: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
            approved: { cls: 'bg-blue-100 text-blue-700', icon: CheckCircle2, label: 'Approved' },
            completed: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Completed' },
            rejected: { cls: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
        };
        const b = badges[status] || badges.pending;
        const Icon = b.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${b.cls}`}>
                <Icon className="h-3 w-3" /> {b.label}
            </span>
        );
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Asset Transfer" />

            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <ArrowRightLeft className="h-7 w-7 text-primary" />
                    Asset Transfer
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded transition-all duration-200 hover:shadow-lg">
                    <h3 className="font-semibold text-amber-900">Pending</h3>
                    <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded transition-all duration-200 hover:shadow-lg">
                    <h3 className="font-semibold text-blue-900">Approved</h3>
                    <p className="text-2xl font-bold text-blue-600">{counts.approved}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded transition-all duration-200 hover:shadow-lg">
                    <h3 className="font-semibold text-emerald-900">Completed</h3>
                    <p className="text-2xl font-bold text-emerald-600">{counts.completed}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded transition-all duration-200 hover:shadow-lg">
                    <h3 className="font-semibold text-red-900">Rejected</h3>
                    <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Initiate Transfer Form */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Initiate Transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Source Site</label>
                                <select
                                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                    value={fromSiteId}
                                    onChange={(e) => {
                                        setFromSiteId(e.target.value);
                                        setSelectedAssetIds([]);
                                    }}
                                >
                                    <option value="all">All Sites</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name} ({site.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Category</label>
                                    <select
                                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                        value={assetCategory}
                                        onChange={(e) => setAssetCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {assetCategories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">Status</label>
                                    <select
                                        className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                        value={assetStatus}
                                        onChange={(e) => setAssetStatus(e.target.value)}
                                    >
                                        <option value="available">Available</option>
                                        <option value="all">All Status</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Select Asset ({selectedAssetIds.length})</label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search asset..."
                                            className="pl-8 h-8 text-xs"
                                            value={assetSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssetSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                                        {filteredAssets.length === 0 ? (
                                            <p className="py-6 text-center text-xs text-muted-foreground">No available assets found</p>
                                        ) : filteredAssets.map(asset => {
                                            const site = sites.find(s => s.id === asset.site_id);
                                            const checked = selectedAssetIds.includes(asset.id);

                                            return (
                                                <label key={asset.id} className="flex cursor-pointer items-start gap-2 rounded p-2 text-xs hover:bg-muted/50">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-0.5"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            setSelectedAssetIds(e.target.checked
                                                                ? [...selectedAssetIds, asset.id]
                                                                : selectedAssetIds.filter(id => id !== asset.id)
                                                            );
                                                        }}
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="block font-semibold">{asset.asset_id || `ID: ${asset.id}`} - {asset.product_name}</span>
                                                        <span className="block text-muted-foreground">{site?.name || 'No site'} • {asset.category} • {asset.status}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                                {errors.asset_ids && <p className="text-[10px] text-destructive">{errors.asset_ids}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Destination Site</label>
                                <select
                                    className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                    value={data.to_site_id}
                                    onChange={(e) => setData('to_site_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Site --</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>
                                            {site.name} ({site.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.to_site_id && <p className="text-[10px] text-destructive">{errors.to_site_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold">Notes</label>
                                <Textarea
                                    placeholder="Reason for transfer..."
                                    className="text-xs min-h-[80px]"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && <p className="text-[10px] text-destructive">{errors.notes}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-xs h-9"
                                disabled={processing || selectedAssetIds.length === 0 || !data.to_site_id}
                            >
                                <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                                {processing ? 'Submitting...' : 'Submit Transfer'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Transfer List */}
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b py-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Transfer Records
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-7 h-7 text-xs w-40"
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="text-xs rounded-md border border-input bg-background px-2 py-1 outline-none"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="completed">Completed</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredTransfers.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No transfers found
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredTransfers.map(transfer => (
                                    <div key={transfer.id} className="p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded">
                                                        {transfer.asset_tag}
                                                    </span>
                                                    <span className="text-sm font-semibold truncate">{transfer.asset_name}</span>
                                                    <StatusBadge status={transfer.status} />
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{transfer.from_site}</span>
                                                    <ArrowRight className="h-3 w-3" />
                                                    <span className="font-semibold text-foreground">{transfer.to_site}</span>
                                                </div>

                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {transfer.requested_by}
                                                    </span>
                                                    <span>{transfer.created_at}</span>
                                                </div>

                                                {transfer.notes && (
                                                    <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded max-w-lg">
                                                        {transfer.notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {transfer.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            className="h-7 text-[10px] font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleUpdateStatus(transfer.id, 'approved')}
                                                        >Approve</Button>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            className="h-7 text-[10px] font-semibold border-red-500/30 text-red-600 hover:bg-red-50"
                                                            onClick={() => handleUpdateStatus(transfer.id, 'rejected')}
                                                        >Reject</Button>
                                                    </>
                                                )}
                                                {transfer.status === 'approved' && (
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="h-7 text-[10px] font-semibold border-blue-500/30 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleUpdateStatus(transfer.id, 'completed')}
                                                    >Mark Complete</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Transfers.layout = {
    breadcrumbs: [
        { title: 'Asset Transfer', href: '#' },
    ],
};
