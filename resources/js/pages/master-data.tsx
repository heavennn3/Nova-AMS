import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Settings, Columns, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { sitesTab, vendorsTab } from './MasterData/tabConfigs';
import SparePartSection from './MasterData/SparePartSection';
import AssetSection from './MasterData/AssetSection';
import LicenseSection from './MasterData/LicenseSection';

type MasterDataProps = {
    categories: any[];
    types: any[];
    sites: any[];
    vendors: any[];
    customTypes: any[];
    licenses: any[];
    tableConfigurations?: Record<string, any[]>;
    assetStatuses?: { id: number; name: string; color: string; sort_order: number }[];
    sparePartCategories?: any[];
    spareParts?: any[];
    assetTypes?: any[];
    assetTableConfigs?: any;
    sparePartTableConfigs?: any;
    licenseTableConfigs?: any;
    isAdmin?: boolean;
};

type TabType = string;

export default function MasterData({
    categories = [], types = [], sites = [], vendors = [],
    customTypes = [], licenses = [], tableConfigurations = {},
    isAdmin = false, assetStatuses = [], sparePartCategories = [],
    spareParts = [], assetTypes = [],
    assetTableConfigs = {}, sparePartTableConfigs = {}, licenseTableConfigs = {},
}: MasterDataProps) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const defaultTab = urlParams.get('tab') || 'sites';

    const [activeTab, setActiveTab] = useState<TabType>(defaultTab as TabType);
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



    // Site region filter
    const [siteRegionFilter, setSiteRegionFilter] = useState('all');
    const filteredSites = siteRegionFilter === 'all'
        ? sites
        : sites.filter((s: any) => s.region?.toLowerCase() === siteRegionFilter);


    const [batchField, setBatchField] = useState('');
    const [batchValue, setBatchValue] = useState('');

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item, asset_category_id: item.asset_category_id?.toString() || '' });
        } else {
            setFormData({ custom_master_data_type_id: customTypes.find((ct: any) => ct.slug === activeTab)?.id });
        }
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        const builtinTabs = ['sites', 'categories', 'types', 'vendors', 'licenses', 'asset-statuses'];
        const typeName = builtinTabs.includes(activeTab) ? activeTab.slice(0, -1) : 'item';
        if (!confirm(`Are you sure you want to delete this ${typeName}?`)) return;
        let url = `/master-data/${activeTab}/${id}`;
        if (!builtinTabs.includes(activeTab)) url = `/master-data/custom-values/${id}`;
        router.delete(url, { preserveScroll: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const builtinTabs = ['sites', 'categories', 'types', 'vendors', 'licenses', 'asset-statuses'];
        let url = `/master-data/${activeTab}`;
        if (!builtinTabs.includes(activeTab)) url = `/master-data/custom-values`;
        if (editingItem) url = `${url}/${editingItem.id}`;
        router[editingItem ? 'put' : 'post'](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const handleTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingType ? `/master-data/custom-types/${editingType.id}` : `/master-data/custom-types`;
        router[editingType ? 'put' : 'post'](url, typeFormData, {
            preserveScroll: true,
            onSuccess: () => setIsManageTypesOpen(false),
        });
    };

    const handleTypeDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this custom master data type and all its values?')) return;
        router.delete(`/master-data/custom-types/${id}`, { preserveScroll: true });
    };

    const handleColumnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingColumn ? `/master-data/custom-columns/${editingColumn.id}` : `/master-data/custom-columns`;
        const method = editingColumn ? 'put' : 'post';
        const payload = { ...columnFormData, custom_master_data_type_id: columnTypeId };
        if (payload.options && typeof payload.options === 'string') payload.options = payload.options.split(',').map((s: string) => s.trim()).filter(Boolean);
        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => { setEditingColumn(null); setColumnFormData({ data_type: 'text', sort_order: 0 }); },
        });
    };

    const handleColumnDelete = (id: number) => {
        if (!confirm('Delete this column? Existing data for this field will not be removed.')) return;
        router.delete(`/master-data/custom-columns/${id}`, { preserveScroll: true });
    };

    const toggleRow = (id: number) => {
        setSelectedRows(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    };

    const toggleAllRows = (ids: number[]) => {
        setSelectedRows(prev => ids.every(id => prev.has(id)) ? new Set() : new Set(ids));
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
            ids: Array.from(selectedRows), field: batchField, value: batchValue,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedRows(new Set()); setIsBatchEditOpen(false); setBatchField(''); setBatchValue(''); },
        });
    };

    // Build tab config
    const sharedOpts = { formData, setFormData, handleOpenDialog, handleDelete, isAdmin, assetStatuses, sparePartCategories };
    const tabConfig: Record<string, any> = {
        sites: sitesTab({ ...sharedOpts, filteredSites }),
        vendors: vendorsTab({ ...sharedOpts, vendors }),
        licenses: { title: 'Software License', isComposite: true },
        asset: { title: 'Asset', isComposite: true },
        'spare-part': { title: 'Spare Part', isComposite: true },
    };

    // Build dynamic tabs for custom master data types
    customTypes.forEach((cType: any) => {
        const typeColumns = cType.columns || [];
        const dynamicColumns: any[] = [
            {
                id: 'select', header: ({ table }: any) => {
                    const allIds = (cType.values || []).map((v: any) => v.id);
                    return <Checkbox checked={allIds.length > 0 && allIds.every((id: number) => selectedRows.has(id))} onCheckedChange={() => toggleAllRows(allIds)} />;
                }, cell: ({ row }: any) => <Checkbox checked={selectedRows.has(row.original.id)} onCheckedChange={() => toggleRow(row.original.id)} />, size: 40
            },
        ];
        typeColumns.forEach((col: any) => {
            dynamicColumns.push({
                accessorKey: `data.${col.slug}`,
                header: ({ column }: any) => <DataTableColumnHeader column={column} title={col.name} />,
                cell: ({ row }: any) => {
                    const v = row.original.data?.[col.slug];
                    if (col.data_type === 'boolean') return <span>{v ? 'Yes' : 'No'}</span>;
                    return <span className="text-sm">{v ?? '—'}</span>;
                },
            });
        });
        if (isAdmin) {
            dynamicColumns.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => (
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600" onClick={() => handleOpenDialog({ ...row.original, ...{ custom_master_data_type_id: cType.id } })}>
                            <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDelete(row.original.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                    </div>
                ),
            });
        }

        tabConfig[cType.slug] = {
            title: cType.name,
            data: cType.values || [],
            columns: dynamicColumns,
            isCustom: true,
            typeId: cType.id,
            typeColumns,
            renderForm: () => {
                const dataState = formData.data || {};
                const setDataField = (slug: string, value: any) => setFormData({ ...formData, custom_master_data_type_id: cType.id, data: { ...dataState, [slug]: value } });
                return (
                    <>
                        {typeColumns.length === 0 && <div className="text-sm text-muted-foreground italic py-4 text-center">No columns defined yet. Click "Manage Columns" to add some.</div>}
                        {typeColumns.map((col: any) => (
                            <div key={col.id} className="grid gap-2">
                                <Label>{col.name} {col.is_required && <span className="text-rose-500">*</span>}</Label>
                                {col.data_type === 'text' && <Input value={dataState[col.slug] || ''} onChange={(e) => setDataField(col.slug, e.target.value)} required={col.is_required} />}
                                {col.data_type === 'number' && <Input type="number" value={dataState[col.slug] ?? ''} onChange={(e) => setDataField(col.slug, e.target.value ? Number(e.target.value) : '')} required={col.is_required} />}
                                {col.data_type === 'date' && <Input type="date" value={dataState[col.slug] || ''} onChange={(e) => setDataField(col.slug, e.target.value)} required={col.is_required} />}
                                {col.data_type === 'boolean' && <div className="flex items-center gap-2"><Checkbox checked={!!dataState[col.slug]} onCheckedChange={(v) => setDataField(col.slug, !!v)} /><span className="text-sm">{dataState[col.slug] ? 'Yes' : 'No'}</span></div>}
                                {col.data_type === 'select' && (
                                    <Select value={dataState[col.slug] || ''} onValueChange={(v) => setDataField(col.slug, v)}>
                                        <SelectTrigger><SelectValue placeholder={`Select ${col.name}...`} /></SelectTrigger>
                                        <SelectContent>{(col.options || []).map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
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
                <div><h1 className="text-3xl font-bold tracking-tight text-foreground">Master Data</h1></div>
                <div className="flex items-center gap-3">
                    {isAdmin && <Button variant="outline" onClick={() => { setEditingType(null); setTypeFormData({}); setIsManageTypesOpen(true); }}>Manage Custom Types</Button>}
                </div>
            </div>

            <div className="flex w-full space-x-2 overflow-x-auto border-b border-border pb-1">
                {(Object.keys(tabConfig) as TabType[]).map((tab) => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setSelectedRows(new Set()); }}
                        className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'}`}>
                        {tabConfig[tab].title}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">{currentTab.title} List</h2>
                        {activeTab === 'sites' && (
                            <div className="flex items-center gap-1.5 bg-background rounded-lg p-0.5 border shadow-sm">
                                {[{ value: 'all', label: 'All' }, { value: 'sabah', label: 'Sabah' }, { value: 'sarawak', label: 'Sarawak' }].map((opt) => (
                                    <button key={opt.value} onClick={() => setSiteRegionFilter(opt.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${siteRegionFilter === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isCustomTab && isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => { setColumnTypeId(activeCustomType?.id); setEditingColumn(null); setColumnFormData({ data_type: 'text', sort_order: 0 }); setIsColumnsOpen(true); }}>
                                <Columns className="mr-2 h-4 w-4" /> Manage Columns
                            </Button>
                        )}
                        {currentTab?.isLicenseTab && (
                            <Button variant="outline" size="sm" onClick={() => setIsLicenseColsOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" /> Manage Columns
                            </Button>
                        )}
                        {isAdmin && <Button onClick={() => handleOpenDialog()} size="sm"><Plus className="mr-2 h-4 w-4" /> Add New</Button>}
                    </div>
                </div>

                {isCustomTab && selectedRows.size > 0 && (
                    <div className="flex items-center gap-3 bg-primary/5 border-b px-4 py-2">
                        <span className="text-sm font-medium">{selectedRows.size} row(s) selected</span>
                        <Button variant="outline" size="sm" onClick={() => { setIsBatchEditOpen(true); setBatchField(''); setBatchValue(''); }}><Edit className="mr-1 h-3 w-3" /> Batch Edit</Button>
                        <Button variant="destructive" size="sm" onClick={handleBatchDelete}><Trash2 className="mr-1 h-3 w-3" /> Batch Delete</Button>
                    </div>
                )}

                {currentTab?.isComposite ? (
                    <div className="p-4">
                        {activeTab === 'spare-part' ? (
                            <SparePartSection
                                spareParts={spareParts}
                                sites={sites}
                                sparePartCategories={sparePartCategories}
                                assetTypes={assetTypes}
                                sparePartTableConfigs={sparePartTableConfigs}
                                isAdmin={isAdmin}
                            />
                        ) : activeTab === 'asset' ? (
                            <AssetSection
                                categories={categories}
                                types={types}
                                assetStatuses={assetStatuses}
                                assetTableConfigs={assetTableConfigs}
                                sites={sites}
                                isAdmin={isAdmin}
                            />
                        ) : (
                            <LicenseSection
                                licenses={licenses}
                                sites={sites}
                                licenseTableConfigs={licenseTableConfigs}
                                isAdmin={isAdmin}
                            />
                        )}
                    </div>
                ) : (
                    <div className="p-4">
                        <DataTable columns={currentTab.columns} data={currentTab.data} hideToolbar />
                    </div>
                )}
            </div>

            {/* Add/Edit Record Dialog — skip for composite tabs */}
            {currentTab && !currentTab.isComposite && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add New'} {currentTab.title.replace(/s$/, '')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            {currentTab.renderForm()}
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                {isAdmin && <Button type="submit">Save Changes</Button>}
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Manage Custom Types Dialog */}
            <Dialog open={isManageTypesOpen} onOpenChange={setIsManageTypesOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>Manage Custom Master Data Types</DialogTitle></DialogHeader>
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
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingType(type); setTypeFormData(type); }}><Edit className="h-3 w-3 text-blue-600" /></Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50" onClick={() => handleTypeDelete(type.id)}><Trash2 className="h-3 w-3 text-red-600" /></Button>
                                        </div>
                                    </li>
                                ))}
                                {customTypes.length === 0 && <div className="text-sm text-muted-foreground italic">No custom types created yet.</div>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">{editingType ? 'Edit Type' : 'Create New Type'}</h3>
                            <form onSubmit={handleTypeSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Type Name</Label>
                                    <Input value={typeFormData.name || ''} onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })} placeholder="e.g., Cost Centers" required />
                                    <p className="text-xs text-muted-foreground">The tab name that will appear in the UI.</p>
                                </div>
                                <div className="grid gap-2"><Label>Description</Label><Input value={typeFormData.description || ''} onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })} /></div>
                                <div className="flex gap-2 justify-end mt-4">
                                    {editingType && <Button type="button" variant="ghost" onClick={() => { setEditingType(null); setTypeFormData({}); }}>Cancel Edit</Button>}
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
                    <DialogHeader><DialogTitle>Manage Columns</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="border-r pr-6">
                            <h3 className="font-semibold mb-3">Existing Columns</h3>
                            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                                {(activeCustomType?.columns || []).map((col: any) => (
                                    <li key={col.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                        <div>
                                            <div className="font-medium text-sm">{col.name}</div>
                                            <div className="text-xs text-muted-foreground">{col.data_type} {col.is_required && '· required'} {col.options?.length > 0 && `· ${col.options.length} options`}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setEditingColumn(col); setColumnFormData({ ...col, options: col.options ? col.options.join(', ') : '' }); }}><Edit className="h-3 w-3 text-blue-600" /></Button>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50" onClick={() => handleColumnDelete(col.id)}><Trash2 className="h-3 w-3 text-red-600" /></Button>
                                        </div>
                                    </li>
                                ))}
                                {(!activeCustomType?.columns || activeCustomType.columns.length === 0) && <div className="text-sm text-muted-foreground italic">No columns defined yet.</div>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">{editingColumn ? 'Edit Column' : 'Add New Column'}</h3>
                            <form onSubmit={handleColumnSubmit} className="space-y-3">
                                <div className="grid gap-1.5"><Label className="text-xs">Column Name</Label><Input value={columnFormData.name || ''} onChange={(e) => setColumnFormData({ ...columnFormData, name: e.target.value })} placeholder="e.g., Department Code" required /></div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs">Data Type</Label>
                                    <Select value={columnFormData.data_type || 'text'} onValueChange={(v) => setColumnFormData({ ...columnFormData, data_type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="date">Date</SelectItem>
                                            <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                                            <SelectItem value="select">Select (Dropdown)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {columnFormData.data_type === 'select' && <div className="grid gap-1.5"><Label className="text-xs">Options (comma-separated)</Label><Input value={columnFormData.options || ''} onChange={(e) => setColumnFormData({ ...columnFormData, options: e.target.value })} placeholder="e.g., Active, Inactive, Pending" /></div>}
                                <div className="grid gap-1.5"><Label className="text-xs">Sort Order</Label><Input type="number" value={columnFormData.sort_order ?? 0} onChange={(e) => setColumnFormData({ ...columnFormData, sort_order: Number(e.target.value) })} /></div>
                                <div className="flex items-center gap-2"><Checkbox checked={!!columnFormData.is_required} onCheckedChange={(v) => setColumnFormData({ ...columnFormData, is_required: !!v })} /><Label className="text-xs">Required Field</Label></div>
                                <div className="flex gap-2 justify-end mt-3">
                                    {editingColumn && <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingColumn(null); setColumnFormData({ data_type: 'text', sort_order: 0 }); }}>Cancel</Button>}
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
                    <DialogHeader><DialogTitle>Batch Edit {selectedRows.size} Record(s)</DialogTitle></DialogHeader>
                    <form onSubmit={handleBatchUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2"><Label>Field to Update</Label>
                            <Select value={batchField} onValueChange={setBatchField}>
                                <SelectTrigger><SelectValue placeholder="Select a field..." /></SelectTrigger>
                                <SelectContent>{(activeCustomType?.columns || []).map((col: any) => <SelectItem key={col.slug} value={col.slug}>{col.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2"><Label>New Value</Label><Input value={batchValue} onChange={(e) => setBatchValue(e.target.value)} placeholder="Enter new value for all selected rows..." /></div>
                        <DialogFooter><Button variant="outline" type="button" onClick={() => setIsBatchEditOpen(false)}>Cancel</Button><Button type="submit" disabled={!batchField}>Apply to {selectedRows.size} Row(s)</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>


        </div>
    );
}

MasterData.layout = {
    breadcrumbs: [{ title: 'Master Data', href: '#' }],
};
