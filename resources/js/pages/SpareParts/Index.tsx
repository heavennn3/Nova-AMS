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
import { Package, Plus, Search, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SparePartsIndex({
    spareParts = [],
    categories = [],
    assetTypes = [],
    sites = [],
}: {
    spareParts: any[];
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

    const form = useForm({
        name: '',
        part_number: '',
        category: '',
        stock_level: 0,
        minimum_stock_level: 0,
        unit_cost: '',
        location: '',
        site_id: 'all',
        asset_type_id: 'none',
        status: 'available',
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

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }: any) => (
                <div>
                    <p className="font-medium">{row.getValue('name')}</p>
                    <p className="text-xs text-muted-foreground">{row.original.part_number}</p>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            cell: ({ row }: any) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {row.getValue('category')}
                </span>
            ),
        },
        {
            accessorKey: 'asset_type',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Asset Type" />
            ),
            cell: ({ row }: any) => (
                <span className="text-sm">
                    {row.getValue('asset_type')}
                </span>
            ),
        },
        {
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
        },
        {
            accessorKey: 'unit_cost',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Unit Cost" />
            ),
            cell: ({ row }: any) => `RM${row.getValue('unit_cost')}`,
        },
        {
            accessorKey: 'total_value',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Total Value" />
            ),
            cell: ({ row }: any) => `RM${row.getValue('total_value')}`,
        },
        {
            accessorKey: 'location',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Location" />
            ),
        },
        {
            accessorKey: 'site',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Site" />
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const part = row.original;
                const isOutOfStock = part.stock_level === 0;

                return (
                    <div className="flex items-center gap-2">
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
                    </div>
                );
            },
        },
    ], []);

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
                                    placeholder="Search by name, part number, or category..."
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