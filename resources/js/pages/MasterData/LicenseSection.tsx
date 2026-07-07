import { useState } from 'react';
import { router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import SiteConfigSection from '@/components/SiteConfigSection';
import { Plus, Edit, Trash2, FileText, Columns, Eye, EyeOff } from 'lucide-react';

type SubTab = 'licenses' | 'columns';

const LICENSE_COL_KEYS = [
    'name', 'product_key', 'version', 'category', 'license_type',
    'pricing_model', 'seats', 'purchase_cost', 'vendor', 'site',
    'expiration_date', 'compliance_status', 'license_email', 'notes',
    'support_expiry', 'renewal_date', 'license_name',
] as const;

const LICENSE_COL_LABELS: Record<string, string> = {
    name: 'Name', product_key: 'Product Key', version: 'Version',
    category: 'Category', license_type: 'License Type', pricing_model: 'Pricing Model',
    seats: 'Seats', purchase_cost: 'Cost', vendor: 'Vendor', site: 'Site',
    expiration_date: 'Expiry Date', compliance_status: 'Status',
    license_email: 'License Email', notes: 'Notes',
    support_expiry: 'Support Expiry', renewal_date: 'Renewal Date', license_name: 'Licensed To',
};

function loadLicenseColVisibility(): Record<string, boolean> {
    try {
        const saved = localStorage.getItem('masterdata_license_cols');
        if (saved) return JSON.parse(saved);
    } catch { }
    return {
        name: true, product_key: true, version: true, category: true,
        license_type: true, pricing_model: false, seats: true,
        purchase_cost: true, vendor: true, site: true,
        expiration_date: true, compliance_status: true,
        license_email: false, notes: false,
        support_expiry: false, renewal_date: false, license_name: false,
    };
}

export default function LicenseSection({ licenses, sites, licenseTableConfigs, isAdmin }: any) {
    const [subTab, setSubTab] = useState<SubTab>('licenses');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const [licenseColVisibility, setLicenseColVisibility] = useState<Record<string, boolean>>(loadLicenseColVisibility);
    const [isLicenseColsOpen, setIsLicenseColsOpen] = useState(false);

    const toggleLicenseCol = (key: string) => {
        setLicenseColVisibility(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('masterdata_license_cols', JSON.stringify(next));
            return next;
        });
    };

    function openDialog(item: any = null) {
        setEditingItem(item);
        setFormData(item ? { ...item } : {});
        setIsDialogOpen(true);
    }

    function handleDelete(id: number) {
        if (!confirm('Delete this license?')) return;
        router.delete(`/master-data/licenses/${id}`, { preserveScroll: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        let url = '/master-data/licenses';
        if (editingItem) url = `${url}/${editingItem.id}`;
        router[editingItem ? 'put' : 'post'](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    }

    // ── License columns ──
    const lv = licenseColVisibility;
    const cols: any[] = [];
    if (lv.name) cols.push({ accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />, cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span> });
    if (lv.product_key) cols.push({ accessorKey: 'product_key', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Product Key" />, cell: ({ row }: any) => <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{row.original.product_key ? '••••' + row.original.product_key.slice(-4) : '—'}</span> });
    if (lv.version) cols.push({ accessorKey: 'version', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Version" />, cell: ({ row }: any) => <span className="text-sm">{row.original.version || '—'}</span> });
    if (lv.category) cols.push({ accessorKey: 'category', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />, cell: ({ row }: any) => <span className="text-sm">{row.original.category || '—'}</span> });
    if (lv.license_type) cols.push({
        accessorKey: 'license_type', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }: any) => { const labels: Record<string, string> = { per_user: 'Per User', per_device: 'Per Device', concurrent: 'Concurrent', subscription: 'Subscription', perpetual: 'Perpetual' }; return <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize">{labels[row.original.license_type] || row.original.license_type || '—'}</span>; },
    });
    if (lv.pricing_model) cols.push({ accessorKey: 'pricing_model', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Pricing" />, cell: ({ row }: any) => <span className="text-sm capitalize">{(row.original.pricing_model || '').replace('_', ' ') || '—'}</span> });
    if (lv.seats) cols.push({ id: 'seats', header: 'Seats', cell: ({ row }: any) => <span className="text-sm tabular-nums"><span className="font-semibold">{row.original.used_seats ?? 0}</span><span className="text-muted-foreground"> / {row.original.total_seats ?? 0}</span></span> });
    if (lv.purchase_cost) cols.push({ accessorKey: 'purchase_cost', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Cost" />, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.purchase_cost ? `RM${Number(row.original.purchase_cost).toLocaleString()}` : '—'}</span> });
    if (lv.vendor) cols.push({ accessorKey: 'vendor', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Vendor" />, cell: ({ row }: any) => <span className="text-sm">{row.original.vendor || '—'}</span> });
    if (lv.site) cols.push({ accessorKey: 'site', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />, cell: ({ row }: any) => <span className="text-sm">{row.original.site || '—'}</span> });
    if (lv.expiration_date) cols.push({
        accessorKey: 'expiration_date', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Expiry" />,
        cell: ({ row }: any) => { const d = row.original.expiration_date; if (!d) return <span className="text-sm text-muted-foreground">—</span>; return <span className={`text-sm ${new Date(d) < new Date() ? 'text-red-600 font-medium' : ''}`}>{d}</span>; },
    });
    if (lv.compliance_status) cols.push({
        accessorKey: 'compliance_status', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }: any) => { const colors: Record<string, string> = { compliant: 'bg-emerald-50 text-emerald-700 border-emerald-200', warning: 'bg-amber-50 text-amber-700 border-amber-200', overused: 'bg-red-50 text-red-700 border-red-200', expired: 'bg-gray-100 text-gray-600 border-gray-200' }; return <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colors[row.original.compliance_status] || 'bg-gray-100 text-gray-600'}`}>{row.original.compliance_status || '—'}</span>; },
    });
    if (lv.support_expiry) cols.push({ accessorKey: 'support_expiry', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Support" />, cell: ({ row }: any) => <span className="text-sm">{row.original.support_expiry || '—'}</span> });
    if (lv.renewal_date) cols.push({ accessorKey: 'renewal_date', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Renewal" />, cell: ({ row }: any) => <span className="text-sm">{row.original.renewal_date || '—'}</span> });
    if (lv.license_email) cols.push({ accessorKey: 'license_email', header: ({ column }: any) => <DataTableColumnHeader column={column} title="License Email" />, cell: ({ row }: any) => <span className="text-sm">{row.original.license_email || '—'}</span> });
    if (lv.license_name) cols.push({ accessorKey: 'license_name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Licensed To" />, cell: ({ row }: any) => <span className="text-sm">{row.original.license_name || '—'}</span> });
    if (lv.notes) cols.push({ accessorKey: 'notes', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Notes" />, cell: ({ row }: any) => <span className="text-sm text-muted-foreground">{(row.original.notes || '').slice(0, 50)}{(row.original.notes || '').length > 50 ? '...' : ''}</span> });

    if (isAdmin) {
        cols.push({
            id: 'actions', header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => openDialog(row.original)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                </div>
            ),
        });
    }

    const subTabs: { key: SubTab; label: string; icon: any }[] = [
        { key: 'licenses', label: 'Software License', icon: FileText },
        { key: 'columns', label: 'Columns', icon: Columns },
    ];

    return (
        <div className="space-y-4">
            {/* Sub-tab nav */}
            <div className="flex items-center gap-1.5 bg-background rounded-lg p-0.5 border shadow-sm w-fit">
                {subTabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setSubTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${subTab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {subTab === 'columns' ? (
                <div className="space-y-6">
                    {licenseTableConfigs?.global && (
                        <SiteConfigSection title="Global (All Sites)" configs={licenseTableConfigs.global} siteId={null} tableName="licenses" isAdmin={isAdmin} sites={sites} />
                    )}
                    {Object.keys(licenseTableConfigs || {}).filter(k => k !== 'global').map(siteId => {
                        const site = sites?.find((s: any) => String(s.id) === siteId);
                        return <SiteConfigSection key={siteId} title={site?.name || `Site #${siteId}`} configs={licenseTableConfigs[siteId]} siteId={Number(siteId)} tableName="licenses" isAdmin={isAdmin} sites={sites} />;
                    })}
                    {isAdmin && (
                        <div className="flex items-center gap-3 pt-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { if (confirm('Reset to default? Custom columns will be lost.')) router.post('/master-data/table-configurations/reset-to-default/licenses', {}, { preserveScroll: true }); }}>
                                Reset to Default
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                        <h2 className="text-lg font-semibold">Software Licenses</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsLicenseColsOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" /> Manage Columns
                            </Button>
                            {isAdmin && (
                                <Button onClick={() => openDialog()} size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Add New
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="p-4">
                        <DataTable columns={cols} data={licenses || []} hideToolbar />
                    </div>
                </div>
            )}

            {/* Column visibility dialog */}
            <Dialog open={isLicenseColsOpen} onOpenChange={setIsLicenseColsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>License Column Visibility</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-3 py-4">
                        {LICENSE_COL_KEYS.map(key => (
                            <button key={key} type="button" onClick={() => toggleLicenseCol(key)}
                                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors">
                                <span className="font-medium">{LICENSE_COL_LABELS[key]}</span>
                                {licenseColVisibility[key] ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => { const all: Record<string, boolean> = {}; LICENSE_COL_KEYS.forEach(k => all[k] = true); setLicenseColVisibility(all); localStorage.setItem('masterdata_license_cols', JSON.stringify(all)); }}>Show All</Button>
                        <Button size="sm" onClick={() => setIsLicenseColsOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CRUD Dialog */}
            {subTab !== 'columns' && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add New'} License</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Name *</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                                <div className="grid gap-2"><Label>Version</Label><Input value={formData.version || ''} onChange={(e) => setFormData({ ...formData, version: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Product Key</Label><Input value={formData.product_key || ''} onChange={(e) => setFormData({ ...formData, product_key: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Category</Label><Input value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></div>
                                <div className="grid gap-2">
                                    <Label>License Type *</Label>
                                    <Select value={formData.license_type || ''} onValueChange={(v) => setFormData({ ...formData, license_type: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            {[{ v: 'per_user', l: 'Per User' }, { v: 'per_device', l: 'Per Device' }, { v: 'concurrent', l: 'Concurrent' }, { v: 'subscription', l: 'Subscription' }, { v: 'perpetual', l: 'Perpetual' }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Pricing Model *</Label>
                                    <Select value={formData.pricing_model || ''} onValueChange={(v) => setFormData({ ...formData, pricing_model: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select pricing" /></SelectTrigger>
                                        <SelectContent>
                                            {[{ v: 'one_time', l: 'One Time' }, { v: 'annual', l: 'Annual' }, { v: 'monthly', l: 'Monthly' }, { v: 'quarterly', l: 'Quarterly' }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Total Seats *</Label><Input type="number" min={1} max={500} value={formData.total_seats || ''} onChange={(e) => setFormData({ ...formData, total_seats: parseInt(e.target.value) || 0 })} /></div>
                                <div className="grid gap-2">
                                    <Label>Billing Cycle</Label>
                                    <Select value={formData.billing_cycle || ''} onValueChange={(v) => setFormData({ ...formData, billing_cycle: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{[{ v: 'monthly' }, { v: 'quarterly' }, { v: 'annual' }, { v: 'custom' }].map(o => <SelectItem key={o.v} value={o.v}>{o.v.charAt(0).toUpperCase() + o.v.slice(1)}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Purchase Cost</Label><Input type="number" min={0} step="0.01" value={formData.purchase_cost || ''} onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={formData.purchase_date || ''} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Expiration Date</Label><Input type="date" value={formData.expiration_date || ''} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Support Expiry</Label><Input type="date" value={formData.support_expiry || ''} onChange={(e) => setFormData({ ...formData, support_expiry: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Renewal Date</Label><Input type="date" value={formData.renewal_date || ''} onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>License Email</Label><Input type="email" value={formData.license_email || ''} onChange={(e) => setFormData({ ...formData, license_email: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Licensed To</Label><Input value={formData.license_name || ''} onChange={(e) => setFormData({ ...formData, license_name: e.target.value })} /></div>
                                <div className="col-span-2 grid gap-2"><Label>Notes</Label><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                {isAdmin && <Button type="submit">Save Changes</Button>}
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
