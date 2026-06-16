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

type MasterDataProps = {
    categories: any[];
    types: any[];
    sites: any[];
    vendors: any[];
};

type TabType = 'categories' | 'types' | 'sites' | 'vendors';

export default function MasterData({
    categories = [],
    types = [],
    sites = [],
    vendors = [],
}: MasterDataProps) {
    const [activeTab, setActiveTab] = useState<TabType>('sites');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const handleOpenDialog = (item: any = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({
                ...item,
                asset_category_id: item.asset_category_id?.toString() || '',
            });
        } else {
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (
            !confirm(
                `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`,
            )
        )
            return;
        router.delete(`/master-data/${activeTab}/${id}`, {
            preserveScroll: true,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingItem
            ? `/master-data/${activeTab}/${editingItem.id}`
            : `/master-data/${activeTab}`;

        const method = editingItem ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => setIsDialogOpen(false),
        });
    };

    const actionColumn = {
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
    };

    const tabConfig = {
        sites: {
            title: 'Sites (Locations)',
            data: sites,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'code',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Code" />
                    ),
                },
                {
                    accessorKey: 'region',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Region" />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Code</Label>
                        <Input
                            value={formData.code || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    code: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Region</Label>
                        <Input
                            value={formData.region || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    region: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
        categories: {
            title: 'Asset Categories',
            data: categories,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'description',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Description"
                        />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input
                            value={formData.description || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
        types: {
            title: 'Asset Types',
            data: types,
            columns: [
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Name" />
                    ),
                },
                {
                    accessorKey: 'category.name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Category"
                        />
                    ),
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category_id || ''}
                            onValueChange={(val) =>
                                setFormData({
                                    ...formData,
                                    category_id: val,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem
                                        key={c.id}
                                        value={c.id.toString()}
                                    >
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            ),
        },
        vendors: {
            title: 'Vendors',
            data: vendors,
            columns: [
                {
                    id: 'logo',
                    header: '',
                    cell: ({ row }: any) => {
                        const logo = row.original.logo;
                        return (
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {logo ? (
                                    <img
                                        src={logo}
                                        alt={row.original.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-muted-foreground">
                                        {(row.original.name || '?')[0]}
                                    </span>
                                )}
                            </div>
                        );
                    },
                    size: 60,
                },
                {
                    accessorKey: 'name',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Vendor Name"
                        />
                    ),
                },
                {
                    accessorKey: 'contact_person',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Contact Person"
                        />
                    ),
                },
                {
                    accessorKey: 'phone',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Phone" />
                    ),
                },
                {
                    accessorKey: 'email',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="Email" />
                    ),
                },
                {
                    accessorKey: 'assets_count',
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Total Assets"
                        />
                    ),
                    cell: ({ row }: any) => {
                        const count = row.original.assets_count ?? 0;
                        return (
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                {count}
                            </span>
                        );
                    },
                },
                actionColumn,
            ],
            renderForm: () => (
                <>
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Contact Person</Label>
                        <Input
                            value={formData.contact_person || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    contact_person: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Phone</Label>
                        <Input
                            value={formData.phone || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Address</Label>
                        <Input
                            value={formData.address || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                        />
                    </div>
                </>
            ),
        },
    };

    const currentTab = tabConfig[activeTab];

    return (
        <div className="w-full space-y-8 p-8">
            <Head title="Master Data" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Master Data
                    </h1>
                </div>
            </div>

            <div className="flex w-full space-x-2 overflow-x-auto border-b border-border pb-1">
                {(Object.keys(tabConfig) as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                            activeTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {tabConfig[tab].title}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4">
                    <h2 className="text-lg font-semibold">
                        {currentTab.title} List
                    </h2>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>

                <div className="p-4">
                    <DataTable
                        columns={currentTab.columns}
                        data={currentTab.data}
                        hideToolbar
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit' : 'Add New'}{' '}
                            {currentTab.title.replace(/s$/, '')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        {currentTab.renderForm()}
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

MasterData.layout = {
    breadcrumbs: [
        {
            title: 'Master Data',
            href: '#',
        },
    ],
};
