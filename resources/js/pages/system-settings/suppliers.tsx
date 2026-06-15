import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

type SuppliersVendorsProps = {
    suppliers: any[];
    vendors: any[];
};

type TabType = 'suppliers' | 'vendors';

export default function SuppliersVendors({ suppliers = [], vendors = [] }: SuppliersVendorsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('suppliers');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item });
        } else {
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        const typeLabel = activeTab === 'suppliers' ? 'supplier' : 'vendor';
        if (!confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

        const endpoint = activeTab === 'suppliers' ? `/settings/suppliers/${id}` : `/settings/vendors/${id}`;
        router.delete(endpoint, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const baseEndpoint = activeTab === 'suppliers' ? '/settings/suppliers' : '/settings/vendors';
        const url = editingItem ? `${baseEndpoint}/${editingItem.id}` : baseEndpoint;
        const method = editingItem ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const supplierColumns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Supplier Name" />
            ),
        },
        {
            accessorKey: 'email',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }: any) => row.original.email || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'phone',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }: any) => row.original.phone || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'address',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Address" />
            ),
            cell: ({ row }: any) => row.original.address || <span className="text-muted-foreground">-</span>,
        },
        {
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
        },
    ];

    const vendorColumns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Vendor Name" />
            ),
        },
        {
            accessorKey: 'contact_person',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Contact Person" />
            ),
            cell: ({ row }: any) => row.original.contact_person || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'email',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }: any) => row.original.email || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'phone',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }: any) => row.original.phone || <span className="text-muted-foreground">-</span>,
        },
        {
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
        },
    ];

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Suppliers & Vendors Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Suppliers & Vendors
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage entities providing hardware assets and commercial support.
                    </p>
                </div>
            </div>

            <div className="flex w-full space-x-2 overflow-x-auto border-b border-border pb-1">
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'suppliers'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                    }`}
                >
                    Suppliers
                </button>
                <button
                    onClick={() => setActiveTab('vendors')}
                    className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        activeTab === 'vendors'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                    }`}
                >
                    Vendors
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold capitalize">{activeTab} List</h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>

                <div className="p-4">
                    <DataTable
                        columns={activeTab === 'suppliers' ? supplierColumns : vendorColumns}
                        data={activeTab === 'suppliers' ? suppliers : vendors}
                        searchKey="name"
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Add New'} {activeTab === 'suppliers' ? 'Supplier' : 'Vendor'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. Dell Inc, Amazon Web Services"
                                required
                            />
                        </div>
                        {activeTab === 'vendors' && (
                            <div className="grid gap-2">
                                <Label>Contact Person</Label>
                                <Input
                                    value={formData.contact_person || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contact_person: e.target.value })
                                    }
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="e.g. sales@company.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder="e.g. +123456789"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Address</Label>
                            <Input
                                value={formData.address || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Corporate headquarters / dispatch address"
                            />
                        </div>
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
        </div>
    );
}

SuppliersVendors.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Suppliers & Vendors', href: '/settings/suppliers' },
    ],
};
