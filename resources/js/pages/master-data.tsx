import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Settings, Columns } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

type MasterDataProps = {
    categories: any[];
    types: any[];
    sites: any[];
    vendors: any[];
    customTypes: any[];
};

type TabType = string;

export default function MasterData({
    categories = [],
    types = [],
    sites = [],
    vendors = [],
    customTypes = [],
}: MasterDataProps) {
    const [activeTab, setActiveTab] = useState<TabType>('sites');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    
    // Manage Custom Types
    const [isManageTypesOpen, setIsManageTypesOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [typeFormData, setTypeFormData] = useState<any>({});
    
    // Manage Columns
    const [isColumnsOpen, setIsColumnsOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState<any>(null);
    const [columnFormData, setColumnFormData] = useState<any>({});
    const [columnTypeId, setColumnTypeId] = useState<number | null>(null);
    
    // Batch operations
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
    const [batchField, setBatchField] = useState('');
    const [batchValue, setBatchValue] = useState('');

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({
                ...item,
                asset_category_id: item.asset_category_id?.toString() || '',
            });
        } else {
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        const typeName = ['sites', 'categories', 'types', 'vendors'].includes(activeTab) 
            ? activeTab.slice(0, -1) 
            : 'item';
            
        if (!confirm(`Are you sure you want to delete this ${typeName}?`)) return;
        
        let url = `/master-data/${activeTab}/${id}`;
        if (!['sites', 'categories', 'types', 'vendors'].includes(activeTab)) {
            url = `/master-data/custom-values/${id}`;
        }
        
        router.delete(url, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let url = `/master-data/${activeTab}`;
        if (!['sites', 'categories', 'types', 'vendors'].includes(activeTab)) {
            url = `/master-data/custom-values`;
        }

        if (editingItem) {
            url = `${url}/${editingItem.id}`;
        }

        const method = editingItem ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const handleTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingType
            ? `/master-data/custom-types/${editingType.id}`
            : `/master-data/custom-types`;

        const method = editingType ? 'put' : 'post';

        router[method](url, typeFormData, {
            preserveScroll: true,
            onSuccess: () => setIsManageTypesOpen(false),
        });
    };

    const handleTypeDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this custom master data type and all its values?')) return;
        router.delete(`/master-data/custom-types/${id}`, {
            preserveScroll: true,
        });
    };

    // Column Management
    const handleColumnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingColumn
            ? `/master-data/custom-columns/${editingColumn.id}`
            : `/master-data/custom-columns`;
        const method = editingColumn ? 'put' : 'post';
        const payload = { ...columnFormData, custom_master_data_type_id: columnTypeId };
        if (payload.options && typeof payload.options === 'string') {
            payload.options = payload.options.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => { setEditingColumn(null); setColumnFormData({ data_type: 'text', sort_order: 0 }); },
        });
    };

    const handleColumnDelete = (id: number) => {
        if (!confirm('Delete this column? Existing data for this field will not be removed.')) return;
        router.delete(`/master-data/custom-columns/${id}`, { preserveScroll: true });
    };

    // Batch operations
    const toggleRow = (id: number) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAllRows = (ids: number[]) => {
        setSelectedRows(prev => {
            if (ids.every(id => prev.has(id))) return new Set();
            return new Set(ids);
        });
    };

    const handleBatchDelete = () => {
        if (!confirm(`Are you sure you want to delete ${selectedRows.size} record(s)?`)) return;
        router.post('/master-data/custom-values/batch-delete', { ids: Array.from(selectedRows) }, {
            preserveScroll: true,
            onSuccess: () => setSelectedRows(new Set()),
        });
    };

    const handleBatchUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/master-data/custom-values/batch-update', {
            ids: Array.from(selectedRows),
            field: batchField,
            value: batchValue,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedRows(new Set()); setIsBatchEditOpen(false); setBatchField(''); setBatchValue(''); },
        });
    };

    const actionColumn = {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => (
            <div className="flex items-center space-x-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-blue-600"
                    onClick={() => handleOpenDialog(row.original)}
                >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(row.original.id)}
                >
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
            </div>
        ),
    };

    const tabConfig = {
        sites: {
            title: 'Sites (Locations)',
            data: sites,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'code',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Code" />
                    ),
                },
                {
                    accessorKey: 'region',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Region" />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Code</Label>
                        <Input
                            value={formData.code || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    code: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Region</Label>
                        <Input
                            value={formData.region || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    region: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
        categories: {
            title: 'Asset Categories',
            data: categories,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'description',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Description"
                        />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input
                            value={formData.description || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
        types: {
            title: 'Asset Types',
            data: types,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'category.name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Category"
                        />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category_id || ''}
                            onValueChange={(val) =>
                                setFormData({
                                    ...formData,
                                    category_id: val,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id.toString()}
                                    >
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            ),
        },
        vendors: {
            title: 'Vendors',
            data: vendors,
            columns: [
                {
                    id: 'logo',
                    header: '',
                    cell: ({ row }: any) => {
                        const logo = row.original.logo;
                        return (
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {logo ? (
                                    <img
                                        src={logo}
                                        alt={row.original.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {(row.original.name || '?')[0]}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    size: 60,
                },
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Vendor Name"
                        />
                    ),
                },
                {
                    accessorKey: 'contact_person',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Contact Person"
                        />
                    ),
                },
                {
                    accessorKey: 'phone',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Phone" />
                    ),
                },
                {
                    accessorKey: 'email',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Email" />
                    ),
                },
                {
                    accessorKey: 'assets_count',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Total Assets"
                        />
                    ),
                    cell: ({ row }: any) => {
                        const count = row.original.assets_count ?? 0;
                        return (
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                {count}
                            </span>
                        );
                    },
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Contact Person</Label>
                        <Input
                            value={formData.contact_person || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    contact_person: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input
                            value={formData.phone || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input
                            value={formData.address || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
    };

    // Dynamically inject custom types with dynamic columns
    customTypes.forEach((cType: any) => {
        const typeColumns = cType.columns || [];
        const allIds = (cType.values || []).map((v: any) => v.id);

        const dynamicColumns: any[] = [
            // Selection checkbox column
            {
                id: 'select',
                header: () => (
                    <Checkbox
                        checked={allIds.length > 0 && allIds.every((id: number) => selectedRows.has(id))}
                        onCheckedChange={() => toggleAllRows(allIds)}
                    />
                ),
                cell: ({ row }: any) => (
                    <Checkbox
                        checked={selectedRows.has(row.original.id)}
                        onCheckedChange={() => toggleRow(row.original.id)}
                    />
                ),
                size: 40,
            },
        ];

        // Build columns from definitions
        typeColumns.forEach((col: any) => {
            dynamicColumns.push({
                id: col.slug,
                accessorFn: (row: any) => row.data?.[col.slug],
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title={col.name} />
                ),
                cell: ({ row }: any) => {
                    const val = row.original.data?.[col.slug];
                    if (col.data_type === 'boolean') {
                        return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{val ? 'Yes' : 'No'}</span>;
                    }
                    if (col.data_type === 'date' && val) {
                        return <span className="text-sm">{val}</span>;
                    }
                    return <span className="text-sm">{val ?? '—'}</span>;
                },
            });
        });

        // Action column
        dynamicColumns.push(actionColumn);

        tabConfig[cType.slug] = {
            title: cType.name,
            data: cType.values || [],
            columns: dynamicColumns,
            isCustom: true,
            typeId: cType.id,
            typeColumns: typeColumns,
            renderForm: () => {
                const dataState = formData.data || {};
                const setDataField = (slug: string, value: any) => {
                    setFormData({
                        ...formData,
                        custom_master_data_type_id: cType.id,
                        data: { ...dataState, [slug]: value },
                    });
                };
                return (
                    <>
                        {typeColumns.length === 0 && (
                            <div className="text-sm text-muted-foreground italic py-4 text-center">
                                No columns defined yet. Click "Manage Columns" to add some.
                            </div>
                        )}
                        {typeColumns.map((col: any) => (
                            <div key={col.id} className="grid gap-2">
                                <Label>{col.name} {col.is_required && <span className="text-rose-500">*</span>}</Label>
                                {col.data_type === 'text' && (
                                    <Input
                                        value={dataState[col.slug] || ''}
                                        onChange={(e) => setDataField(col.slug, e.target.value)}
                                        required={col.is_required}
                                    />
                                )}
                                {col.data_type === 'number' && (
                                    <Input
                                        type="number"
                                        value={dataState[col.slug] ?? ''}
                                        onChange={(e) => setDataField(col.slug, e.target.value ? Number(e.target.value) : '')}
                                        required={col.is_required}
                                    />
                                )}
                                {col.data_type === 'date' && (
                                    <Input
                                        type="date"
                                        value={dataState[col.slug] || ''}
                                        onChange={(e) => setDataField(col.slug, e.target.value)}
                                        required={col.is_required}
                                    />
                                )}
                                {col.data_type === 'boolean' && (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={!!dataState[col.slug]}
                                            onCheckedChange={(v) => setDataField(col.slug, !!v)}
                                        />
                                        <span className="text-sm">{dataState[col.slug] ? 'Yes' : 'No'}</span>
                                    </div>
                                )}
                                {col.data_type === 'select' && (
                                    <Select
                                        value={dataState[col.slug] || ''}
                                        onValueChange={(v) => setDataField(col.slug, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${col.name}...`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(col.options || []).map((opt: string) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </>
                );
            },
        };
    });

    const currentTab = tabConfig[activeTab] as any;
    const isCustomTab = currentTab?.isCustom === true;
    const activeCustomType = isCustomTab ? customTypes.find((ct: any) => ct.slug === activeTab) : null;

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Master Data" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Master Data
                    </h1>
                </div>
                <Button variant="outline" onClick={() => {
                    setEditingType(null);
                    setTypeFormData({});
                    setIsManageTypesOpen(true);
                }}>
                    Manage Custom Types
                </Button>
            </div>

            <div className="flex w-full space-x-2 overflow-x-auto border-b border-border pb-1">
                {(Object.keys(tabConfig) as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setSelectedRows(new Set()); }}
                        className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tabConfig[tab].title}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">
                        {currentTab.title} List
                    </h2>
                    <div className="flex items-center gap-2">
                        {isCustomTab && (
                            <Button variant="outline" size="sm" onClick={() => {
                                setColumnTypeId(activeCustomType?.id);
                                setEditingColumn(null);
                                setColumnFormData({ data_type: 'text', sort_order: 0 });
                                setIsColumnsOpen(true);
                            }}>
                                <Columns className="mr-2 h-4 w-4" /> Manage Columns
                            </Button>
                        )}
                        <Button onClick={() => handleOpenDialog()} size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    </div>
                </div>

                {/* Batch Action Bar */}
                {isCustomTab && selectedRows.size > 0 && (
                    <div className="flex items-center gap-3 bg-primary/5 border-b px-4 py-2">
                        <span className="text-sm font-medium">{selectedRows.size} row(s) selected</span>
                        <Button variant="outline" size="sm" onClick={() => { setIsBatchEditOpen(true); setBatchField(''); setBatchValue(''); }}>
                            <Edit className="mr-1 h-3 w-3" /> Batch Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                            <Trash2 className="mr-1 h-3 w-3" /> Batch Delete
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
                            Clear Selection
                        </Button>
                    </div>
                )}

                <div className="p-4">
                    <DataTable
                        columns={currentTab.columns}
                        data={currentTab.data}
                        hideToolbar
                    />
                </div>
            </div>

            {/* Add/Edit Record Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Add New'}{' '}
                            {currentTab.title.replace(/s$/, '')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {currentTab.renderForm()}
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isManageTypesOpen} onOpenChange={setIsManageTypesOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Custom Master Data Types</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="border-r pr-6">
                            <h3 className="font-semibold mb-4">Existing Types</h3>
                            <ul className="space-y-2">
                                {customTypes.map((type: any) => (
                                    <li key={type.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                        <div>
                                            <div className="font-medium">{type.name}</div>
                                            <div className="text-xs text-muted-foreground">{type.slug}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingType(type); setTypeFormData(type); }}>
                                                <Edit className="h-3 w-3 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50" onClick={() => handleTypeDelete(type.id)}>
                                                <Trash2 className="h-3 w-3 text-red-600" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                                {customTypes.length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">No custom types created yet.</div>
                                )}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-4">{editingType ? 'Edit Type' : 'Create New Type'}</h3>
                            <form onSubmit={handleTypeSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Type Name</Label>
                                    <Input
                                        value={typeFormData.name || ''}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                                        placeholder="e.g., Cost Centers"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">The tab name that will appear in the UI.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={typeFormData.description || ''}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end mt-4">
                                    {editingType && (
                                        <Button type="button" variant="ghost" onClick={() => { setEditingType(null); setTypeFormData({}); }}>
                                            Cancel Edit
                                        </Button>
                                    )}
                                    <Button type="submit">{editingType ? 'Update' : 'Create'} Type</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Columns Dialog */}
            <Dialog open={isColumnsOpen} onOpenChange={setIsColumnsOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Columns</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="border-r pr-6">
                            <h3 className="font-semibold mb-3">Existing Columns</h3>
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                                {(activeCustomType?.columns || []).map((col: any) => (
                                    <li key={col.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                        <div>
                                            <div className="font-medium text-sm">{col.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {col.data_type} {col.is_required && '· required'} {col.options?.length > 0 && `· ${col.options.length} options`}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                                                setEditingColumn(col);
                                                setColumnFormData({
                                                    ...col,
                                                    options: col.options ? col.options.join(', ') : '',
                                                });
                                            }}>
                                                <Edit className="h-3 w-3 text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50" onClick={() => handleColumnDelete(col.id)}>
                                                <Trash2 className="h-3 w-3 text-red-600" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                                {(!activeCustomType?.columns || activeCustomType.columns.length === 0) && (
                                    <div className="text-sm text-muted-foreground italic">No columns defined yet.</div>
                                )}
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-3">{editingColumn ? 'Edit Column' : 'Add New Column'}</h3>
                            <form onSubmit={handleColumnSubmit} className="space-y-3">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Column Name</Label>
                                    <Input
                                        value={columnFormData.name || ''}
                                        onChange={(e) => setColumnFormData({ ...columnFormData, name: e.target.value })}
                                        placeholder="e.g., Department Code"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Data Type</Label>
                                    <Select
                                        value={columnFormData.data_type || 'text'}
                                        onValueChange={(v) => setColumnFormData({ ...columnFormData, data_type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                                            <SelectItem value="select">Select (Dropdown)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {columnFormData.data_type === 'select' && (
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Options (comma-separated)</Label>
                                        <Input
                                            value={columnFormData.options || ''}
                                            onChange={(e) => setColumnFormData({ ...columnFormData, options: e.target.value })}
                                            placeholder="e.g., Active, Inactive, Pending"
                                        />
                                    </div>
                                )}
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Sort Order</Label>
                                    <Input
                                        type="number"
                                        value={columnFormData.sort_order ?? 0}
                                        onChange={(e) => setColumnFormData({ ...columnFormData, sort_order: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={!!columnFormData.is_required}
                                        onCheckedChange={(v) => setColumnFormData({ ...columnFormData, is_required: !!v })}
                                    />
                                    <Label className="text-xs">Required Field</Label>
                                </div>
                                <div className="flex gap-2 justify-end mt-3">
                                    {editingColumn && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingColumn(null); setColumnFormData({ data_type: 'text', sort_order: 0 }); }}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" size="sm">{editingColumn ? 'Update' : 'Add'} Column</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Batch Edit Dialog */}
            <Dialog open={isBatchEditOpen} onOpenChange={setIsBatchEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Batch Edit {selectedRows.size} Record(s)</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBatchUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Field to Update</Label>
                            <Select value={batchField} onValueChange={setBatchField}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a field..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {(activeCustomType?.columns || []).map((col: any) => (
                                        <SelectItem key={col.slug} value={col.slug}>{col.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>New Value</Label>
                            <Input
                                value={batchValue}
                                onChange={(e) => setBatchValue(e.target.value)}
                                placeholder="Enter new value for all selected rows..."
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsBatchEditOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={!batchField}>Apply to {selectedRows.size} Row(s)</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

MasterData.layout = {
    breadcrumbs: [
        {
            title: 'Master Data',
            href: '#',
        },
    ],
};
