import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Search,
    Building2,
    MapPin,
    Users,
    Package,
    Wrench,
    Globe,
    Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface SiteData {
    id: number;
    name: string;
    code: string;
    region_id: number | null;
    users_count: number;
    assets_count: number;
    spare_parts_count: number;
    is_active: boolean;
}

interface RegionData {
    id: number;
    name: string;
    sites: SiteData[];
    sites_count: number;
    users_count: number;
    assets_count: number;
}

interface Stats {
    total_sites: number;
    active_sites: number;
    disabled_sites: number;
    total_users: number;
    total_assets: number;
    total_spare_parts: number;
}

export default function Dashboards({
    regions: initialRegions,
    stats,
}: {
    regions: RegionData[];
    stats: Stats;
}) {
    const [regions, setRegions] = useState<RegionData[]>(initialRegions);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [processing, setProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Region modals
    const [regionModal, setRegionModal] = useState<{
        mode: 'create' | 'edit';
        open: boolean;
        region: RegionData | null;
    }>({ mode: 'create', open: false, region: null });
    const [regionForm, setRegionForm] = useState({ name: '' });
    const [deleteRegion, setDeleteRegion] = useState<RegionData | null>(null);

    // Site modals
    const [siteModal, setSiteModal] = useState<{
        mode: 'create' | 'edit';
        open: boolean;
        regionId: number | null;
        site: SiteData | null;
    }>({ mode: 'create', open: false, regionId: null, site: null });
    const [siteForm, setSiteForm] = useState({
        name: '',
        code: '',
        region_id: '' as string,
    });
    const [deleteSite, setDeleteSite] = useState<SiteData | null>(null);

    useEffect(() => {
        setMounted(true);
        // expand first region by default
        if (initialRegions.length > 0) {
            setExpanded(new Set([initialRegions[0].id]));
        }
    }, [initialRegions]);

    // ── Region CRUD ────────────────────────────────────────────────

    const openCreateRegion = () => {
        setRegionForm({ name: '' });
        setRegionModal({ mode: 'create', open: true, region: null });
    };

    const openEditRegion = (r: RegionData) => {
        setRegionForm({ name: r.name });
        setRegionModal({ mode: 'edit', open: true, region: r });
    };

    const submitRegion = async () => {
        if (!regionForm.name.trim()) return;
        setProcessing(true);
        try {
            if (regionModal.mode === 'create') {
                const res = await fetch('/api/regions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
                    body: JSON.stringify(regionForm),
                });
                if (!res.ok) throw new Error((await res.json()).message ?? 'Failed');
                toast.success('Region created');
            } else if (regionModal.mode === 'edit' && regionModal.region) {
                const res = await fetch(`/api/regions/${regionModal.region.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
                    body: JSON.stringify(regionForm),
                });
                if (!res.ok) throw new Error((await res.json()).message ?? 'Failed');
                toast.success('Region updated');
            }
            setRegionModal({ ...regionModal, open: false });
            refreshRegions();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const confirmDeleteRegion = async () => {
        if (!deleteRegion) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/regions/${deleteRegion.id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
            });
            if (!res.ok) throw new Error((await res.json()).message ?? 'Cannot delete');
            toast.success('Region deleted');
            setDeleteRegion(null);
            refreshRegions();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    // ── Site CRUD ──────────────────────────────────────────────────

    const openCreateSite = (regionId: number) => {
        setSiteForm({ name: '', code: '', region_id: String(regionId) });
        setSiteModal({ mode: 'create', open: true, regionId, site: null });
    };

    const openEditSite = (site: SiteData) => {
        setSiteForm({
            name: site.name,
            code: site.code,
            region_id: String(site.region_id ?? ''),
        });
        setSiteModal({ mode: 'edit', open: true, regionId: site.region_id, site });
    };

    const submitSite = async () => {
        if (!siteForm.name.trim()) return;
        setProcessing(true);
        try {
            if (siteModal.mode === 'create') {
                const res = await fetch('/api/sites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
                    body: JSON.stringify({ ...siteForm, region_id: siteForm.region_id ? Number(siteForm.region_id) : null }),
                });
                if (!res.ok) throw new Error((await res.json()).message ?? 'Failed');
                toast.success('Site created');
            } else if (siteModal.mode === 'edit' && siteModal.site) {
                const res = await fetch(`/api/sites/${siteModal.site.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
                    body: JSON.stringify({ ...siteForm, region_id: siteForm.region_id ? Number(siteForm.region_id) : null }),
                });
                if (!res.ok) throw new Error((await res.json()).message ?? 'Failed');
                toast.success('Site updated');
            }
            setSiteModal({ ...siteModal, open: false });
            refreshRegions();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const confirmDeleteSite = async () => {
        if (!deleteSite) return;
        setProcessing(true);
        try {
            const res = await fetch(`/api/sites/${deleteSite.id}`, {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
            });
            if (!res.ok) throw new Error((await res.json()).message ?? 'Cannot delete');
            toast.success('Site deleted');
            setDeleteSite(null);
            refreshRegions();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const toggleSiteActive = async (site: SiteData) => {
        const res = await fetch(`/api/sites/${site.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ?? '' },
            body: JSON.stringify({ name: site.name, code: site.code, region_id: site.region_id, is_active: !site.is_active }),
        });
        if (res.ok) {
            toast.success(site.is_active ? 'Site disabled' : 'Site activated');
            refreshRegions();
        } else {
            toast.error('Failed to toggle status');
        }
    };

    const refreshRegions = async () => {
        try {
            const res = await fetch('/api/regions');
            if (res.ok) {
                const data = await res.json();
                // data includes nested sites
                setRegions(data);
            }
        } catch { /* ignore */ }
    };

    // ── Filter ─────────────────────────────────────────────────────

    const filteredRegions = regions
        .map((r) => ({
            ...r,
            sites: r.sites.filter(
                (s) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.code.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((r) => r.sites.length > 0 || r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleExpand = (id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    if (!mounted) return null;

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Site Management" />

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
                    <p className="mt-1 text-muted-foreground">
                        Region tree — manage sites grouped by region
                    </p>
                </div>
                <Button onClick={openCreateRegion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Region
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sites</p>
                        <p className="text-2xl font-bold">{stats.total_sites}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <Layers className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active Sites</p>
                        <p className="text-2xl font-bold">{stats.active_sites}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <Globe className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Regions</p>
                        <p className="text-2xl font-bold">{regions.length}</p>
                    </div>
                </div>
            </div>

            {/* Tree View */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Regions & Sites
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search sites..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredRegions.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                            <Globe className="h-10 w-10" />
                            <p className="text-lg font-medium">No regions found</p>
                            <p className="text-sm">Create a region to get started</p>
                            <Button variant="outline" onClick={openCreateRegion} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Region
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRegions.map((region) => (
                                <Collapsible
                                    key={region.id}
                                    open={expanded.has(region.id)}
                                    onOpenChange={() => toggleExpand(region.id)}
                                >
                                    <div
                                        className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                            expanded.has(region.id)
                                                ? 'bg-muted/50 shadow-sm'
                                                : 'hover:bg-muted/30'
                                        }`}
                                    >
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                {expanded.has(region.id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </CollapsibleTrigger>

                                        <Globe className="h-5 w-5 text-primary shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold truncate">
                                                    {region.name}
                                                </span>
                                                <Badge variant="secondary" className="shrink-0 text-xs">
                                                    {region.sites_count} sites
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                                                <span>{region.users_count} users</span>
                                                <span>{region.assets_count} assets</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditRegion(region);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setDeleteRegion(region);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-destructive"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openCreateSite(region.id);
                                            }}
                                        >
                                            <Plus className="mr-1 h-3.5 w-3.5" />
                                            Site
                                        </Button>
                                    </div>

                                    <CollapsibleContent>
                                        <div className="ml-8 mt-2 space-y-1.5">
                                            {region.sites.length === 0 ? (
                                                <p className="py-3 text-center text-sm text-muted-foreground">
                                                    No sites in this region yet
                                                </p>
                                            ) : (
                                                region.sites.map((site) => (
                                                    <div
                                                        key={site.id}
                                                        className="group flex items-center gap-3 rounded-md border border-dashed px-4 py-2.5 transition-colors hover:bg-muted/30"
                                                    >
                                                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm truncate">
                                                                    {site.name}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="font-mono text-xs"
                                                                >
                                                                    {site.code}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-3 w-3" />
                                                                    {site.users_count}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Package className="h-3 w-3 text-emerald-500" />
                                                                    {site.assets_count}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Wrench className="h-3 w-3 text-amber-500" />
                                                                    {site.spare_parts_count}
                                                                </span>
                                                                <Badge
                                                                    variant={site.is_active ? 'default' : 'secondary'}
                                                                    className={
                                                                        site.is_active
                                                                            ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                                                            : 'bg-red-500/10 text-red-600'
                                                                    }
                                                                >
                                                                    {site.is_active ? 'Active' : 'Disabled'}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => openEditSite(site)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Site
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => toggleSiteActive(site)}>
                                                                    {site.is_active
                                                                        ? 'Disable Site'
                                                                        : 'Activate Site'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => setDeleteSite(site)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Region Create/Edit Modal ──────────────────────────────── */}
            <Dialog
                open={regionModal.open}
                onOpenChange={(o) => !o && setRegionModal({ ...regionModal, open: false })}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {regionModal.mode === 'create' ? 'Add Region' : 'Edit Region'}
                        </DialogTitle>
                        <DialogDescription>
                            {regionModal.mode === 'create' ? 'Add a new region (e.g. Sabah, Sarawak)' : 'Update region name'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="region-name">Region Name</Label>
                            <Input
                                id="region-name"
                                value={regionForm.name}
                                onChange={(e) => setRegionForm({ name: e.target.value })}
                                placeholder="e.g. Sabah"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRegionModal({ ...regionModal, open: false })}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitRegion} disabled={processing || !regionForm.name.trim()}>
                            {processing
                                ? 'Saving...'
                                : regionModal.mode === 'create'
                                  ? 'Create'
                                  : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Region Delete Confirmation ───────────────────────────── */}
            <AlertDialog open={!!deleteRegion} onOpenChange={(o) => !o && setDeleteRegion(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Region?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{deleteRegion?.name}".
                            {deleteRegion && deleteRegion.sites_count > 0 &&
                                ` It has ${deleteRegion.sites_count} site(s) — delete all sites first.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteRegion}
                            disabled={processing || (deleteRegion?.sites_count ?? 0) > 0}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {processing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Site Create/Edit Modal ────────────────────────────────── */}
            <Dialog
                open={siteModal.open}
                onOpenChange={(o) => !o && setSiteModal({ ...siteModal, open: false })}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {siteModal.mode === 'create' ? 'Add Site' : 'Edit Site'}
                        </DialogTitle>
                        <DialogDescription>
                            {siteModal.mode === 'create' ? 'Add a new site under this region' : 'Update site information'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="site-name">Site Name *</Label>
                            <Input
                                id="site-name"
                                value={siteForm.name}
                                onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                                placeholder="e.g. Kota Kinabalu HQ"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site-code">Site Code</Label>
                            <Input
                                id="site-code"
                                value={siteForm.code}
                                onChange={(e) => setSiteForm({ ...siteForm, code: e.target.value })}
                                placeholder="e.g. KK-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="site-region">Region</Label>
                            {mounted && (
                                <Select
                                    value={siteForm.region_id}
                                    onValueChange={(v) => setSiteForm({ ...siteForm, region_id: v })}
                                >
                                    <SelectTrigger id="site-region">
                                        <SelectValue placeholder="Select region" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regions.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSiteModal({ ...siteModal, open: false })}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitSite} disabled={processing || !siteForm.name.trim()}>
                            {processing
                                ? 'Saving...'
                                : siteModal.mode === 'create'
                                  ? 'Create Site'
                                  : 'Update Site'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Site Delete Confirmation ─────────────────────────────── */}
            <AlertDialog open={!!deleteSite} onOpenChange={(o) => !o && setDeleteSite(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Site?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{deleteSite?.name} ({deleteSite?.code})".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteSite}
                            disabled={processing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {processing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Dashboards.layout = {
    breadcrumbs: [
        { title: 'Multi-Site Management', href: '#' },
        { title: 'Site Dashboards', href: '#' },
    ],
};
