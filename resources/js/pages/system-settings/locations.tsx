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

type LocationsProps = {
    data: any[];
};

export default function Locations({ data = [] }: LocationsProps) {
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
        if (!confirm('Are you sure you want to delete this location?')) return;
        router.delete(`/settings/locations/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem
            ? `/settings/locations/${editingItem.id}`
            : '/settings/locations';
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
                <DataTableColumnHeader column={column} title="Location Name" />
            ),
        },
        {
            accessorKey: 'state',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="State/Region" />
            ),
            cell: ({ row }: any) => row.original.state || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'latitude',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Latitude" />
            ),
            cell: ({ row }: any) => row.original.latitude ?? <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: 'longitude',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Longitude" />
            ),
            cell: ({ row }: any) => row.original.longitude ?? <span className="text-muted-foreground">-</span>,
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
            <Head title="Locations Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Locations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage precise geographic sites and facility rooms for assets deployment.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">Locations List</h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Location
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
                            {editingItem ? 'Edit' : 'Add New'} Location
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Location Name</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. Server Room A, KK FIR Office"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>State/Region</Label>
                            <Input
                                value={formData.state || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, state: e.target.value })
                                }
                                placeholder="e.g. Sabah, Sarawak"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Latitude</Label>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    value={formData.latitude || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, latitude: e.target.value })
                                    }
                                    placeholder="e.g. 5.9788"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Longitude</Label>
                                <Input
                                    type="number"
                                    step="0.000001"
                                    value={formData.longitude || ''}
                                    onChange={(e) =>
                                        setFormData({ ...formData, longitude: e.target.value })
                                    }
                                    placeholder="e.g. 116.0753"
                                />
                            </div>
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

Locations.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Locations', href: '/settings/locations' },
    ],
};
