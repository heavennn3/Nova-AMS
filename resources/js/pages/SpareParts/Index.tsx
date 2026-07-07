import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plus, Search, AlertTriangle, CheckCircle, XCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SparePartsIndex({
    spareParts = [],
    configurations = [],
    categories = [],
    assetTypes = [],
    sites = [],
}: {
    spareParts: any[];
    configurations?: any[];
    categories: string[];
    assetTypes?: any[];
    sites?: any[];
}) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedAssetType, setSelectedAssetType] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<any>(null);

    const form = useForm(() => {
        const initial: Record<string, any> = {
            name: '', part_number: '', category: '',
            stock_level: 0, minimum_stock_level: 0, unit_cost: '',
            location: '', site_id: 'all', asset_type_id: 'none', status: 'available',
        };
        for (const cfg of (configurations || [])) {
            if (!(cfg.column_key in initial)) initial[cfg.column_key] = '';
        }
        return initial;
    });

    const filteredParts = useMemo(() => {
        return spareParts.filter((part: any) => {
            const matchesSearch = !search ||
                (part.name && part.name.toLowerCase().includes(search.toLowerCase())) ||
                (part.part_number && part.part_number.toLowerCase().includes(search.toLowerCase())) ||
                (part.category && part.category.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
            const matchesAssetType = selectedAssetType === 'all' || String(part.asset_type_id) === selectedAssetType;
            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'available' && part.availability === 'available') ||
                (selectedStatus === 'low' && part.availability === 'low') ||
                (selectedStatus === 'out' && part.stock_level === 0);

            return matchesSearch && matchesCategory && matchesAssetType && matchesStatus;
        });
    }, [spareParts, search, selectedCategory, selectedAssetType, selectedStatus]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            site_id: form.data.site_id === 'all' ? null : form.data.site_id,
            asset_type_id: form.data.asset_type_id === 'none' ? null : form.data.asset_type_id,
        };
        router.post('/spare-parts', data, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                form.reset();
                toast.success('Spare part added successfully');
            },
            onError: () => {
                toast.error('Failed to add spare part');
            }
        });
    };

    const columns = useMemo(() => {
        const cols: any[] = (configurations || [])
            .filter((cfg: any) => cfg.is_visible)
            .map((cfg: any) => ({
                accessorKey: cfg.column_key,
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title={cfg.column_title || cfg.column_key} />
                ),
                enableSorting: cfg.is_sortable,
                cell: ({ row }: any) => {
                    const val = row.getValue(cfg.column_key);

                    if (cfg.column_key === 'unit_cost') {
                        return <span className="tabular-nums font-medium">RM{val ?? '0.00'}</span>;
                    }

                    if (cfg.column_key === 'total_value') {
                        return <span className="tabular-nums font-medium">RM{val ?? '0.00'}</span>;
                    }

                    if (cfg.is_primary_key) {
                        return (
                            <Link href={`/spare-parts/${row.original.id}`} className="text-primary hover:underline font-mono font-semibold">
                                {val ?? '—'}
                            </Link>
                        );
                    }

                    if (cfg.data_type === 'number') {
                        return <div className="text-right tabular-nums">{val ?? '—'}</div>;
                    }

                    if (cfg.data_type === 'boolean') {
                        return <span>{val ? 'Yes' : 'No'}</span>;
                    }

                    return <span>{val ?? '—'}</span>;
                },
            }));

        // Always append stock column (availability-aware)
        cols.push({
            accessorKey: 'stock_level',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Stock" />
            ),
            cell: ({ row }: any) => {
                const stock = row.getValue('stock_level');
                const minLevel = row.original.minimum_stock_level;
                const availability = row.original.availability;

                let statusColor = 'bg-green-100 text-green-700';
                if (stock === 0) statusColor = 'bg-red-100 text-red-700';
                else if (availability === 'low') statusColor = 'bg-yellow-100 text-yellow-700';

                return (
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                            {stock}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {minLevel}</span>
                    </div>
                );
            },
        });

        // Always append actions column
        cols.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const part = row.original;
                const isOutOfStock = part.stock_level === 0;

                return (
                    <div className="flex items-center gap-2">
                        <Link href={`/spare-parts/${part.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600">
                                <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        {!isOutOfStock && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    setSelectedPart(part);
                                    setCheckoutDialogOpen(true);
                                }}
                            >
                                Checkout
                            </Button>
                        )}
                        {isOutOfStock && (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-red-600"
                            onClick={() => {
                                if (confirm('Delete this spare part?')) {
                                    router.delete(`/spare-parts/${part.id}`, {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                    </div>
                );
            },
        });

        return cols;
    }, [configurations]);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPart) {
            toast.error('No spare part selected');
            return;
        }

        const formData = new FormData(e.currentTarget as HTMLFormElement);

        router.post(`/spare-parts/${selectedPart.id}/checkout`, formData, {
            onSuccess: () => {
                toast.success('Item checked out successfully');
                setCheckoutDialogOpen(false);
                router.reload();
            },
            onError: () => {
                toast.error('Failed to checkout item');
            }
        });
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Spare Parts Inventory" />

            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Spare Parts Inventory
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage and track spare parts inventory
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/spare-parts/dashboard">
                        <Button variant="outline">
                            <Package className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Button onClick={() => {
                        form.reset();
                        setCreateDialogOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Part
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{spareParts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {spareParts.filter((p: any) => p.availability === 'available').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {spareParts.filter((p: any) => p.availability === 'low').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {spareParts.filter((p: any) => p.stock_level === 0).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search "
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedAssetType} onValueChange={setSelectedAssetType}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Asset Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Asset Types</SelectItem>
                                {assetTypes.map((type: any) => (
                                    <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="low">Low Stock</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={filteredParts}
                    />
                </CardContent>
            </Card>

            {/* Checkout Dialog */}
            <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Checkout Spare Part</DialogTitle>
                    </DialogHeader>
                    {selectedPart && (
                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-semibold">{selectedPart.name}</p>
                                <p className="text-sm text-muted-foreground">Available: {selectedPart.stock_level}</p>
                            </div>

                            <div>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    max={selectedPart.stock_level}
                                    defaultValue="1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Purpose</Label>
                                <Input
                                    type="text"
                                    name="purpose"
                                    placeholder="e.g., Maintenance, Upgrade, Replacement"
                                />
                            </div>

                            <div>
                                <Label>User ID</Label>
                                <Input
                                    type="number"
                                    name="user_id"
                                    placeholder="Enter user ID"
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Checkout</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Spare Part Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add New Spare Part</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Part Name *</Label>
                                    <Input
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Enter part name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Part Number *</Label>
                                    <Input
                                        required
                                        value={form.data.part_number}
                                        onChange={(e) => form.setData('part_number', e.target.value)}
                                        placeholder="e.g., SP-2024-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Input
                                        required
                                        value={form.data.category}
                                        onChange={(e) => form.setData('category', e.target.value)}
                                        placeholder="e.g., Electrical Components"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock Level *</Label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.stock_level}
                                        onChange={(e) => form.setData('stock_level', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Stock Level *</Label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.minimum_stock_level}
                                        onChange={(e) => form.setData('minimum_stock_level', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit Cost (RM) *</Label>
                                    <Input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.unit_cost}
                                        onChange={(e) => form.setData('unit_cost', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input
                                        value={form.data.location}
                                        onChange={(e) => form.setData('location', e.target.value)}
                                        placeholder="e.g., Warehouse A - Shelf 12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Site</Label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) => form.setData('site_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Global (All Sites)
                                            </SelectItem>
                                            {sites.map((site: any) => (
                                                <SelectItem key={site.id} value={String(site.id)}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Asset Type</Label>
                                    <Select
                                        value={form.data.asset_type_id}
                                        onValueChange={(v) => form.setData('asset_type_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Asset Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None (Unassociated)
                                            </SelectItem>
                                            {assetTypes.map((type: any) => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dynamic config-defined fields */}
                                {configurations
                                    .filter((cfg: any) =>
                                        !['name','part_number','category','stock_level','minimum_stock_level','unit_cost','location','site_id','asset_type_id','status'].includes(cfg.column_key)
                                    )
                                    .map((cfg: any) => {
                                        const key = cfg.column_key;
                                        const label = cfg.column_title || key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                                        const required = cfg.is_primary_key;

                                        if (cfg.data_type === 'boolean') {
                                            return (
                                                <div key={key} className="space-y-2 col-span-2">
                                                    <Label className="font-medium">{label}</Label>
                                                    <Select value={form.data[key] || ''} onValueChange={(v) => form.setData(key, v)}>
                                                        <SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">Yes</SelectItem>
                                                            <SelectItem value="0">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            );
                                        }

                                        if (cfg.data_type === 'date') {
                                            return (
                                                <div key={key} className="space-y-2">
                                                    <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
                                                    <Input type="date" value={form.data[key] || ''} onChange={(e) => form.setData(key, e.target.value)} className="h-9" />
                                                </div>
                                            );
                                        }

                                        if (cfg.data_type === 'number') {
                                            return (
                                                <div key={key} className="space-y-2">
                                                    <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
                                                    <Input type="number" value={form.data[key] || ''} onChange={(e) => form.setData(key, e.target.value)} className="h-9" />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={key} className="space-y-2">
                                                <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
                                                <Input value={form.data[key] || ''} onChange={(e) => form.setData(key, e.target.value)} className="h-9" placeholder={label} />
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save Part'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

SparePartsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Spare Parts',
            href: '/spare-parts',
        },
        {
            title: 'Inventory',
            href: '#',
        },
    ],
};