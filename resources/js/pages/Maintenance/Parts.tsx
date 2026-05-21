import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Package,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function Parts({ parts = [], sites = [] }: any) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<any>(null);

    const form = useForm({
        part_number: '',
        name: '',
        stock_level: 0,
        minimum_stock_level: 0,
        unit_cost: '',
        site_id: 'all',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            site_id: form.data.site_id === 'all' ? null : form.data.site_id,
        };
        router.post('/maintenance/parts', data, {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
                toast.success('Spare part added successfully');
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            site_id: form.data.site_id === 'all' ? null : form.data.site_id,
        };
        router.put(`/maintenance/parts/${selectedPart.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedPart(null);
                toast.success('Spare part updated successfully');
            },
        });
    };

    const handleDelete = () => {
        router.delete(`/maintenance/parts/${selectedPart.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedPart(null);
                toast.success('Spare part deleted successfully');
            },
        });
    };

    const openEdit = React.useCallback(
        (part: any) => {
            setSelectedPart(part);
            form.setData({
                part_number: part.part_number || '',
                name: part.name || '',
                stock_level: part.stock_level || 0,
                minimum_stock_level: part.minimum_stock_level || 0,
                unit_cost: part.unit_cost || '',
                site_id: part.site_id ? String(part.site_id) : 'all',
            });
            setIsEditOpen(true);
        },
        [form],
    );

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'part_number',
                header: ({ column }: any) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Part Number"
                    />
                ),
                cell: ({ row }: any) => (
                    <span className="font-mono font-medium">
                        {row.getValue('part_number')}
                    </span>
                ),
            },
            {
                accessorKey: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Part Name" />
                ),
                cell: ({ row }: any) => (
                    <span className="font-medium">{row.getValue('name')}</span>
                ),
            },
            {
                id: 'location',
                accessorFn: (row: any) => row.site?.name || 'Global',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Location" />
                ),
                cell: ({ row }: any) => row.original.site?.name || 'Global',
            },
            {
                accessorKey: 'stock_level',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Stock" />
                ),
                cell: ({ row }: any) => {
                    const stock = row.getValue('stock_level') as number;
                    const min = row.original.minimum_stock_level as number;
                    const isLow = stock <= min;
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className={`font-medium ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}
                            >
                                {stock}
                            </span>
                            {isLow && (
                                <AlertTriangle className="h-3 w-3 text-rose-600" />
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'unit_cost',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Unit Cost" />
                ),
                cell: ({ row }: any) =>
                    row.getValue('unit_cost')
                        ? `$${Number(row.getValue('unit_cost')).toFixed(2)}`
                        : '—',
            },
            {
                id: 'actions',
                cell: ({ row }: any) => (
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(row.original)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                                setSelectedPart(row.original);
                                setIsDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [openEdit, setSelectedPart, setIsDeleteOpen],
    );

    const totalStock = parts.reduce(
        (acc: number, p: any) => acc + p.stock_level,
        0,
    );
    const lowStockItems = parts.filter(
        (p: any) => p.stock_level <= p.minimum_stock_level,
    ).length;
    const totalValue = parts.reduce(
        (acc: number, p: any) =>
            acc + p.stock_level * (Number(p.unit_cost) || 0),
        0,
    );

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Spare Parts Inventory" />

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Package className="mr-3 h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Spare Parts
                        </h1>
                        <p className="text-muted-foreground">
                            Manage NOVA spare parts inventory{' '}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        form.reset();
                        setIsCreateOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Spare Parts
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Total Spare Parts
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {parts.length}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Low Stock Alerts
                                </p>
                                <p className="text-3xl font-bold text-rose-600">
                                    {lowStockItems}
                                </p>
                            </div>
                            <div className="rounded-lg bg-rose-50 p-3 text-rose-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase"></p>
                                <p className="text-3xl font-bold text-foreground">
                                    ${totalValue.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <DataTable columns={columns} data={parts} searchKey="name" />
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add Spare Part</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Part Number
                                    </label>
                                    <Input
                                        required
                                        value={form.data.part_number}
                                        onChange={(e) =>
                                            form.setData(
                                                'part_number',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Part Name
                                    </label>
                                    <Input
                                        required
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Current Stock
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.stock_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'stock_level',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Min Threshold
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.minimum_stock_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'minimum_stock_level',
                                                parseInt(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Unit Cost
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.unit_cost}
                                        onChange={(e) =>
                                            form.setData(
                                                'unit_cost',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Location
                                    </label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) =>
                                            form.setData('site_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Global (All Sites)
                                            </SelectItem>
                                            {sites.map((s: any) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Save Part
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Spare Part</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Part Number
                                    </label>
                                    <Input
                                        required
                                        value={form.data.part_number}
                                        onChange={(e) =>
                                            form.setData(
                                                'part_number',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Part Name
                                    </label>
                                    <Input
                                        required
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Current Stock
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.stock_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'stock_level',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Min Threshold
                                    </label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        value={form.data.minimum_stock_level}
                                        onChange={(e) =>
                                            form.setData(
                                                'minimum_stock_level',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Unit Cost
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.unit_cost}
                                        onChange={(e) =>
                                            form.setData(
                                                'unit_cost',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Location
                                    </label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) =>
                                            form.setData('site_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Global (All Sites)
                                            </SelectItem>
                                            {sites.map((s: any) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Update Part
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Spare Part</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Are you sure you want to delete{' '}
                            <strong>{selectedPart?.name}</strong>?
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            It will be moved to the Recycle Bin.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Parts.layout = {
    breadcrumbs: [
        {
            title: 'Spare Parts Inventory',
            href: '/maintenance/parts',
        },
    ],
};
