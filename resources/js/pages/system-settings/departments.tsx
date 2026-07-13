import { Head, router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DepartmentsProps = {
    data: any[];
};

export default function Departments({ data = [] }: DepartmentsProps) {
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
        if (!confirm('Are you sure you want to delete this department?')) {
return;
}

        router.delete(`/settings/departments/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem
            ? `/settings/departments/${editingItem.id}`
            : '/settings/departments';
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
                <DataTableColumnHeader column={column} title="Department Name" />
            ),
        },
        {
            accessorKey: 'code',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Department Code" />
            ),
            cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.code}</span>,
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
            <Head title="Departments Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Departments
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Define organizational departments to assign cost centers and user associations.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">Departments List</h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Department
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
                            {editingItem ? 'Edit' : 'Add New'} Department
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Department Name</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. Information Technology"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Department Code</Label>
                            <Input
                                value={formData.code || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                                placeholder="e.g. DEPT-IT"
                                required
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

Departments.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Departments', href: '/settings/departments' },
    ],
};
