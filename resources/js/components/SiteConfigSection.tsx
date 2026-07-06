import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Settings, Eye, EyeOff } from 'lucide-react';

const DATA_TYPES = ['string', 'number', 'date', 'boolean', 'enum', 'array'] as const;
const ALIGNMENTS = ['left', 'center', 'right'] as const;

export default function SiteConfigSection({
    title, configs, siteId, tableName, isAdmin, sites,
}: {
    title: string;
    configs: any[];
    siteId: number | null;
    tableName: string;
    isAdmin: boolean;
    sites: { id: number; name: string }[];
}) {
    const [editing, setEditing] = useState<any | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [form, setForm] = useState<any>({});

    const openEdit = (config: any) => {
        setEditing(config);
        setForm({
            column_title: config.column_title,
            column_key: config.column_key,
            data_type: config.data_type,
            is_primary_key: config.is_primary_key,
            is_sortable: config.is_sortable,
            is_filterable: config.is_filterable,
            is_visible: config.is_visible,
            sort_order: config.sort_order,
            width: config.width,
            alignment: config.alignment || 'left',
            format_pattern: config.format_pattern || '',
            options: config.options ? JSON.stringify(config.options) : '',
        });
        setEditOpen(true);
    };

    const openAdd = () => {
        setEditing(null);
        setForm({
            column_title: '',
            column_key: '',
            data_type: 'string',
            is_primary_key: false,
            is_sortable: true,
            is_filterable: true,
            is_visible: true,
            sort_order: configs.length,
            width: null,
            alignment: 'left',
            format_pattern: '',
            options: '',
        });
        setAddOpen(true);
    };

    const saveEdit = () => {
        if (!editing) return;
        const payload = {
            ...form,
            options: form.options ? (() => { try { return JSON.parse(form.options); } catch { return {}; } })() : {},
            width: form.width ? Number(form.width) : null,
            sort_order: Number(form.sort_order),
        };
        router.put(`/master-data/table-configurations/${editing.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => setEditOpen(false),
        });
    };

    const saveNew = () => {
        const payload = {
            table_name: tableName,
            site_id: siteId,
            column_key: form.column_key,
            column_title: form.column_title,
            data_type: form.data_type,
            is_primary_key: form.is_primary_key,
            is_sortable: form.is_sortable,
            is_filterable: form.is_filterable,
            is_visible: form.is_visible,
            sort_order: Number(form.sort_order),
            alignment: form.alignment,
            width: form.width ? Number(form.width) : null,
            format_pattern: form.format_pattern || null,
            options: form.options ? (() => { try { return JSON.parse(form.options); } catch { return {}; } })() : null,
        };
        router.post('/master-data/table-configurations', payload, {
            preserveScroll: true,
            onSuccess: () => setAddOpen(false),
        });
    };

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    {title}
                    <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full">{configs.length} column{configs.length !== 1 ? 's' : ''}</span>
                </h3>
                {isAdmin && (
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={openAdd}>
                            <Plus className="h-3.5 w-3.5" /> Add Column
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                                if (confirm(`Delete all columns for "${title}"? This cannot be undone.`))
                                    router.post(`/master-data/table-configurations/delete-table/${tableName}`, { site_id: siteId }, { preserveScroll: true });
                            }}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {configs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No columns configured for this site.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="p-2.5 text-left font-medium">Title</th>
                                <th className="p-2.5 text-left font-medium">Key</th>
                                <th className="p-2.5 text-left font-medium">Type</th>
                                <th className="p-2.5 text-center font-medium">Sort</th>
                                <th className="p-2.5 text-center font-medium">Filter</th>
                                <th className="p-2.5 text-center font-medium">Visible</th>
                                <th className="p-2.5 text-center font-medium">Order</th>
                                <th className="p-2.5 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((config: any, index: number) => (
                                <tr key={config.id} className="border-b last:border-0 hover:bg-muted/20 text-sm">
                                    <td className="p-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium">{config.column_title}</span>
                                            {config.is_primary_key && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-semibold">PK</span>}
                                        </div>
                                    </td>
                                    <td className="p-2.5 font-mono text-xs text-muted-foreground">{config.column_key}</td>
                                    <td className="p-2.5">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{config.data_type}</span>
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <input type="checkbox" checked={config.is_sortable}
                                            onChange={() => router.put(`/master-data/table-configurations/${config.id}`, { is_sortable: !config.is_sortable }, { preserveScroll: true })}
                                            className="cursor-pointer" />
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <input type="checkbox" checked={config.is_filterable}
                                            onChange={() => router.put(`/master-data/table-configurations/${config.id}`, { is_filterable: !config.is_filterable }, { preserveScroll: true })}
                                            className="cursor-pointer" />
                                    </td>
                                    <td className="p-2.5 text-center">
                                        <button
                                            onClick={() => router.put(`/master-data/table-configurations/${config.id}`, { is_visible: !config.is_visible }, { preserveScroll: true })}
                                            className={`p-1 rounded transition-colors ${config.is_visible ? 'text-green-600 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {config.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                        </button>
                                    </td>
                                    <td className="p-2.5">
                                        <div className="flex items-center justify-center gap-0.5">
                                            <span className="text-xs text-muted-foreground w-4 text-center">{config.sort_order}</span>
                                            <div className="flex flex-col gap-0">
                                                <button onClick={() => { if (index > 0) router.post('/master-data/table-configurations/update-order', { columns: [{ id: config.id, sort_order: configs[index - 1].sort_order }, { id: configs[index - 1].id, sort_order: config.sort_order }] }, { preserveScroll: true }); }} disabled={index === 0} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-20 leading-none"><ArrowUp className="h-2.5 w-2.5" /></button>
                                                <button onClick={() => { if (index < configs.length - 1) router.post('/master-data/table-configurations/update-order', { columns: [{ id: config.id, sort_order: configs[index + 1].sort_order }, { id: configs[index + 1].id, sort_order: config.sort_order }] }, { preserveScroll: true }); }} disabled={index === configs.length - 1} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-20 leading-none"><ArrowDown className="h-2.5 w-2.5" /></button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-2.5">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(config)}><Edit className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => { if (confirm('Delete this column?')) router.delete(`/master-data/table-configurations/${config.id}`, { preserveScroll: true }); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Column</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Column Title</Label>
                                <Input value={form.column_title || ''} onChange={(e) => setForm({ ...form, column_title: e.target.value })} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Column Key</Label>
                                <Input value={form.column_key || ''} onChange={(e) => setForm({ ...form, column_key: e.target.value })} className="h-8 text-sm font-mono" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Data Type</Label>
                                <Select value={form.data_type} onValueChange={(v) => setForm({ ...form, data_type: v })}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {DATA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Alignment</Label>
                                <Select value={form.alignment} onValueChange={(v) => setForm({ ...form, alignment: v })}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ALIGNMENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Sort Order</Label>
                                <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Width (px)</Label>
                                <Input type="number" value={form.width ?? ''} onChange={(e) => setForm({ ...form, width: e.target.value })} className="h-8 text-sm" placeholder="Auto" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_sortable} onCheckedChange={(v) => setForm({ ...form, is_sortable: !!v })} /><Label className="text-xs">Sortable</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_filterable} onCheckedChange={(v) => setForm({ ...form, is_filterable: !!v })} /><Label className="text-xs">Filterable</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_visible} onCheckedChange={(v) => setForm({ ...form, is_visible: !!v })} /><Label className="text-xs">Visible</Label></div>
                        </div>
                        {form.data_type === 'enum' && (
                            <div className="space-y-1">
                                <Label className="text-xs">Options (JSON)</Label>
                                <textarea value={form.options || ''} onChange={(e) => setForm({ ...form, options: e.target.value })} className="w-full min-h-[60px] rounded-md border px-3 py-2 text-xs font-mono" placeholder='{"option1":"Label 1","option2":"Label 2"}' />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={saveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Add Column — {title}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Column Title *</Label>
                                <Input value={form.column_title || ''} onChange={(e) => setForm({ ...form, column_title: e.target.value })} className="h-8 text-sm" placeholder="e.g. Serial Number" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Column Key *</Label>
                                <Input value={form.column_key || ''} onChange={(e) => setForm({ ...form, column_key: e.target.value })} className="h-8 text-sm font-mono" placeholder="e.g. serial_number" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Data Type</Label>
                                <Select value={form.data_type} onValueChange={(v) => setForm({ ...form, data_type: v })}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {DATA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Alignment</Label>
                                <Select value={form.alignment} onValueChange={(v) => setForm({ ...form, alignment: v })}>
                                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ALIGNMENTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Sort Order</Label>
                                <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Width (px)</Label>
                                <Input type="number" value={form.width ?? ''} onChange={(e) => setForm({ ...form, width: e.target.value })} className="h-8 text-sm" placeholder="Auto" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_sortable} onCheckedChange={(v) => setForm({ ...form, is_sortable: !!v })} /><Label className="text-xs">Sortable</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_filterable} onCheckedChange={(v) => setForm({ ...form, is_filterable: !!v })} /><Label className="text-xs">Filterable</Label></div>
                            <div className="flex items-center gap-2"><Checkbox checked={!!form.is_visible} onCheckedChange={(v) => setForm({ ...form, is_visible: !!v })} /><Label className="text-xs">Visible</Label></div>
                        </div>
                        {form.data_type === 'enum' && (
                            <div className="space-y-1">
                                <Label className="text-xs">Options (JSON)</Label>
                                <textarea value={form.options || ''} onChange={(e) => setForm({ ...form, options: e.target.value })} className="w-full min-h-[60px] rounded-md border px-3 py-2 text-xs font-mono" placeholder='{"option1":"Label 1","option2":"Label 2"}' />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={saveNew}>Add Column</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
