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
import { Plus, Edit, Trash2, Layers, Shapes, Palette, Columns } from 'lucide-react';

type SubTab = 'categories' | 'types' | 'statuses' | 'columns';

const presetColors = ['#6B7280', '#EF4444', '#EAB308', '#22C55E', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];

export default function AssetSection({ categories, types, assetStatuses, assetTableConfigs, sites, isAdmin }: any) {
    const [subTab, setSubTab] = useState<SubTab>('categories');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    function openDialog(item: any = null) {
        setEditingItem(item);
        setFormData(item ? { ...item } : {});
        setIsDialogOpen(true);
    }

    function handleDelete(id: number) {
        const label = { categories: 'category', types: 'type', statuses: 'status' }[subTab];
        if (!confirm(`Delete this ${label}?`)) return;
        const url = { categories: `/master-data/categories/${id}`, types: `/master-data/types/${id}`, statuses: `/master-data/asset-statuses/${id}` }[subTab];
        router.delete(url!, { preserveScroll: true });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const urlMap = { categories: '/master-data/categories', types: '/master-data/types', statuses: '/master-data/asset-statuses' };
        let url = urlMap[subTab];
        if (editingItem) url = `${url}/${editingItem.id}`;
        const payload = subTab === 'types' ? { ...formData, category_id: formData.category_id ? parseInt(formData.category_id) : null } : formData;
        router[editingItem ? 'put' : 'post'](url, payload, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    }

    // ── Category columns ──
    const catCols: any[] = [
        { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
        { accessorKey: 'description', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Description" /> },
    ];
    if (isAdmin) catCols.push(actionsCol());

    // ── Type columns ──
    const typeCols: any[] = [
        { accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" /> },
        { accessorKey: 'category.name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" /> },
    ];
    if (isAdmin) typeCols.push(actionsCol());

    // ── Status columns ──
    const statusCols: any[] = [
        {
            accessorKey: 'color', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Color" />,
            cell: ({ row }: any) => <span className="inline-block h-5 w-5 rounded" style={{ backgroundColor: row.original.color }} />,
        },
        {
            accessorKey: 'name', header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }: any) => <span className="inline-block rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: row.original.color }}>{row.original.name}</span>,
        },
    ];
    if (isAdmin) statusCols.push(actionsCol());

    function actionsCol() {
        return {
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
        };
    }

    const subTabs: { key: SubTab; label: string; icon: any }[] = [
        { key: 'categories', label: 'Categories', icon: Layers },
        { key: 'types', label: 'Types', icon: Shapes },
        { key: 'statuses', label: 'Status (Color)', icon: Palette },
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
                    {/* Global config */}
                    {assetTableConfigs?.global && (
                        <SiteConfigSection title="Global (All Sites)" configs={assetTableConfigs.global} siteId={null} tableName="assets" isAdmin={isAdmin} sites={sites} />
                    )}
                    {/* Per-site configs */}
                    {Object.keys(assetTableConfigs || {})
                        .filter(k => k !== 'global')
                        .map(siteId => {
                            const site = sites?.find((s: any) => String(s.id) === siteId);
                            return (
                                <SiteConfigSection key={siteId} title={site?.name || `Site #${siteId}`} configs={assetTableConfigs[siteId]} siteId={Number(siteId)} tableName="assets" isAdmin={isAdmin} sites={sites} />
                            );
                        })}
                    {isAdmin && (
                        <div className="flex items-center gap-3 pt-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { if (confirm('Reset to default? Custom columns will be lost.')) router.post('/master-data/table-configurations/reset-to-default/assets', {}, { preserveScroll: true }); }}>
                                Reset to Default
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                        <h2 className="text-lg font-semibold">
                            {subTab === 'categories' ? 'Asset Categories' : subTab === 'types' ? 'Asset Types' : 'Asset Statuses'}
                        </h2>
                        {isAdmin && (
                            <Button onClick={() => openDialog()} size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Add New
                            </Button>
                        )}
                    </div>
                    <div className="p-4">
                        <DataTable
                            columns={subTab === 'categories' ? catCols : subTab === 'types' ? typeCols : statusCols}
                            data={subTab === 'categories' ? (categories || []) : subTab === 'types' ? (types || []) : (assetStatuses || [])}
                            hideToolbar
                        />
                    </div>
                </div>
            )}

            {/* Dialog — for categories/types/statuses only */}
            {subTab !== 'columns' && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add New'} {
                                subTab === 'categories' ? 'Category' : subTab === 'types' ? 'Type' : 'Status'
                            }</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            {subTab === 'categories' ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Name <span className="text-rose-500">*</span></Label>
                                        <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    </div>
                                </>
                            ) : subTab === 'types' ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Name <span className="text-rose-500">*</span></Label>
                                        <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select value={formData.category_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">— None —</SelectItem>
                                                {(categories || []).map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Status Name <span className="text-rose-500">*</span></Label>
                                        <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. IN TRANSIT" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Badge Color</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {presetColors.map(c => (
                                                <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })}
                                                    className={`h-8 w-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                        <Input value={formData.color || '#6B7280'} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="#HEX" className="mt-1 font-mono" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sort Order</Label>
                                        <Input type="number" value={formData.sort_order ?? 0} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </>
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
