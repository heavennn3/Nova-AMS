import { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowRightLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Plus,
    User,
    MapPin,
    ArrowRight,
    Search,
    MessageSquare,
    AlertCircle
} from 'lucide-react';

interface Asset {
    id: number;
    asset_id: string;
    product_name: string;
    site_id: number;
}

interface Site {
    id: number;
    name: string;
    code: string;
    region?: string;
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

    // 1. Setup Inertia Form for new transfer requests
    const { data, setData, post, processing, reset, errors } = useForm({
        asset_id: '',
        to_site_id: '',
        notes: '',
    });

    // 2. Filter assets that are available for transfer
    const [assetSearch, setAssetSearch] = useState('');
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => 
            (asset.product_name || '').toLowerCase().includes(assetSearch.toLowerCase()) ||
            (asset.asset_id || '').toLowerCase().includes(assetSearch.toLowerCase())
        );
    }, [assets, assetSearch]);

    // 3. Compute Transfer Workflow Counts
    const counts = useMemo(() => {
        return {
            pending: transfers.filter(t => t.status === 'pending').length,
            approved: transfers.filter(t => t.status === 'approved').length,
            completed: transfers.filter(t => t.status === 'completed').length,
            rejected: transfers.filter(t => t.status === 'rejected').length,
        };
    }, [transfers]);

    // 4. Filter Transfer Records
    const filteredTransfers = useMemo(() => {
        return transfers.filter(transfer => {
            const matchesSearch = 
                (transfer.asset_tag || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transfer.asset_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transfer.from_site || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transfer.to_site || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (transfer.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'ALL' || transfer.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [transfers, searchQuery, filterStatus]);

    // 5. Action handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/multi-site/transfers', {
            onSuccess: () => {
                reset();
                setAssetSearch('');
            }
        });
    };

    const handleUpdateStatus = (id: number, status: 'approved' | 'rejected' | 'completed') => {
        if (confirm(`Are you sure you want to mark this transfer workflow as ${status}?`)) {
            // Inertia patch call
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/multi-site/transfers/${id}/status`;

            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PATCH';
            form.appendChild(methodInput);

            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            // @ts-ignore
            tokenInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            form.appendChild(tokenInput);

            const statusInput = document.createElement('input');
            statusInput.type = 'hidden';
            statusInput.name = 'status';
            statusInput.value = status;
            form.appendChild(statusInput);

            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Inter-Site Asset Transfers" />

            {/* Header Block */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <ArrowRightLeft className="h-8 w-8 text-primary" />
                        Inter-Site Transfer Workflows
                    </h1>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Card className="bg-card/45 backdrop-blur-sm border-l-4 border-l-amber-500 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Approval</p>
                            <p className="text-2xl font-black mt-1">{counts.pending}</p>
                        </div>
                        <div className="bg-amber-500/10 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/45 backdrop-blur-sm border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">In Transit / Approved</p>
                            <p className="text-2xl font-black mt-1">{counts.approved}</p>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-full">
                            <Truck className="h-5 w-5 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/45 backdrop-blur-sm border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
                            <p className="text-2xl font-black mt-1">{counts.completed}</p>
                        </div>
                        <div className="bg-emerald-500/10 p-2 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/45 backdrop-blur-sm border-l-4 border-l-destructive shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejected</p>
                            <p className="text-2xl font-black mt-1">{counts.rejected}</p>
                        </div>
                        <div className="bg-destructive/10 p-2 rounded-full">
                            <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split Action Panels */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Initiate Form Panel */}
                <Card className="lg:col-span-1 border-border bg-card/45 backdrop-blur-sm shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" />
                            Initiate Transfer
                        </CardTitle>
                        <CardDescription>Request authorization to dispatch an asset to another site.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Asset Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Asset</label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search asset catalog..." 
                                            className="h-8.5 pl-8.5 text-xs"
                                            value={assetSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssetSearch(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="w-full text-xs font-semibold rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                        value={data.asset_id}
                                        onChange={(e) => setData('asset_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose Hardware Asset --</option>
                                        {filteredAssets.map(asset => {
                                            const currentSite = sites.find(s => s.id === asset.site_id);
                                            const siteLabel = currentSite ? ` [${currentSite.name}]` : ' [Global]';
                                            return (
                                                <option key={asset.id} value={asset.id}>
                                                    {asset.asset_id || `ID: ${asset.id}`} - {asset.product_name}{siteLabel}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                {errors.asset_id && <p className="text-[10px] text-destructive font-semibold">{errors.asset_id}</p>}
                            </div>

                            {/* Destination Site Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Destination Base</label>
                                <select
                                    className="w-full text-xs font-semibold rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-ring"
                                    value={data.to_site_id}
                                    onChange={(e) => setData('to_site_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Target Base --</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>
                                            {site.name} ({site.code})
                                        </option>
                                    ))}
                                </select>
                                {errors.to_site_id && <p className="text-[10px] text-destructive font-semibold">{errors.to_site_id}</p>}
                            </div>

                            {/* Notes / Justification */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Transfer Notes / Justification</label>
                                <Textarea
                                    placeholder="Enter reasoning, dispatch order details, carrier, or tracking tag..."
                                    className="text-xs min-h-[90px] bg-background/50 border-input"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && <p className="text-[10px] text-destructive font-semibold">{errors.notes}</p>}
                            </div>

                            {/* Submit */}
                            <Button 
                                type="submit" 
                                className="w-full text-xs font-bold h-9" 
                                disabled={processing || !data.asset_id || !data.to_site_id}
                            >
                                <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                                Initiate Workflow
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ledger Listing Panel */}
                <Card className="lg:col-span-2 border-border bg-card/45 backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                Active Workflow Ledger
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Real-time status updates for inter-site transfers.</p>
                        </div>

                        {/* Quick filter toolbar */}
                        <div className="flex items-center gap-2">
                            <select
                                className="text-xs font-bold rounded-lg border border-border bg-background px-2.5 py-1 outline-none text-foreground"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All States</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved / In Transit</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Search workflow input */}
                        <div className="p-4 border-b border-border/40 relative">
                            <Search className="absolute left-7 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search by asset tag, product name, route locations..." 
                                className="pl-9 h-8 text-xs max-w-md bg-background/50 border-input"
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="divide-y divide-border/60 overflow-y-auto max-h-[460px]">
                            {filteredTransfers.map(transfer => (
                                <div key={transfer.id} className="p-4 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-mono font-bold bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                                                {transfer.asset_tag}
                                            </span>
                                            <h4 className="text-sm font-extrabold text-foreground">{transfer.asset_name}</h4>
                                        </div>

                                        {/* Site Route */}
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                                            <span className="text-foreground">{transfer.from_site}</span>
                                            <ArrowRight className="h-3 w-3 text-zinc-400" />
                                            <span className="text-primary">{transfer.to_site}</span>
                                        </div>

                                        {/* Metadata Row */}
                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Req: <strong>{transfer.requested_by}</strong>
                                            </span>
                                            {transfer.approved_by !== 'N/A' && (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                    Auth: <strong>{transfer.approved_by}</strong>
                                                </span>
                                            )}
                                            <span>Requested: {transfer.created_at}</span>
                                        </div>

                                        {/* Notes */}
                                        {transfer.notes && (
                                            <div className="flex items-start gap-1 bg-muted/40 p-2 rounded text-[11px] border border-border/40 text-muted-foreground max-w-xl">
                                                <MessageSquare className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                                                <span className="italic">{transfer.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge & Actions */}
                                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
                                        {/* Custom Badge */}
                                        {transfer.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                <Clock className="h-3 w-3" /> Pending Approval
                                            </span>
                                        ) : transfer.status === 'approved' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                <Truck className="h-3 w-3" /> Approved / In Transit
                                            </span>
                                        ) : transfer.status === 'completed' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3 w-3" /> Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive dark:text-red-400">
                                                <XCircle className="h-3 w-3" /> Rejected
                                            </span>
                                        )}

                                        {/* Workflow Buttons */}
                                        {transfer.status === 'pending' && (
                                            <div className="flex gap-1.5">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-[10px] font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                                    onClick={() => handleUpdateStatus(transfer.id, 'approved')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-[10px] font-bold border-destructive/30 text-destructive hover:bg-destructive/5 dark:hover:bg-destructive/20"
                                                    onClick={() => handleUpdateStatus(transfer.id, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}

                                        {transfer.status === 'approved' && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] font-bold border-blue-500/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                                onClick={() => handleUpdateStatus(transfer.id, 'completed')}
                                            >
                                                Confirm Arrival
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filteredTransfers.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground space-y-2">
                                    <AlertCircle className="h-8 w-8 mx-auto text-zinc-400" />
                                    <h5 className="text-sm font-bold text-foreground">No Transfer Workflows Found</h5>
                                    <p className="text-xs">There are no transfer requests matching the current active criteria.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Transfers.layout = {
    breadcrumbs: [
        {
            title: 'Inter-Site Transfers',
            href: '#',
        },
    ],
};
