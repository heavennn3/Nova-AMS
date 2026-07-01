import { useState, useMemo } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    UserPlus,
    Search,
    Filter,
    Download,
    Trash2,
    Edit,
    Eye,
    Power,
    Users,
    MapPin,
    Wrench,
    Shield,
    Mail,
    Phone,
    IdCard,
    Calendar,
    CheckCircle2,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Technician {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    ic_number: string | null;
    profile_photo: string | null;
    is_active: boolean;
    sites: Array<{ id: number; name: string; code: string }>;
    site_names: string;
    active_work_orders: number;
    created_at: string;
    last_active: string;
}

interface Site {
    id: number;
    name: string;
    code: string;
}

export default function TechnicianManagement({
    technicians,
    sites,
    filters,
    can,
}: {
    technicians: any;
    sites: Site[];
    filters: {
        search: string;
        site_id: string;
        status: string;
        sort_by: string;
        sort_order: string;
        per_page: number;
    };
    can: {
        create: boolean;
        edit: boolean;
        delete: boolean;
        toggle_active: boolean;
    };
}) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth.user?.roles?.includes('Admin');
    const isSiteManager = auth.user?.roles?.includes('Site Manager');

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
    const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        ic_number: '',
        password: '',
        password_confirmation: '',
        site_ids: [] as string[],
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        ic_number: '',
        site_ids: [] as string[],
        is_active: true,
    });

    // Handle form submissions
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/technicians', {
            onSuccess: () => {
                setIsCreateDialogOpen(false);
                createForm.reset();
                setSelectedSiteIds([]);
                toast.success('Technician created successfully');
            },
            onError: () => {
                toast.error('Failed to create technician');
            },
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTechnician) return;

        editForm.put(`/technicians/${selectedTechnician.id}`, {
            onSuccess: () => {
                setIsEditDialogOpen(false);
                setSelectedTechnician(null);
                setSelectedSiteIds([]);
                toast.success('Technician updated successfully');
            },
            onError: () => {
                toast.error('Failed to update technician');
            },
        });
    };

    const handleDelete = () => {
        if (!selectedTechnician) return;

        router.delete(`/technicians/${selectedTechnician.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedTechnician(null);
                toast.success('Technician deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete technician');
            },
        });
    };

    const handleToggleActive = (technician: Technician) => {
        router.post(`/technicians/${technician.id}/toggle-active`, {}, {
            onSuccess: () => {
                toast.success(`Technician ${technician.is_active ? 'deactivated' : 'activated'} successfully`);
            },
            onError: () => {
                toast.error('Failed to change technician status');
            },
        });
    };

    const openEditDialog = (technician: Technician) => {
        setSelectedTechnician(technician);
        const siteIds = technician.sites.map(site => site.id.toString());
        setSelectedSiteIds(siteIds);
        editForm.setData({
            name: technician.name,
            email: technician.email,
            phone: technician.phone || '',
            ic_number: technician.ic_number || '',
            site_ids: siteIds,
            is_active: technician.is_active,
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (technician: Technician) => {
        setSelectedTechnician(technician);
        setIsDeleteDialogOpen(true);
    };

    // Filter handlers
    const handleFilterChange = (key: string, value: string) => {
        const query = { ...filters, [key]: value };
        router.get('/technicians', query, { preserveState: true });
    };

    const handleReset = () => {
        router.get('/technicians', {
            search: '',
            site_id: '',
            status: '',
            sort_by: 'created_at',
            sort_order: 'desc',
            per_page: 10,
        });
    };

    const handleExport = () => {
        window.location.href = '/technicians/export';
    };

    // Site selection handlers
    const toggleSite = (siteId: string) => {
        const newSiteIds = selectedSiteIds.includes(siteId)
            ? selectedSiteIds.filter(id => id !== siteId)
            : [...selectedSiteIds, siteId];

        setSelectedSiteIds(newSiteIds);
        createForm.setData('site_ids', newSiteIds);
        editForm.setData('site_ids', newSiteIds);
    };

    // Data table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Technician" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="font-semibold text-sm">{technician.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <IdCard className="h-3 w-3" />
                                {technician.ic_number || 'N/A'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'contact',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Contact" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {technician.email}
                        </div>
                        {technician.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {technician.phone}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'sites',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned Sites" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <div className="flex items-center gap-1 flex-wrap">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{technician.site_names || 'No sites assigned'}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'active_work_orders',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Active Work Orders" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold">{technician.active_work_orders}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_active',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <Badge className={technician.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {technician.is_active ? (
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Inactive
                            </div>
                        )}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Created" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <div className="text-sm text-muted-foreground">
                        {technician.created_at}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }: any) => {
                const technician = row.original;
                return (
                    <DataTableActions
                        items={[
                            {
                                label: 'Edit',
                                icon: Edit,
                                onClick: () => openEditDialog(technician),
                                show: can.edit,
                            },
                            {
                                label: technician.is_active ? 'Deactivate' : 'Activate',
                                icon: Power,
                                onClick: () => handleToggleActive(technician),
                                show: can.toggle_active,
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => openDeleteDialog(technician),
                                show: can.delete,
                                variant: 'destructive',
                            },
                        ]}
                    />
                );
            },
        },
    ], [can]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Technician Management" />

            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
                <div>
                    <h1 className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                        <Users className="mr-3 h-8 w-8 text-primary" />
                        Technician Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isAdmin ? 'Manage technicians across all sites' : 'Manage technicians for your assigned sites'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    {can.create && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Technician
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search technicians..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-[200px]">
                            <Select value={filters.site_id} onValueChange={(value) => handleFilterChange('site_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by site" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sites</SelectItem>
                                    {sites.map((site) => (
                                        <SelectItem key={site.id} value={site.id.toString()}>
                                            {site.name} ({site.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[150px]">
                            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Technicians Directory
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">
                            {technicians.total} technicians found
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={technicians.data}
                        search={filters.search}
                        onSearchChange={(value) => handleFilterChange('search', value)}
                    />
                </CardContent>
            </Card>

            {/* Create Technician Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Technician</DialogTitle>
                        <DialogDescription>
                            Create a new technician account and assign to sites
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-sm text-red-500">{createForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-sm text-red-500">{createForm.errors.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="+60123456789"
                                    />
                                    {createForm.errors.phone && (
                                        <p className="text-sm text-red-500">{createForm.errors.phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ic_number">IC Number</Label>
                                    <Input
                                        id="ic_number"
                                        value={createForm.data.ic_number}
                                        onChange={(e) => createForm.setData('ic_number', e.target.value)}
                                        placeholder="123456-78-9012"
                                    />
                                    {createForm.errors.ic_number && (
                                        <p className="text-sm text-red-500">{createForm.errors.ic_number}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                    {createForm.errors.password && (
                                        <p className="text-sm text-red-500">{createForm.errors.password}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Re-enter password"
                                        required
                                    />
                                    {createForm.errors.password_confirmation && (
                                        <p className="text-sm text-red-500">{createForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Assigned Sites *</Label>
                                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                    {sites.map((site) => (
                                        <div key={site.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`site-${site.id}`}
                                                checked={selectedSiteIds.includes(site.id.toString())}
                                                onChange={() => toggleSite(site.id.toString())}
                                                className="h-4 w-4"
                                            />
                                            <label htmlFor={`site-${site.id}`} className="text-sm cursor-pointer">
                                                {site.name} ({site.code})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {createForm.errors.site_ids && (
                                    <p className="text-sm text-red-500">{createForm.errors.site_ids}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="is_active" className="text-sm cursor-pointer">
                                    Active account
                                </label>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating...' : 'Create Technician'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Technician Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Technician</DialogTitle>
                        <DialogDescription>
                            Update technician information and site assignments
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-red-500">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email *</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.email && (
                                        <p className="text-sm text-red-500">{editForm.errors.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                    />
                                    {editForm.errors.phone && (
                                        <p className="text-sm text-red-500">{editForm.errors.phone}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-ic_number">IC Number</Label>
                                    <Input
                                        id="edit-ic_number"
                                        value={editForm.data.ic_number}
                                        onChange={(e) => editForm.setData('ic_number', e.target.value)}
                                    />
                                    {editForm.errors.ic_number && (
                                        <p className="text-sm text-red-500">{editForm.errors.ic_number}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Assigned Sites *</Label>
                                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                                    {sites.map((site) => (
                                        <div key={site.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`edit-site-${site.id}`}
                                                checked={selectedSiteIds.includes(site.id.toString())}
                                                onChange={() => toggleSite(site.id.toString())}
                                                className="h-4 w-4"
                                            />
                                            <label htmlFor={`edit-site-${site.id}`} className="text-sm cursor-pointer">
                                                {site.name} ({site.code})
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {editForm.errors.site_ids && (
                                    <p className="text-sm text-red-500">{editForm.errors.site_ids}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-is_active"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="edit-is_active" className="text-sm cursor-pointer">
                                    Active account
                                </label>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Updating...' : 'Update Technician'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Technician</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete technician "{selectedTechnician?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Technician
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

TechnicianManagement.layout = {
    breadcrumbs: [
        {
            title: 'Technician Center',
            href: '/maintenance/technicians',
        },
        {
            title: 'Manage Technicians',
            href: '#',
        },
    ],
};