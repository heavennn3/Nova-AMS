import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Settings, Columns, Eye, EyeOff, Table, Copy, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
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
    licenses: any[];
    tableConfigurations?: any[];
    configurationTables?: string[];
    currentConfigTable?: string;
};

type TabType = string;

const LICENSE_COL_KEYS = [
    'name', 'product_key', 'version', 'category', 'license_type',
    'pricing_model', 'seats', 'purchase_cost', 'vendor', 'site',
    'expiration_date', 'compliance_status', 'license_email', 'notes',
] as const;

const LICENSE_COL_LABELS: Record<string, string> = {
    name: 'Name',
    product_key: 'Product Key',
    version: 'Version',
    category: 'Category',
    license_type: 'License Type',
    pricing_model: 'Pricing Model',
    seats: 'Seats',
    purchase_cost: 'Cost',
    vendor: 'Vendor',
    site: 'Site',
    expiration_date: 'Expiry Date',
    compliance_status: 'Status',
    license_email: 'License Email',
    notes: 'Notes',
};

function loadLicenseColVisibility(): Record<string, boolean> {
    try {
        const saved = localStorage.getItem('masterdata_license_cols');
        if (saved) return JSON.parse(saved);
    } catch {}
    // Default: show key columns, hide less important ones
    return {
        name: true, product_key: true, version: true, category: true,
        license_type: true, pricing_model: false, seats: true,
        purchase_cost: true, vendor: true, site: true,
        expiration_date: true, compliance_status: true,
        license_email: false, notes: false,
    };
}

export default function MasterData({
    categories = [],
    types = [],
    sites = [],
    vendors = [],
    customTypes = [],
    licenses = [],
    tableConfigurations = [],
    configurationTables = [],
    currentConfigTable = 'assets',
}: MasterDataProps) {
    // Read tab from URL query params
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

    // License column visibility
    const [licenseColVisibility, setLicenseColVisibility] = useState<Record<string, boolean>>(loadLicenseColVisibility);
    
    // Table config tab state
    const [configSelectedTable, setConfigSelectedTable] = useState(currentConfigTable);
    const [configSelectedColumns, setConfigSelectedColumns] = useState<Set<number>>(new Set());
    const [configDraggedId, setConfigDraggedId] = useState<number | null>(null);
    const [isLicenseColsOpen, setIsLicenseColsOpen] = useState(false);

    // Site region filter
    const [siteRegionFilter, setSiteRegionFilter] = useState('all');
    const filteredSites = siteRegionFilter === 'all'
        ? sites
        : sites.filter((s: any) => s.region?.toLowerCase() === siteRegionFilter);

    const toggleLicenseCol = (key: string) => {
        setLicenseColVisibility(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem('masterdata_license_cols', JSON.stringify(next));
            return next;
        });
    };
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
        const builtinTabs = ['sites', 'categories', 'types', 'vendors', 'licenses'];
        const typeName = builtinTabs.includes(activeTab) 
            ? activeTab.slice(0, -1) 
            : 'item';
            
        if (!confirm(`Are you sure you want to delete this ${typeName}?`)) return;
        
        let url = `/master-data/${activeTab}/${id}`;
        if (!builtinTabs.includes(activeTab)) {
            url = `/master-data/custom-values/${id}`;
        }
        
        router.delete(url, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const builtinTabs = ['sites', 'categories', 'types', 'vendors', 'licenses'];
        let url = `/master-data/${activeTab}`;
        if (!builtinTabs.includes(activeTab)) {
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
            data: filteredSites,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                    cell: ({ row }: any) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-sm font-bold text-blue-600">
                                {(row.original.name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="font-medium">{row.original.name}</div>
                                {row.original.code && (
                                    <div className="text-xs text-muted-foreground font-mono">{row.original.code}</div>
                                )}
                            </div>
                        </div>
                    ),
                },
                {
                    accessorKey: 'region',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Region" />
                    ),
                    cell: ({ row }: any) => {
                        const region = row.original.region;
                        if (!region) return <span className="text-xs text-muted-foreground italic">Not set</span>;
                        const isSabah = region.toLowerCase() === 'sabah';
                        return (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                isSabah
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isSabah ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {region.charAt(0).toUpperCase() + region.slice(1)}
                            </span>
                        );
                    },
                },
                actionColumn,
            ],
            renderForm: () => (
                <div className="space-y-5">
                    <div className="grid gap-2">
                        <Label className="text-sm font-medium">
                            Site Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Kota Kinabalu"
                            required
                            className="h-10"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">Code</Label>
                            <Input
                                value={formData.code || ''}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. KK-01"
                                className="h-10 font-mono"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-sm font-medium">
                                Region <span className="text-rose-500">*</span>
                            </Label>
                            <Select
                                value={formData.region || ''}
                                onValueChange={(val) => setFormData({ ...formData, region: val })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sabah">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                            Sabah
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="sarawak">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                            Sarawak
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
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
        licenses: {
            title: 'Software License',
            data: licenses,
            isLicenseTab: true,
            columns: (() => {
                const cols: any[] = [];

                if (licenseColVisibility.name) cols.push({
                    accessorKey: 'name',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Name" />,
                    cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span>,
                });
                if (licenseColVisibility.product_key) cols.push({
                    accessorKey: 'product_key',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Product Key" />,
                    cell: ({ row }: any) => (
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {row.original.product_key ? '••••' + row.original.product_key.slice(-4) : '—'}
                        </span>
                    ),
                });
                if (licenseColVisibility.version) cols.push({
                    accessorKey: 'version',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Version" />,
                    cell: ({ row }: any) => <span className="text-sm">{row.original.version || '—'}</span>,
                });
                if (licenseColVisibility.category) cols.push({
                    accessorKey: 'category',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Category" />,
                    cell: ({ row }: any) => <span className="text-sm">{row.original.category || '—'}</span>,
                });
                if (licenseColVisibility.license_type) cols.push({
                    accessorKey: 'license_type',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Type" />,
                    cell: ({ row }: any) => {
                        const t = row.original.license_type;
                        const labels: Record<string, string> = {
                            per_user: 'Per User', per_device: 'Per Device',
                            concurrent: 'Concurrent', subscription: 'Subscription', perpetual: 'Perpetual',
                        };
                        return <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize">{labels[t] || t || '—'}</span>;
                    },
                });
                if (licenseColVisibility.pricing_model) cols.push({
                    accessorKey: 'pricing_model',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Pricing" />,
                    cell: ({ row }: any) => <span className="text-sm capitalize">{(row.original.pricing_model || '').replace('_', ' ') || '—'}</span>,
                });
                if (licenseColVisibility.seats) cols.push({
                    id: 'seats',
                    header: 'Seats',
                    cell: ({ row }: any) => (
                        <span className="text-sm tabular-nums">
                            <span className="font-semibold">{row.original.used_seats ?? 0}</span>
                            <span className="text-muted-foreground"> / {row.original.total_seats ?? 0}</span>
                        </span>
                    ),
                });
                if (licenseColVisibility.purchase_cost) cols.push({
                    accessorKey: 'purchase_cost',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Cost" />,
                    cell: ({ row }: any) => {
                        const c = row.original.purchase_cost;
                        return <span className="text-sm tabular-nums">{c ? `$${Number(c).toLocaleString()}` : '—'}</span>;
                    },
                });
                if (licenseColVisibility.vendor) cols.push({
                    accessorKey: 'vendor',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Vendor" />,
                    cell: ({ row }: any) => <span className="text-sm">{row.original.vendor || '—'}</span>,
                });
                if (licenseColVisibility.site) cols.push({
                    accessorKey: 'site',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Site" />,
                    cell: ({ row }: any) => <span className="text-sm">{row.original.site || '—'}</span>,
                });
                if (licenseColVisibility.expiration_date) cols.push({
                    accessorKey: 'expiration_date',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Expiry" />,
                    cell: ({ row }: any) => {
                        const d = row.original.expiration_date;
                        if (!d) return <span className="text-sm text-muted-foreground">—</span>;
                        const isExpired = new Date(d) < new Date();
                        return <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>{d}</span>;
                    },
                });
                if (licenseColVisibility.compliance_status) cols.push({
                    accessorKey: 'compliance_status',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Status" />,
                    cell: ({ row }: any) => {
                        const s = row.original.compliance_status;
                        const colors: Record<string, string> = {
                            compliant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            over_licensed: 'bg-amber-50 text-amber-700 border-amber-200',
                            under_licensed: 'bg-red-50 text-red-700 border-red-200',
                            expired: 'bg-slate-50 text-slate-700 border-slate-200',
                        };
                        return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${colors[s] || ''}`}>{(s || '').replace('_', ' ') || '—'}</span>;
                    },
                });
                if (licenseColVisibility.license_email) cols.push({
                    accessorKey: 'license_email',
                    header: ({ column }: any) => <DataTableColumnHeader column={column} title="Email" />,
                    cell: ({ row }: any) => <span className="text-sm">{row.original.license_email || '—'}</span>,
                });
                if (licenseColVisibility.notes) cols.push({
                    accessorKey: 'notes',
                    header: 'Notes',
                    cell: ({ row }: any) => <span className="text-sm text-muted-foreground truncate max-w-[200px] block">{row.original.notes || '—'}</span>,
                });

                cols.push(actionColumn);
                return cols;
            })(),
            renderForm: () => (
                <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid gap-2">
                        <Label>Name <span className="text-rose-500">*</span></Label>
                        <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Product Key</Label>
                            <Input value={formData.product_key || ''} onChange={(e) => setFormData({ ...formData, product_key: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Version</Label>
                            <Input value={formData.version || ''} onChange={(e) => setFormData({ ...formData, version: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Input value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>License Type <span className="text-rose-500">*</span></Label>
                            <Select value={formData.license_type || ''} onValueChange={(v) => setFormData({ ...formData, license_type: v })}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per_user">Per User</SelectItem>
                                    <SelectItem value="per_device">Per Device</SelectItem>
                                    <SelectItem value="concurrent">Concurrent</SelectItem>
                                    <SelectItem value="subscription">Subscription</SelectItem>
                                    <SelectItem value="perpetual">Perpetual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Pricing Model <span className="text-rose-500">*</span></Label>
                            <Select value={formData.pricing_model || ''} onValueChange={(v) => setFormData({ ...formData, pricing_model: v })}>
                                <SelectTrigger><SelectValue placeholder="Select pricing" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one_time">One Time</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Total Seats <span className="text-rose-500">*</span></Label>
                            <Input type="number" min={1} max={500} value={formData.total_seats || ''} onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Purchase Cost</Label>
                            <Input type="number" min={0} step="0.01" value={formData.purchase_cost || ''} onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Billing Cycle</Label>
                            <Select value={formData.billing_cycle || ''} onValueChange={(v) => setFormData({ ...formData, billing_cycle: v })}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Purchase Date</Label>
                            <Input type="date" value={formData.purchase_date || ''} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Expiration Date</Label>
                            <Input type="date" value={formData.expiration_date || ''} onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>Vendor</Label>
                            <Select value={formData.vendor_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, vendor_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                                <SelectContent>
                                    {vendors.map((v) => <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Site</Label>
                            <Select value={formData.site_id?.toString() || ''} onValueChange={(v) => setFormData({ ...formData, site_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Select Site" /></SelectTrigger>
                                <SelectContent>
                                    {sites.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label>License Email</Label>
                            <Input type="email" value={formData.license_email || ''} onChange={(e) => setFormData({ ...formData, license_email: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>License Name</Label>
                            <Input value={formData.license_name || ''} onChange={(e) => setFormData({ ...formData, license_name: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox checked={!!formData.auto_renew} onCheckedChange={(v) => setFormData({ ...formData, auto_renew: !!v })} />
                        <Label className="text-sm">Auto Renew</Label>
                    </div>
                </div>
            ),
        },
    };

    // Table Configuration tab
    tabConfig['table-configurations'] = {
        title: 'Table Configurations',
        data: [],
        isConfigTab: true,
        columns: [],
        renderForm: () => null,
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
                <div className="flex items-center gap-3">
                    <Link href="/master-data/table-configurations">
                        <Button variant="outline">
                            Table Configurations
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => {
                        setEditingType(null);
                        setTypeFormData({});
                        setIsManageTypesOpen(true);
                    }}>
                        Manage Custom Types
                    </Button>
                </div>
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
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">
                            {currentTab.title} List
                        </h2>
                        {activeTab === 'sites' && (
                            <div className="flex items-center gap-1.5 bg-background rounded-lg p-0.5 border shadow-sm">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'sabah', label: 'Sabah' },
                                    { value: 'sarawak', label: 'Sarawak' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSiteRegionFilter(opt.value)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            siteRegionFilter === opt.value
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
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
                        {currentTab?.isLicenseTab && (
                            <Button variant="outline" size="sm" onClick={() => setIsLicenseColsOpen(true)}>
                                <Eye className="mr-2 h-4 w-4" /> Manage Columns
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

                {activeTab === 'table-configurations' ? (
                    <div className="space-y-6">
                        {/* Table selector pills */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Select Table:</label>
                            <div className="flex flex-wrap gap-2">
                                {(configurationTables.length > 0 ? configurationTables : ['assets']).map(table => (
                                    <button
                                        key={table}
                                        onClick={() => {
                                            setConfigSelectedTable(table);
                                            router.get(`/master-data?tab=table-configurations&tableName=${table}`, {}, {
                                                preserveScroll: true,
                                                only: ['tableConfigurations', 'configurationTables', 'currentConfigTable'],
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            configSelectedTable === table
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted hover:bg-muted/80'
                                        }`}
                                    >
                                        {table}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Columns table */}
                        <div className="rounded-lg border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium text-sm">Column Title</th>
                                            <th className="p-3 text-left font-medium text-sm">Key</th>
                                            <th className="p-3 text-left font-medium text-sm">Type</th>
                                            <th className="p-3 text-left font-medium text-sm">Sort</th>
                                            <th className="p-3 text-left font-medium text-sm">Filter</th>
                                            <th className="p-3 text-left font-medium text-sm">Visible</th>
                                            <th className="p-3 text-left font-medium text-sm">Order</th>
                                            <th className="p-3 text-left font-medium text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableConfigurations.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                                    <Settings className="mx-auto h-10 w-10 opacity-40 mb-2" />
                                                    <p className="text-sm">No columns configured for this table.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            tableConfigurations.map((config: any, index: number) => (
                                                <tr key={config.id} className="border-b hover:bg-muted/30">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{config.column_title}</span>
                                                            {config.is_primary_key && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-semibold">PK</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-mono text-xs text-muted-foreground">{config.column_key}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{config.data_type}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={config.is_sortable}
                                                            onChange={() => {
                                                                router.put(`/master-data/table-configurations/${config.id}`, {
                                                                    ...config,
                                                                    is_sortable: !config.is_sortable,
                                                                }, { preserveScroll: true });
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={config.is_filterable}
                                                            onChange={() => {
                                                                router.put(`/master-data/table-configurations/${config.id}`, {
                                                                    ...config,
                                                                    is_filterable: !config.is_filterable,
                                                                }, { preserveScroll: true });
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => {
                                                                router.put(`/master-data/table-configurations/${config.id}`, {
                                                                    ...config,
                                                                    is_visible: !config.is_visible,
                                                                }, { preserveScroll: true });
                                                            }}
                                                            className={`p-1.5 rounded transition-colors ${
                                                                config.is_visible
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {config.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                                        </button>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-muted-foreground">{config.sort_order}</span>
                                                            <div className="flex flex-col">
                                                                <button
                                                                    onClick={() => {
                                                                        if (index > 0) {
                                                                            router.post('/master-data/table-configurations/update-order', {
                                                                                columns: [
                                                                                    { id: config.id, sort_order: index - 1 },
                                                                                    { id: tableConfigurations[index - 1].id, sort_order: index },
                                                                                ],
                                                                            }, { preserveScroll: true });
                                                                        }
                                                                    }}
                                                                    disabled={index === 0}
                                                                    className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                >
                                                                    <ArrowUp className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (index < tableConfigurations.length - 1) {
                                                                            router.post('/master-data/table-configurations/update-order', {
                                                                                columns: [
                                                                                    { id: config.id, sort_order: index + 1 },
                                                                                    { id: tableConfigurations[index + 1].id, sort_order: index },
                                                                                ],
                                                                            }, { preserveScroll: true });
                                                                        }
                                                                    }}
                                                                    disabled={index === tableConfigurations.length - 1}
                                                                    className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                                                                >
                                                                    <ArrowDown className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-1">
                                                            <Link href={`/master-data/table-configurations/${config.id}/edit`}>
                                                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-red-600"
                                                                onClick={() => {
                                                                    if (confirm('Delete this column configuration?')) {
                                                                        router.delete(`/master-data/table-configurations/${config.id}`, {
                                                                            preserveScroll: true,
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href={`/master-data/table-configurations/create?tableName=${configSelectedTable}`}>
                                <Button size="sm" className="gap-1.5">
                                    <Plus className="h-4 w-4" /> Add Column
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => {
                                    if (confirm('Reset to default configuration? Custom columns will be lost.')) {
                                        router.post(`/master-data/table-configurations/reset-to-default/${configSelectedTable}`, {}, {
                                            preserveScroll: true,
                                        });
                                    }
                                }}
                            >
                                <RefreshCw className="h-4 w-4" /> Reset to Default
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <DataTable
                            columns={currentTab.columns}
                            data={currentTab.data}
                            hideToolbar
                        />
                    </div>
                )}
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

            {/* License Column Visibility Dialog */}
            <Dialog open={isLicenseColsOpen} onOpenChange={setIsLicenseColsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage License Table Columns</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground mb-4">
                        Toggle columns to show or hide them in the Software License table.
                    </p>
                    <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
                        {LICENSE_COL_KEYS.map((key) => (
                            <button
                                key={key}
                                type="button"
                                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                                    licenseColVisibility[key]
                                        ? 'bg-primary/5 border-primary/20 text-foreground'
                                        : 'bg-muted/30 border-border text-muted-foreground'
                                }`}
                                onClick={() => toggleLicenseCol(key)}
                            >
                                <span className="font-medium">{LICENSE_COL_LABELS[key]}</span>
                                {licenseColVisibility[key] ? (
                                    <Eye className="h-4 w-4 text-primary" />
                                ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" size="sm" onClick={() => {
                            const allVisible: Record<string, boolean> = {};
                            LICENSE_COL_KEYS.forEach(k => allVisible[k] = true);
                            setLicenseColVisibility(allVisible);
                            localStorage.setItem('masterdata_license_cols', JSON.stringify(allVisible));
                        }}>
                            Show All
                        </Button>
                        <Button size="sm" onClick={() => setIsLicenseColsOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
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
