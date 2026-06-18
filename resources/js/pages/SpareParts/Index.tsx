import { Head, Link, router } from '@inertiajs/react';
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
}: {
    spareParts: any[];
    categories: string[];
}) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<any>(null);

    const filteredParts = useMemo(() => {
        return spareParts.filter((part: any) => {
            const matchesSearch = !search ||
                part.name.toLowerCase().includes(search.toLowerCase()) ||
                part.part_number.toLowerCase().includes(search.toLowerCase()) ||
                part.category.toLowerCase().includes(search.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
            const matchesStatus = selectedStatus === 'all' ||
                (selectedStatus === 'available' && part.availability === 'available') ||
                (selectedStatus === 'low' && part.availability === 'low') ||
                (selectedStatus === 'out' && part.stock_level === 0);

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [spareParts, search, selectedCategory, selectedStatus]);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }: any) => (
                <div>
                    <p className="font-medium">{row.getValue('name')}</p>
                    <p className="text-xs text-muted-foreground">{row.getValue('part_number')}</p>
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
            cell: ({ row }: any) => `$${row.getValue('unit_cost')}`,
        },
        {
            accessorKey: 'total_value',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Total Value" />
            ),
            cell: ({ row }: any) => `$${row.getValue('total_value')}`,
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
        const formData = new FormData(e.currentTarget);

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
                    <Button>
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
                        exportFileName="spare_parts_inventory"
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