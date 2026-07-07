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
import { Plus, Edit, Trash2, Layers, Package, Settings, Columns } from 'lucide-react';
import SiteConfigSection from '@/components/SiteConfigSection';

type SubTab = 'categories' | 'settings' | 'columns';

export default function SparePartSection({ spareParts, sites, sparePartCategories, assetTypes, sparePartTableConfigs, isAdmin }: any) {
    const [subTab, setSubTab] = useState<SubTab>('categories');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    // ── Categories ──
    const catCols: any[] = [
        { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
        {
            accessorKey: 'parent_name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Group" />,
            cell: ({ row }: any) => row.original.parent_name
                ? <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">{row.original.parent_name}</span>
                : <span className="text-xs text-muted-foreground italic">—</span>,
        },
    ];
    if (isAdmin) {
        catCols.push({
            id: 'actions', header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => openDialog(row.original, 'categories')}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.original.id, 'categories')}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                </div>
            ),
        });
    }

    // ── Settings (Spare Parts) ──
    const allFieldKeys = new Set<string>();
    (spareParts || []).forEach((p: any) => { if (p.fields) Object.keys(p.fields).forEach((k: string) => allFieldKeys.add(k)); });

    const fixedCols: any[] = [
        { accessorKey: 'spare_part_id', header: ({ column }: any) => <DataTableColumnHeader column={column} title="SP ID" />, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.spare_part_id || <span className="italic text-muted-foreground">auto</span>}</span> },
        { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />, cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span> },
        { accessorKey: 'part_number', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Part #" />, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.part_number || '—'}</span> },
        { accessorKey: 'category_name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />, cell: ({ row }: any) => row.original.category_name ? <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">{row.original.category_name}</span> : <span className="text-xs text-muted-foreground italic">—</span> },
        { accessorKey: 'quantity', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Qty" />, cell: ({ row }: any) => <span className="tabular-nums font-semibold">{row.original.quantity}</span> },
        { accessorKey: 'minimum_stock_level', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Min Stock" />, cell: ({ row }: any) => <span className="tabular-nums text-muted-foreground">{row.original.minimum_stock_level}</span> },
        { accessorKey: 'unit_cost', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Cost" />, cell: ({ row }: any) => <span className="tabular-nums">{row.original.unit_cost ? `RM${Number(row.original.unit_cost).toFixed(2)}` : '—'}</span> },
        {
            accessorKey: 'status', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }: any) => { const s = row.original.status; const c: Record<string, string> = { available: 'bg-emerald-100 text-emerald-700 border-emerald-200', in_use: 'bg-blue-100 text-blue-700 border-blue-200', damaged: 'bg-red-100 text-red-700 border-red-200', disposed: 'bg-gray-100 text-gray-600 border-gray-200' }; return <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c[s] || 'bg-gray-100 text-gray-600'}`}>{s || '—'}</span>; },
        },
        { accessorKey: 'site_name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />, cell: ({ row }: any) => <span className="text-sm">{row.original.site_name || '—'}</span> },
        { accessorKey: 'asset_type_name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Asset Type" />, cell: ({ row }: any) => <span className="text-sm">{row.original.asset_type_name || '—'}</span> },
        { accessorKey: 'location', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Location" />, cell: ({ row }: any) => <span className="text-sm">{row.original.location || '—'}</span> },
    ];
    const dynCols: any[] = Array.from(allFieldKeys).map((key: string) => ({
        accessorKey: `fields.${key}`,
        header: ({ column }: any) => <DataTableColumnHeader column={column} title={key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} />,
        cell: ({ row }: any) => <span className="text-sm">{row.original.fields?.[key] ?? '—'}</span>,
    }));
    const settingsCols: any[] = [...fixedCols, ...dynCols];
    if (isAdmin) {
        settingsCols.push({
            id: 'actions', header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => openDialog(row.original, 'settings')}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.original.id, 'settings')}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                </div>
            ),
        });
    }

    // ── CRUD handlers ──
    function openDialog(item: any = null, mode: SubTab) {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item });
        } else {
            setFormData(mode === 'settings' ? { status: 'available', quantity: 0, minimum_stock_level: 0 } : {});
        }
        setIsDialogOpen(true);
    }

    function handleDelete(id: number, mode: SubTab) {
        const label = mode === 'categories' ? 'category' : 'spare part';
        if (!confirm(`Delete this ${label}?`)) return;
        const url = mode === 'categories' ? `/master-data/spare-part-categories/${id}` : `/master-data/spare-parts/${id}`;
        router.delete(url, { preserveScroll: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const isCat = subTab === 'categories';
        let url = isCat ? '/master-data/spare-part-categories' : '/master-data/spare-parts';
        if (editingItem) url = `${url}/${editingItem.id}`;
        router[editingItem ? 'put' : 'post'](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    }

    const subTabs: { key: SubTab; label: string; icon: any }[] = [
        { key: 'categories', label: 'Categories', icon: Layers },
        { key: 'settings', label: 'Settings', icon: Settings },
        { key: 'columns', label: 'Columns', icon: Columns },
    ];

    return (
        <div className="space-y-4">
            {/* Sub-tab navigation */}
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
                    {sparePartTableConfigs?.global && (
                        <SiteConfigSection title="Global (All Sites)" configs={sparePartTableConfigs.global} siteId={null} tableName="spare_parts" isAdmin={isAdmin} sites={sites} />
                    )}
                    {Object.keys(sparePartTableConfigs || {}).filter(k => k !== 'global').map(siteId => {
                        const site = sites?.find((s: any) => String(s.id) === siteId);
                        return <SiteConfigSection key={siteId} title={site?.name || `Site #${siteId}`} configs={sparePartTableConfigs[siteId]} siteId={Number(siteId)} tableName="spare_parts" isAdmin={isAdmin} sites={sites} />;
                    })}
                    {isAdmin && (
                        <div className="flex items-center gap-3 pt-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { if (confirm('Reset to default? Custom columns will be lost.')) router.post('/master-data/table-configurations/reset-to-default/spare_parts', {}, { preserveScroll: true }); }}>
                                Reset to Default
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">{subTab === 'categories' ? 'Spare Part Categories' : 'Spare Parts Settings'}</h2>
                    {isAdmin && (
                        <Button onClick={() => openDialog(null, subTab)} size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    )}
                </div>
                <div className="p-4">
                    {subTab === 'categories' ? (
                        <DataTable columns={catCols} data={sparePartCategories || []} hideToolbar />
                    ) : (
                        <DataTable columns={settingsCols} data={spareParts || []} hideToolbar />
                    )}
                </div>
            </div>
            )}

            {/* Dialog — for categories/settings only */}
            {subTab !== 'columns' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add New'} {subTab === 'categories' ? 'Category' : 'Spare Part'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {subTab === 'categories' ? (
                            <>
                                <div className="grid gap-2">
                                    <Label>Name <span className="text-rose-500">*</span></Label>
                                    <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. RAM, SSD" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Group</Label>
                                    <Select value={formData.parent_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, parent_id: v ? parseInt(v) : null })}>
                                        <SelectTrigger><SelectValue placeholder="Select group (optional)" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">— No group —</SelectItem>
                                            {(sparePartCategories || []).filter((c: any) => !c.parent_id).map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Spare Part ID</Label>
                                    <Input value={formData.spare_part_id || ''} onChange={(e) => setFormData({ ...formData, spare_part_id: e.target.value })} placeholder="Auto if empty" disabled={!!editingItem} className="font-mono" />
                                    {editingItem && <p className="text-[10px] text-muted-foreground">🔒 Read-only</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Name <span className="text-rose-500">*</span></Label>
                                    <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Part Number</Label>
                                    <Input value={formData.part_number || ''} onChange={(e) => setFormData({ ...formData, part_number: e.target.value })} placeholder="Unique identifier" disabled={!!editingItem} className="font-mono" />
                                    {editingItem && <p className="text-[10px] text-muted-foreground">🔒 Read-only</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category (FK) <span className="text-rose-500">*</span></Label>
                                    <Select value={formData.spare_part_category_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, spare_part_category_id: v ? parseInt(v) : null })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">— None —</SelectItem>
                                            {(sparePartCategories || []).map((c: any) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.parent_name ? `${c.parent_name} > ` : ''}{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quantity <span className="text-rose-500">*</span></Label>
                                    <Input type="number" min={0} value={formData.quantity ?? 0} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Min Stock <span className="text-rose-500">*</span></Label>
                                    <Input type="number" min={0} value={formData.minimum_stock_level ?? 0} onChange={(e) => setFormData({ ...formData, minimum_stock_level: parseInt(e.target.value) || 0 })} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Unit Cost (RM)</Label>
                                    <Input type="number" min={0} step="0.01" value={formData.unit_cost ?? ''} onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status <span className="text-rose-500">*</span></Label>
                                    <Select value={formData.status || 'available'} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[{ v: 'available', l: 'Available' }, { v: 'in_use', l: 'In Use' }, { v: 'damaged', l: 'Damaged' }, { v: 'disposed', l: 'Disposed' }].map(o => (
                                                <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Site (FK)</Label>
                                    <Select value={formData.site_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, site_id: v ? parseInt(v) : null })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">— None —</SelectItem>
                                            {(sites || []).map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Asset Type (FK)</Label>
                                    <Select value={formData.asset_type_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, asset_type_id: v ? parseInt(v) : null })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">— None —</SelectItem>
                                            {(assetTypes || []).map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Location</Label>
                                    <Input value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Shelf A-12" />
                                </div>
                            </div>
                        )}
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
