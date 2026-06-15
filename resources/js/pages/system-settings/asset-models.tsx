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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

type AssetModelsProps = {
    data: any[];
    manufacturers: any[];
    categories: any[];
};

export default function AssetModels({ data = [], manufacturers = [], categories = [] }: AssetModelsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({
                ...item,
                manufacturer_id: item.manufacturer_id?.toString() || '',
                category_id: item.category_id?.toString() || '',
            });
        } else {
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this asset model?')) return;
        router.delete(`/settings/asset-models/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem
            ? `/settings/asset-models/${editingItem.id}`
            : '/settings/asset-models';
        const method = editingItem ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const columns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Model Name" />
            ),
        },
        {
            accessorKey: 'model_number',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Model Number" />
            ),
            cell: ({ row }: any) => row.original.model_number || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'manufacturer.name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Manufacturer" />
            ),
            cell: ({ row }: any) => row.original.manufacturer?.name || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'category.name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            cell: ({ row }: any) => row.original.category?.name || <span className="text-muted-foreground">-</span>,
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
            <Head title="Asset Models Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Asset Models
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage models / templates for your physical inventory items.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">Asset Models List</h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Model
                    </Button>
                </div>

                <div className="p-4">
                    <DataTable columns={columns} data={data} searchKey="name" />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Add New'} Asset Model
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Model Name</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. MacBook Pro 16"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Model Number</Label>
                            <Input
                                value={formData.model_number || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, model_number: e.target.value })
                                }
                                placeholder="e.g. A2485"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Manufacturer</Label>
                            <Select
                                value={formData.manufacturer_id || ''}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, manufacturer_id: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select manufacturer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {manufacturers.map((m) => (
                                        <SelectItem key={m.id} value={m.id.toString()}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category_id || ''}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, category_id: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

AssetModels.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Asset Models', href: '/settings/asset-models' },
    ],
};
