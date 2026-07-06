import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo } from 'react';
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
import { DataTable } from '@/components/data-table/data-table';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Eye,
    EyeOff,
    Copy,
    ArrowUpDown,
    Filter,
    KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';

interface TableConfiguration {
    id: number;
    table_name: string;
    column_key: string;
    column_title: string;
    data_type: string;
    data_source: string | null;
    is_primary_key: boolean;
    is_sortable: boolean;
    is_filterable: boolean;
    is_visible: boolean;
    sort_order: number;
    width: number | null;
    alignment: string;
    format_pattern: string | null;
    options: any;
}

interface IndexProps {
    configurations: TableConfiguration[];
    currentTable: string;
    tables: string[];
}

const DATA_TYPES = [
    { value: 'string', label: 'Text', icon: 'Aa' },
    { value: 'number', label: 'Number', icon: '123' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'boolean', label: 'Yes/No', icon: '◻' },
    { value: 'enum', label: 'Dropdown', icon: '▼' },
];

function ToggleOption({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
            </button>
            <span className="text-sm cursor-pointer select-none" onClick={() => onChange(!checked)}>{label}</span>
        </div>
    );
}

function ColumnFormModal({
    open, onClose, config, tableName, existingConfigs = [],
}: {
    open: boolean; onClose: () => void; config: TableConfiguration | null; tableName: string; existingConfigs?: TableConfiguration[];
}) {
    const isEditing = !!config;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        table_name: tableName,
        column_key: config?.column_key || '',
        column_title: config?.column_title || '',
        data_type: config?.data_type || 'string',
        data_source: config?.data_source || '',
        is_primary_key: config?.is_primary_key || false,
        is_sortable: config?.is_sortable ?? true,
        is_filterable: config?.is_filterable ?? true,
        is_visible: config?.is_visible ?? true,
        sort_order: config?.sort_order ?? 0,
        alignment: config?.alignment || 'left',
        width: config?.width || null,
        options: config?.options || {},
    });
    const [autoSlug, setAutoSlug] = useState(true);
    const [optionsText, setOptionsText] = useState(config?.options ? JSON.stringify(config.options, null, 2) : '');

    useEffect(() => {
        if (!open) { reset(); setAutoSlug(true); setOptionsText(''); }
        if (config && open) {
            setData({
                table_name: config.table_name, column_key: config.column_key, column_title: config.column_title,
                data_type: config.data_type, data_source: config.data_source || '', is_primary_key: config.is_primary_key,
                is_sortable: config.is_sortable, is_filterable: config.is_filterable, is_visible: config.is_visible,
                sort_order: config.sort_order, alignment: config.alignment, width: config.width, options: config.options || {},
            });
            setOptionsText(config.options ? JSON.stringify(config.options, null, 2) : '');
        }
        if (!config && open) {
            setData({ table_name: tableName, column_key: '', column_title: '', data_type: 'string', data_source: '', is_primary_key: false, is_sortable: true, is_filterable: true, is_visible: true, sort_order: 0, alignment: 'left', width: null, options: {} });
            setOptionsText('');
        }
    }, [open, config?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let parsedOptions = {};
        if (optionsText.trim()) { try { parsedOptions = JSON.parse(optionsText); } catch { toast.error('Invalid JSON in options field'); return; } }
        if (!isEditing && existingConfigs.find((c) => c.column_key === data.column_key && c.table_name === data.table_name)) {
            toast.error(`Column key "${data.column_key}" already exists`); return;
        }
        const submitData = { ...data, options: parsedOptions, sort_order: isEditing ? data.sort_order : undefined };
        if (isEditing) {
            put(`/master-data/table-configurations/${config!.id}`, { ...submitData, onSuccess: () => { toast.success('Column updated'); onClose(); router.reload({ only: ['configurations'] }); }, onError: () => toast.error('Failed') });
        } else {
            post('/master-data/table-configurations', { ...submitData, onSuccess: () => { toast.success('Column added'); onClose(); router.reload({ only: ['configurations'] }); }, onError: () => toast.error('Failed') });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>{isEditing ? 'Edit Column' : 'Add Column'}</DialogTitle><DialogDescription>{isEditing ? `Configuring "${config?.column_title}"` : 'Configure a new column'}</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3 space-y-1.5">
                            <Label htmlFor="column_title">Column Title</Label>
                            <Input id="column_title" value={data.column_title} onChange={(e) => { setData('column_title', e.target.value); if (autoSlug && !isEditing) setData('column_key', data.column_title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')); }} placeholder="e.g. Asset Tag" required autoFocus={!isEditing} />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="data_type">Data Type</Label>
                            <Select value={data.data_type} onValueChange={(v) => setData('data_type', v)}>
                                <SelectTrigger id="data_type"><SelectValue /></SelectTrigger>
                                <SelectContent>{DATA_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}><span className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold">{t.icon}</span>{t.label}</span></SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="column_key">Column Key <span className="text-gray-400 font-normal ml-1">(internal)</span></Label>
                        <Input id="column_key" value={data.column_key} onChange={(e) => { setData('column_key', e.target.value); setAutoSlug(false); }} placeholder="e.g. asset_tag" className="font-mono text-sm" required />
                        {errors.column_key && <p className="text-xs text-red-500 mt-1">{errors.column_key}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <ToggleOption checked={data.is_visible} onChange={(v) => setData('is_visible', v)} label="Visible" />
                        <ToggleOption checked={data.is_sortable} onChange={(v) => setData('is_sortable', v)} label="Sortable" />
                        <ToggleOption checked={data.is_filterable} onChange={(v) => setData('is_filterable', v)} label="Filterable" />
                        <ToggleOption checked={data.is_primary_key} onChange={(v) => setData('is_primary_key', v)} label="Primary Key" />
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>{isEditing ? 'Save Changes' : 'Add Column'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function TableConfigurationIndex({ configurations, currentTable, tables }: IndexProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<TableConfiguration | null>(null);

    const openAdd = () => { setEditingConfig(null); setModalOpen(true); };
    const openEdit = (config: TableConfiguration) => { setEditingConfig(config); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditingConfig(null); };
    const handleTableChange = (tableName: string) => { router.get(`/master-data/table-configurations?tableName=${tableName}`); };

    const handleDelete = (id: number) => {
        if (confirm('Delete this column?')) {
            router.delete(`/master-data/table-configurations/${id}`, { onSuccess: () => toast.success('Deleted'), preserveScroll: true });
        }
    };
    const handleToggleVisible = (config: TableConfiguration) => {
        router.put(`/master-data/table-configurations/${config.id}`, { ...config, is_visible: !config.is_visible }, { preserveScroll: true });
    };
    const handleResetToDefault = () => {
        if (confirm('Reset this table to default columns?')) {
            router.post(`/master-data/table-configurations/reset-to-default/${currentTable}`, {}, { onSuccess: () => toast.success('Reset'), preserveScroll: true });
        }
    };
    const handleBatchDelete = (rows: any[]) => {
        const ids = rows.map((r) => r.id);
        router.post('/master-data/table-configurations/batch-delete', { ids }, {
            onSuccess: () => { toast.success(`${ids.length} columns deleted`); },
            preserveScroll: true,
        });
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'column_title',
            header: 'Column',
            cell: ({ row }: any) => {
                const cfg = row.original;
                const icon = DATA_TYPES.find((d) => d.value === cfg.data_type);
                return (
                    <div className="flex items-center gap-2.5">
                        <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${cfg.is_primary_key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{icon?.icon || '?'}</span>
                        <div>
                            <div className="flex items-center gap-1.5"><span className="font-medium text-sm">{cfg.column_title}</span>{cfg.is_primary_key && <KeyRound className="h-3 w-3 text-amber-500" />}</div>
                            <span className="text-[11px] text-gray-400 font-mono">{cfg.column_key}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'data_type',
            header: 'Type',
            cell: ({ row }: any) => <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{row.getValue('data_type')}</span>,
        },
        {
            id: 'properties',
            header: 'Properties',
            cell: ({ row }: any) => {
                const cfg = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleVisible(cfg)} className={`p-1.5 rounded-md transition-colors ${cfg.is_visible ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title={cfg.is_visible ? 'Visible' : 'Hidden'}>{cfg.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${cfg.is_sortable ? 'text-blue-600 bg-blue-50' : 'text-gray-300'}`}><ArrowUpDown className="h-3.5 w-3.5" /></span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${cfg.is_filterable ? 'text-violet-600 bg-violet-50' : 'text-gray-300'}`}><Filter className="h-3.5 w-3.5" /></span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'sort_order',
            header: 'Order',
            cell: ({ row }: any) => <span className="text-xs text-gray-500">{row.getValue('sort_order')}</span>,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const cfg = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(cfg)} title="Edit"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(cfg.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Table Configurations" />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Table Column Configurations</h1>
                    <p className="text-sm text-muted-foreground mt-1">Configure which columns appear in each table.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleResetToDefault} size="sm"><Copy className="h-3.5 w-3.5 mr-1.5" /> Reset</Button>
                    <Button onClick={openAdd} size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Column</Button>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Label className="text-sm font-medium shrink-0">Table:</Label>
                <div className="flex gap-1.5 flex-wrap">
                    {tables.map((table) => (
                        <button key={table} onClick={() => handleTableChange(table)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTable === table ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{table}</button>
                    ))}
                </div>
            </div>
            {configurations.length === 0 ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <Settings className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No columns configured</p>
                    <Button onClick={openAdd} variant="default" className="mt-4"><Plus className="h-4 w-4 mr-1.5" /> Add Your First Column</Button>
                </div>
            ) : (
                <DataTable columns={columns} data={configurations} hideToolbar onBatchDelete={handleBatchDelete} />
            )}
            <ColumnFormModal open={modalOpen} onClose={closeModal} config={editingConfig} tableName={currentTable} existingConfigs={configurations} />
        </div>
    );
}

TableConfigurationIndex.layout = {
    breadcrumbs: [
        { title: 'Master Data', href: '/master-data' },
        { title: 'Table Configurations', href: '#' },
    ],
};
