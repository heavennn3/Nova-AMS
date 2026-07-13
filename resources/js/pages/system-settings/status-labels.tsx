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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type StatusLabelProps = {
    data: any[];
};

export default function StatusLabels({ data = [] }: StatusLabelProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);

        if (item) {
            setFormData({ ...item });
        } else {
            setFormData({ type: 'deployable' });
        }

        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this status label?')) {
return;
}

        router.delete(`/settings/status-labels/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem
            ? `/settings/status-labels/${editingItem.id}`
            : '/settings/status-labels';
        const method = editingItem ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        deployable: 'bg-green-100 text-green-800 border-green-200',
        archived: 'bg-slate-100 text-slate-800 border-slate-200',
        undeployable: 'bg-red-100 text-red-800 border-red-200',
    };

    const columns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Label Name" />
            ),
        },
        {
            accessorKey: 'type',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }: any) => {
                const type = row.original.type;
                const badgeColor = statusColors[type] || 'bg-secondary text-secondary-foreground';

                return (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${badgeColor}`}>
                        {type}
                    </span>
                );
            },
        },
        {
            accessorKey: 'notes',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Notes" />
            ),
            cell: ({ row }: any) => row.original.notes || <span className="text-muted-foreground">-</span>,
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
            <Head title="Status Labels Settings" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Status Labels
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Define global status states for categorizing asset availability.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">Status Labels List</h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Label
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
                            {editingItem ? 'Edit' : 'Add New'} Status Label
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Label Name</Label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g. Ready to Deploy, In Repair"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Label Type</Label>
                            <Select
                                value={formData.type || 'deployable'}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, type: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="deployable">Deployable</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="undeployable">Undeployable</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Input
                                value={formData.notes || ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="e.g. What does this status indicate?"
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

StatusLabels.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '#' },
        { title: 'Status Labels', href: '/settings/status-labels' },
    ],
};
