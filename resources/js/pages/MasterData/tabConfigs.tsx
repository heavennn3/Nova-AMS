import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';

function editDeleteCol(handleOpenDialog: any, handleDelete: any, isAdmin: boolean) {
    if (!isAdmin) return [];
    return [{
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => (
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => handleOpenDialog(row.original)}>
                    <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
            </div>
        ),
    }];
}

export function sitesTab(opts: any) {
    const { filteredSites, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
    return {
        title: 'Sites (Locations)',
        data: filteredSites,
        columns: [
            {
                accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
                cell: ({ row }: any) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-sm font-bold text-blue-600">{(row.original.name || '?')[0].toUpperCase()}</div>
                        <div><div className="font-medium">{row.original.name}</div>{row.original.code && <div className="text-xs text-muted-foreground font-mono">{row.original.code}</div>}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'region', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Region" />,
                cell: ({ row }: any) => {
                    if (!row.original.region) return <span className="text-xs text-muted-foreground italic">Not set</span>;
                    const isSabah = row.original.region.toLowerCase() === 'sabah';
                    return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isSabah ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isSabah ? 'bg-emerald-500' : 'bg-amber-500'}`} />{row.original.region.charAt(0).toUpperCase() + row.original.region.slice(1)}
                    </span>;
                },
            },
            ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin),
        ],
        renderForm: () => (
            <div className="space-y-5">
                <div className="grid gap-2">
                    <Label className="text-sm font-medium">Site Name <span className="text-rose-500">*</span></Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Kota Kinabalu" required className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2"><Label className="text-sm font-medium">Code</Label><Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. KK-01" className="h-10 font-mono" /></div>
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">Region <span className="text-rose-500">*</span></Label>
                        <Select value={formData.region || ''} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                            <SelectTrigger className="h-10"><SelectValue placeholder="Select region" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sabah"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Sabah</div></SelectItem>
                                <SelectItem value="sarawak"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Sarawak</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        ),
    };
}

export function categoriesTab(opts: any) {
    const { categories, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
    return {
        title: 'Asset Categories',
        data: categories || [],
        columns: [
            { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
            { accessorKey: 'description', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Description" /> },
            ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin),
        ],
        renderForm: () => (
            <><div className="grid gap-2"><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="grid gap-2"><Label>Description</Label><Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div></>
        ),
    };
}

export function typesTab(opts: any) {
    const { types, categories, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
    return {
        title: 'Asset Types',
        data: types || [],
        columns: [
            { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
            { accessorKey: 'category.name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" /> },
            ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin),
        ],
        renderForm: () => (
            <><div className="grid gap-2"><Label>Name</Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="grid gap-2"><Label>Category</Label>
                    <Select value={formData.category_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, category_id: parseInt(v) })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </>
        ),
    };
}

export function vendorsTab(opts: any) {
    const { vendors, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
    return {
        title: 'Vendors',
        data: vendors || [],
        columns: [
            {
                accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
                cell: ({ row }: any) => {
                    const v = row.original;
                    return <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-sm font-bold text-purple-600">{(v.name || '?')[0].toUpperCase()}</div>
                        <div><div className="font-medium">{v.name}</div></div>
                    </div>;
                },
            },
            { 
                accessorKey: 'description', 
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Description" />,
                cell: ({ row }: any) => {
                    const description = row.original.description;
                    return <span className="text-sm text-muted-foreground">{description || '—'}</span>;
                }
            },
            ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin),
        ],
        renderForm: () => (
            <>
                <div className="grid gap-2">
                    <Label>Vendor Name <span className="text-rose-500">*</span></Label>
                    <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
                </div>
            </>
        ),
    };
}

export function licensesTab(opts: any) {
    const { licenses, licenseColVisibility, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
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
    if (lv.purchase_cost) cols.push({ accessorKey: 'purchase_cost', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Cost" />, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.purchase_cost ? `$${Number(row.original.purchase_cost).toLocaleString()}` : '—'}</span> });
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

    return {
        title: 'Software License',
        data: licenses,
        isLicenseTab: true,
        columns: [...cols, ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin)],
        renderForm: () => (
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
                <div className="grid gap-2"><Label>Notes</Label><textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
            </div>
        ),
    };
}

export function assetStatusesTab(opts: any) {
    const { assetStatuses, formData, setFormData, handleOpenDialog, handleDelete, isAdmin } = opts;
    const presetColors = ['#6B7280', '#EF4444', '#EAB308', '#22C55E', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];
    return {
        title: 'Asset Statuses',
        columns: [
            {
                accessorKey: 'color', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Color" />,
                cell: ({ row }: any) => <span className="inline-block h-5 w-5 rounded" style={{ backgroundColor: row.original.color }} />,
            },
            {
                accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
                cell: ({ row }: any) => <span className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: row.original.color }}>{row.original.name}</span>,
            },
            ...editDeleteCol(handleOpenDialog, handleDelete, isAdmin),
        ],
        data: assetStatuses,
        renderForm: () => (
            <>
                <div className="grid gap-2"><Label>Status Name <span className="text-rose-500">*</span></Label><Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. IN TRANSIT" required /></div>
                <div className="grid gap-2"><Label>Badge Color</Label>
                    <div className="flex flex-wrap gap-2">
                        {presetColors.map(c => (
                            <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                                className={`h-8 w-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }} />
                        ))}
                    </div>
                    <Input value={formData.color || '#6B7280'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#HEX" className="mt-1 font-mono" />
                </div>
                <div className="grid gap-2"><Label>Sort Order</Label><Input type="number" value={formData.sort_order ?? 0} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} /></div>
            </>
        ),
    };
}
