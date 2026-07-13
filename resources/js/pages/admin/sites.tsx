import { Head, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, MapPin, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

interface AdminSitesProps {
    sites: any[];
    users: any[];
}

type Site = {
    id: number;
    name: string;
    code: string | null;
    region: string | null;
    users_count: number;
    created_at: string;
    updated_at: string;
};

export default function AdminSites({ sites, users }: AdminSitesProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
 setMounted(true); 
}, []);

    const handleOpenDialog = (site: Site | null = null) => {
        setEditingSite(site);

        if (site) {
            setFormData({
                ...site,
            });
        } else {
            setFormData({
                name: '',
                code: '',
                region: '',
            });
        }

        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingSite(null);
        setFormData({});
    };

    const handleSave = () => {
        if (editingSite) {
            router.put(`/admin/sites/${editingSite.id}`, formData, {
                onSuccess: () => {
                    toast.success('Site updated successfully');
                    handleCloseDialog();
                },
                onError: () => {
                    toast.error('Failed to update site');
                },
            });
        } else {
            router.post('/admin/sites', formData, {
                onSuccess: () => {
                    toast.success('Site created successfully');
                    handleCloseDialog();
                },
                onError: () => {
                    toast.error('Failed to create site');
                },
            });
        }
    };

    const handleDelete = (site: Site) => {
        if (confirm(`Are you sure you want to delete "${site.name}"?`)) {
            router.delete(`/admin/sites/${site.id}`, {
                onSuccess: () => {
                    toast.success('Site deleted successfully');
                },
                onError: (errors: any) => {
                    toast.error(errors.error || 'Failed to delete site');
                },
            });
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const columns = [
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Site Name" />
            ),
            cell: ({ row }: any) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'code',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Code" />
            ),
            cell: ({ row }: any) => (
                <span className="text-muted-foreground">{row.original.code || '-'}</span>
            ),
        },
        {
            accessorKey: 'region',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Region" />
            ),
            cell: ({ row }: any) => (
                <span className="text-muted-foreground">{row.original.region || '-'}</span>
            ),
        },
        {
            accessorKey: 'users_count',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Users" />
            ),
            cell: ({ row }: any) => (
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{row.original.users_count}</span>
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const site = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(site)}
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(site)}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full space-y-6 p-6">
            <Head title="Site Management" />

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                            <MapPin className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Site Management
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage sites, locations, and site administrators
                            </p>
                        </div>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Site
                </Button>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>All Sites</CardTitle>
                    <CardDescription>
                        View and manage all sites in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={sites || []}
                        hideToolbar
                    />
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSite ? 'Edit Site' : 'Create New Site'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingSite
                                ? 'Update site information and configuration'
                                : 'Add a new site to the system'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Basic Information */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Basic Information</h3>
                            <div className="grid gap-3">
                                <div>
                                    <Label htmlFor="name">Site Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name || ''}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter site name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="code">Site Code</Label>
                                        <Input
                                            id="code"
                                            value={formData.code || ''}
                                            onChange={(e) => handleInputChange('code', e.target.value)}
                                            placeholder="e.g., BKI"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="region">Region</Label>
                                    {mounted && (
                                        <Select
                                            value={formData.region || ''}
                                            onValueChange={(value) => handleInputChange('region', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sabah">Sabah</SelectItem>
                                                <SelectItem value="Sarawak">Sarawak</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingSite ? 'Update Site' : 'Create Site'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

AdminSites.layout = {
    breadcrumbs: [
        {
            title: 'Admin Settings',
            href: '/settings',
        },
        {
            title: 'Site Management',
            href: '/admin/sites',
        },
    ],
};