import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table/data-table';
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
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus, Search, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SparePartsIndex({
    spareParts = [],
    sites = [],
    users = [],
}: {
    spareParts: any[];
    sites?: any[];
    users?: any[];
}) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<any>(null);

    const editForm = useForm(() => ({
        name: '', part_number: '', category: '',
        location: '', site_id: '',
        status: 'available', used_by: '',
    }));

    const form = useForm(() => {
        const initial: Record<string, any> = {
            name: '', part_number: '', category: '',
            location: '', site_id: 'all',
        };
        return initial;
    });

    const filteredParts = useMemo(() => {
        return spareParts.filter((part: any) => {
            const matchesSearch = !search ||
                (part.name && part.name.toLowerCase().includes(search.toLowerCase())) ||
                (part.part_number && part.part_number.toLowerCase().includes(search.toLowerCase())) ||
                (part.category && part.category.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [spareParts, search, selectedCategory]);

    const handleImportCsv = (parsedData: any[]) => {
        const spare_parts = parsedData.map((row: any) => {
            const normalized: any = {};
            for (const [k, v] of Object.entries(row)) {
                normalized[String(k).toLowerCase().trim().replace(/\s+/g, '_')] = v;
            }
            return normalized;
        });
        router.post('/spare-parts/import-bulk', { spare_parts }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Import successful!'),
            onError: (errors) => toast.error('Import failed: ' + (errors.message || 'Unknown error')),
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: form.data.name,
            part_number: form.data.part_number,
            category: form.data.category,
            location: form.data.location,
            site_id: form.data.site_id === 'all' ? null : form.data.site_id,
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
        return [
            {
                accessorKey: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Spare Part Name" />
                ),
                cell: ({ row }: any) => (
                    <Link href={`/spare-parts/${row.original.id}`} className="text-primary hover:underline font-semibold">
                        {row.getValue('name') ?? '—'}
                    </Link>
                ),
            },
            {
                accessorKey: 'part_number',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Serial Number" />
                ),
                cell: ({ row }: any) => <span className="font-mono">{row.getValue('part_number') ?? '—'}</span>,
            },
            {
                accessorKey: 'category',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Category" />
                ),
                cell: ({ row }: any) => <span>{row.getValue('category') ?? '—'}</span>,
            },
            {
                accessorKey: 'location',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Place (Where Kept)" />
                ),
                cell: ({ row }: any) => <span>{row.getValue('location') ?? '—'}</span>,
            },
            {
                accessorKey: 'site_name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Site" />
                ),
                cell: ({ row }: any) => <span>{row.getValue('site_name') ?? 'N/A'}</span>,
            },
            {
                accessorKey: 'status',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }: any) => {
                    const status = row.getValue('status') as string;
                    const colors: Record<string, string> = {
                        available: 'bg-green-100 text-green-700',
                        in_used: 'bg-blue-100 text-blue-700',
                        faulty: 'bg-red-100 text-red-700',
                    };
                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                            {status?.replace('_', ' ')}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'used_by_name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Used By" />
                ),
                cell: ({ row }: any) => <span>{row.getValue('used_by_name') ?? '—'}</span>,
            },
            {
                accessorKey: 'created_by_name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Added By" />
                ),
                cell: ({ row }: any) => <span>{row.getValue('created_by_name') ?? 'N/A'}</span>,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => {
                    const part = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost" size="sm" className="h-8 px-2 text-blue-600"
                                onClick={() => {
                                    setEditingPart(part);
                                    editForm.setData({
                                        name: part.name,
                                        part_number: part.part_number,
                                        category: part.category,
                                        location: part.location,
                                        site_id: part.site_id || '',
                                        status: part.status,
                                        used_by: part.used_by || '',
                                    });
                                    setEditDialogOpen(true);
                                }}
                            >
                                <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
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
            },
        ];
    }, []);

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



            {/* Data Table */}
            <Card>
                <CardContent className="p-0">
                    <DataTable
                        columns={columns}
                        data={filteredParts}
                        hideToolbar
                    />
                </CardContent>
            </Card>

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
                                    <Label>Spare Part Name *</Label>
                                    <Input
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Enter part name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Serial Number *</Label>
                                    <Input
                                        required
                                        value={form.data.part_number}
                                        onChange={(e) => form.setData('part_number', e.target.value)}
                                        placeholder="e.g., SN-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select
                                        value={form.data.category}
                                        onValueChange={(v) => form.setData('category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['RAM', 'MONITOR', 'STORAGE', 'CABLE', 'PSU', 'RJ45', 'CABLE TRACER'].map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Site *</Label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) => form.setData('site_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select site" />
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
                                <div className="space-y-2">
                                    <Label>Place (Where Kept) *</Label>
                                    <Input
                                        required
                                        value={form.data.location}
                                        onChange={(e) => form.setData('location', e.target.value)}
                                        placeholder="e.g., Rack A - Shelf 3"
                                    />
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

            {/* Edit Spare Part Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const data = {
                            ...editForm.data,
                            site_id: editForm.data.site_id || null,
                            used_by: editForm.data.used_by || null,
                        };
                        router.put(`/spare-parts/${editingPart?.id}`, data, {
                            onSuccess: () => {
                                setEditDialogOpen(false);
                                toast.success('Spare part updated successfully');
                            },
                            onError: () => {
                                toast.error('Failed to update spare part');
                            }
                        });
                    }}>
                        <DialogHeader>
                            <DialogTitle>Edit Spare Part</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Spare Part Name *</Label>
                                    <Input
                                        required
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Serial Number *</Label>
                                    <Input
                                        required
                                        value={editForm.data.part_number}
                                        onChange={(e) => editForm.setData('part_number', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select
                                        value={editForm.data.category}
                                        onValueChange={(v) => editForm.setData('category', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['RAM', 'MONITOR', 'STORAGE', 'CABLE', 'PSU', 'RJ45', 'CABLE TRACER'].map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Site</Label>
                                    <Select
                                        value={editForm.data.site_id}
                                        onValueChange={(v) => editForm.setData('site_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sites.map((site: any) => (
                                                <SelectItem key={site.id} value={String(site.id)}>
                                                    {site.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Place (Where Kept) *</Label>
                                    <Input
                                        required
                                        value={editForm.data.location}
                                        onChange={(e) => editForm.setData('location', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={editForm.data.status}
                                        onValueChange={(v) => editForm.setData('status', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="in_used">In Used</SelectItem>
                                            <SelectItem value="faulty">Faulty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Used By</Label>
                                    <Select
                                        value={editForm.data.used_by}
                                        onValueChange={(v) => editForm.setData('used_by', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Not assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            {users.map((user: any) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Update'}
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