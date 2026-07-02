import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Eye,
    EyeOff,
    GripVertical,
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

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function SortableRow({ config, index, onEdit, onDelete, onToggleVisible }: {
    config: TableConfiguration;
    index: number;
    onEdit: (c: TableConfiguration) => void;
    onDelete: (id: number) => void;
    onToggleVisible: (c: TableConfiguration) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: config.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const typeIcon = DATA_TYPES.find(d => d.value === config.data_type);
    const isEven = index % 2 === 0;

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`border-b transition-colors ${isEven ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30`}
        >
            <td className="p-2 pl-3 w-10">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing touch-none"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
            </td>
            <td className="p-2">
                <div className="flex items-center gap-2.5">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${config.is_primary_key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {typeIcon?.icon || '?'}
                    </span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm">{config.column_title}</span>
                            {config.is_primary_key && (
                            <span title="Primary Key"><KeyRound className="h-3 w-3 text-amber-500" /></span>
                            )}
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">{config.column_key}</span>
                    </div>
                </div>
            </td>
            <td className="p-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                    {config.data_type}
                </span>
            </td>
            <td className="p-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggleVisible(config)}
                        className={`p-1.5 rounded-md transition-colors ${config.is_visible
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                        title={config.is_visible ? 'Visible' : 'Hidden'}
                    >
                        {config.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${config.is_sortable ? 'text-blue-600 bg-blue-50' : 'text-gray-300'}`}>
                        <ArrowUpDown className="h-3 w-3 inline" />
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${config.is_filterable ? 'text-violet-600 bg-violet-50' : 'text-gray-300'}`}>
                        <Filter className="h-3 w-3 inline" />
                    </span>
                </div>
            </td>
            <td className="p-2 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(config)} title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(config.id)}
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function ToggleOption({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
            </button>
            <span className="text-sm cursor-pointer select-none" onClick={() => onChange(!checked)}>{label}</span>
        </div>
    );
}

function ColumnFormModal({
    open,
    onClose,
    config,
    tableName,
    existingConfigs = [],
}: {
    open: boolean;
    onClose: () => void;
    config: TableConfiguration | null;
    tableName: string;
    existingConfigs?: TableConfiguration[];
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
    const [optionsText, setOptionsText] = useState(
        config?.options ? JSON.stringify(config.options, null, 2) : ''
    );

    useEffect(() => {
        if (!open) {
            reset();
            setAutoSlug(true);
            setOptionsText('');
        }
        // When editing, populate form from config
        if (config && open) {
            setData({
                table_name: config.table_name,
                column_key: config.column_key,
                column_title: config.column_title,
                data_type: config.data_type,
                data_source: config.data_source || '',
                is_primary_key: config.is_primary_key,
                is_sortable: config.is_sortable,
                is_filterable: config.is_filterable,
                is_visible: config.is_visible,
                sort_order: config.sort_order,
                alignment: config.alignment,
                width: config.width,
                options: config.options || {},
            });
            setOptionsText(config.options ? JSON.stringify(config.options, null, 2) : '');
        }
        // Reset with defaults when creating
        if (!config && open) {
            setData({
                table_name: tableName,
                column_key: '',
                column_title: '',
                data_type: 'string',
                data_source: '',
                is_primary_key: false,
                is_sortable: true,
                is_filterable: true,
                is_visible: true,
                sort_order: 0,
                alignment: 'left',
                width: null,
                options: {},
            });
            setOptionsText('');
        }
    }, [open, config?.id]);

    const handleTitleChange = (title: string) => {
        setData('column_title', title);
        if (autoSlug && !isEditing) {
            setData('column_key', slugify(title));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse options if provided
        let parsedOptions = {};
        if (optionsText.trim()) {
            try {
                parsedOptions = JSON.parse(optionsText);
            } catch {
                toast.error('Invalid JSON in options field');
                return;
            }
        }

        // Check for duplicate column_key on create
        if (!isEditing) {
            const existingKey = existingConfigs.find(
                (c) => c.column_key === data.column_key && c.table_name === data.table_name
            );
            if (existingKey) {
                toast.error(`Column key "${data.column_key}" already exists for this table`);
                return;
            }
        }

        // Set max sort_order if creating
        const submitData = {
            ...data,
            options: parsedOptions,
            sort_order: isEditing ? data.sort_order : undefined,
        };

        if (isEditing) {
            put(`/master-data/table-configurations/${config!.id}`, {
                ...submitData,
                onSuccess: () => {
                    toast.success('Column updated');
                    onClose();
                    router.reload({ only: ['configurations'] });
                },
                onError: () => toast.error('Failed to update column'),
            });
        } else {
            post('/master-data/table-configurations', {
                ...submitData,
                onSuccess: () => {
                    toast.success('Column added');
                    onClose();
                    router.reload({ only: ['configurations'] });
                },
                onError: () => toast.error('Failed to add column'),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Column' : 'Add Column'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Configuring "${config?.column_title}"` : 'Configure a new column for this table'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3 space-y-1.5">
                            <Label htmlFor="column_title">Column Title</Label>
                            <Input
                                id="column_title"
                                value={data.column_title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="e.g. Asset Tag"
                                required
                                autoFocus={!isEditing}
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                            <Label htmlFor="data_type">Data Type</Label>
                            <Select value={data.data_type} onValueChange={(v) => setData('data_type', v)}>
                                <SelectTrigger id="data_type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DATA_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            <span className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold">{t.icon}</span>
                                                {t.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="column_key">
                            Column Key
                            <span className="text-gray-400 font-normal ml-1">(internal identifier)</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="column_key"
                                value={data.column_key}
                                onChange={(e) => {
                                    setData('column_key', e.target.value);
                                    setAutoSlug(false);
                                }}
                                placeholder="e.g. asset_tag"
                                className="font-mono text-sm"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                                onClick={() => {
                                    setData('column_key', slugify(data.column_title));
                                    setAutoSlug(true);
                                }}
                                title="Auto-generate from title"
                            >
                                ↻ Auto
                            </Button>
                        </div>
                        {errors.column_key && (
                            <p className="text-xs text-red-500 mt-1">{errors.column_key}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Alignment</Label>
                            <Select value={data.alignment} onValueChange={(v) => setData('alignment', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">← Left</SelectItem>
                                    <SelectItem value="center">↔ Center</SelectItem>
                                    <SelectItem value="right">→ Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Width (px)</Label>
                            <Input
                                type="number"
                                min={50}
                                max={500}
                                step={10}
                                value={data.width ?? ''}
                                onChange={(e) => setData('width', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Auto"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <ToggleOption checked={data.is_visible} onChange={(v) => setData('is_visible', v)} label="Visible" />
                        <ToggleOption checked={data.is_sortable} onChange={(v) => setData('is_sortable', v)} label="Sortable" />
                        <ToggleOption checked={data.is_filterable} onChange={(v) => setData('is_filterable', v)} label="Filterable" />
                        <ToggleOption checked={data.is_primary_key} onChange={(v) => setData('is_primary_key', v)} label="Primary Key" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="options">
                            Options{' '}
                            <span className="text-gray-400 font-normal">(JSON, for enum values etc.)</span>
                        </Label>
                        <textarea
                            id="options"
                            value={optionsText}
                            onChange={(e) => setOptionsText(e.target.value)}
                            placeholder='["option1", "option2"]'
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save Changes' : 'Add Column'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function TableConfigurationIndex({
    configurations,
    currentTable,
    tables,
}: IndexProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<TableConfiguration | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleTableChange = (tableName: string) => {
        router.get(`/master-data/table-configurations?tableName=${tableName}`);
    };

    const openAdd = () => {
        setEditingConfig(null);
        setModalOpen(true);
    };

    const openEdit = (config: TableConfiguration) => {
        setEditingConfig(config);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingConfig(null);
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this column? It will be removed from the table view.')) {
            router.delete(`/master-data/table-configurations/${id}`, {
                onSuccess: () => toast.success('Column deleted'),
                preserveScroll: true,
            });
        }
    };

    const handleToggleVisible = (config: TableConfiguration) => {
        router.put(
            `/master-data/table-configurations/${config.id}`,
            { ...config, is_visible: !config.is_visible },
            { preserveScroll: true }
        );
    };

    const handleResetToDefault = () => {
        if (confirm('Reset this table to default columns? All custom changes will be lost.')) {
            router.post(`/master-data/table-configurations/reset-to-default/${currentTable}`, {}, {
                onSuccess: () => toast.success('Reset to defaults'),
                preserveScroll: true,
            });
        }
    };

    const handleDragEnd = useCallback((event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = configurations.findIndex((c) => c.id === active.id);
        const newIndex = configurations.findIndex((c) => c.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(configurations, oldIndex, newIndex);
        const columns = reordered.map((c, i) => ({ id: c.id, sort_order: i }));

        router.post('/master-data/table-configurations/update-order', { columns }, {
            preserveScroll: true,
        });
    }, [configurations]);

    const hasConfigs = configurations.length > 0;
    const idList = useMemo(() => configurations.map(c => c.id), [configurations]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Table Configurations" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Table Column Configurations</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Drag rows to reorder · Toggle visibility with the eye icon
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleResetToDefault} size="sm">
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Reset
                    </Button>
                    <Button onClick={openAdd} size="sm">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add Column
                    </Button>
                </div>
            </div>

            {/* Table selector */}
            <div className="flex items-center gap-3">
                <Label className="text-sm font-medium shrink-0">Table:</Label>
                <div className="flex gap-1.5 flex-wrap">
                    {tables.map((table) => (
                        <button
                            key={table}
                            onClick={() => handleTableChange(table)}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTable === table
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {table}
                        </button>
                    ))}
                </div>
            </div>

            {/* Config table */}
            {!hasConfigs ? (
                <div className="rounded-lg border bg-card p-12 text-center">
                    <Settings className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No columns configured</p>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Add your first column to start building the table layout</p>
                    <Button onClick={openAdd} variant="default">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Your First Column
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={idList} strategy={verticalListSortingStrategy}>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50/80">
                                        <th className="p-2 pl-3 w-10"></th>
                                        <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Column</th>
                                        <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Type</th>
                                        <th className="p-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Properties</th>
                                        <th className="p-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configurations.map((config, index) => (
                                        <SortableRow
                                            key={config.id}
                                            config={config}
                                            index={index}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                            onToggleVisible={handleToggleVisible}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            <ColumnFormModal
                open={modalOpen}
                onClose={closeModal}
                config={editingConfig}
                tableName={currentTable}
                existingConfigs={configurations}
            />
        </div>
    );
}

TableConfigurationIndex.layout = {
    breadcrumbs: [
        { title: 'Master Data', href: '/master-data' },
        { title: 'Table Configurations', href: '#' },
    ],
};
