import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    MapPin,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Search,
    Building2,
    CheckCircle2,
    XCircle,
    Users,
    Package,
    Wrench,
} from 'lucide-react';
import { toast } from 'sonner';

interface Site {
    id: number;
    name: string;
    code: string;
    region: string | null;
    users_count: number;
    assets_count: number;
    spare_parts_count: number;
    is_active: boolean;
}

interface Stats {
    total_sites: number;
    active_sites: number;
    disabled_sites: number;
    total_users: number;
    total_assets: number;
    total_spare_parts: number;
}

export default function Dashboards({ sites, stats }: { sites: Site[]; stats: Stats }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [processing, setProcessing] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        region: '',
    });

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const filteredSites = sites.filter((site) => {
        const query = searchQuery.toLowerCase();
        return (
            site.name.toLowerCase().includes(query) ||
            site.code.toLowerCase().includes(query) ||
            (site.region || '').toLowerCase().includes(query)
        );
    });

    const handleCreate = () => {
        setFormData({
            name: '',
            code: '',
            region: '',
        });
        setIsCreateOpen(true);
    };

    const handleEdit = (site: Site) => {
        setSelectedSite(site);
        setFormData({
            name: site.name,
            code: site.code,
            region: site.region || '',
        });
        setIsEditOpen(true);
    };

    const handleDelete = (site: Site) => {
        setSelectedSite(site);
        setIsDeleteOpen(true);
    };

    const submitCreate = () => {
        setProcessing(true);
        router.post(
            '/admin/sites',
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    toast.success('Site created successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const submitEdit = () => {
        if (!selectedSite) return;
        setProcessing(true);
        router.put(
            `/admin/sites/${selectedSite.id}`,
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditOpen(false);
                    toast.success('Site updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const confirmDelete = () => {
        if (!selectedSite) return;
        setProcessing(true);
        router.delete(`/admin/sites/${selectedSite.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success('Site deleted successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Site Management" />

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Site Management
                    </h1>

                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Site
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Sites</p>
                        <p className="text-2xl font-bold">{stats.total_sites}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active Sites</p>
                        <p className="text-2xl font-bold">{stats.active_sites}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-red-500/10 p-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Disabled Sites</p>
                        <p className="text-2xl font-bold">{stats.disabled_sites}</p>
                    </div>
                </div>
            </div>


            {/* Sites Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        All Sites
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search sites..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Site ID</TableHead>
                                <TableHead>Site Name</TableHead>
                                <TableHead className="text-center">Users</TableHead>
                                <TableHead className="text-center">Assets</TableHead>
                                <TableHead className="text-center">Spare Parts</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSites.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Building2 className="h-8 w-8" />
                                            <p>No sites found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSites.map((site) => (
                                    <TableRow key={site.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {site.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{site.name}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-purple-500" />
                                                <span className="font-semibold">{site.users_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Package className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="font-semibold">{site.assets_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Wrench className="h-3.5 w-3.5 text-amber-500" />
                                                <span className="font-semibold">{site.spare_parts_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={site.is_active ? 'default' : 'secondary'}
                                                className={
                                                    site.is_active
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }
                                            >
                                                {site.is_active ? 'Active' : 'Disabled'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleEdit(site)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Rename Site
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            router.patch(`/admin/sites/${site.id}/toggle-active`, {}, {
                                                                preserveScroll: true,
                                                                onSuccess: () => toast.success(site.is_active ? 'Site disabled' : 'Site activated'),
                                                                onError: () => toast.error('Failed to update status'),
                                                            });
                                                        }}
                                                    >
                                                        {site.is_active
                                                            ? <><XCircle className="mr-2 h-4 w-4 text-red-500" /> Disable Site</>
                                                            : <><CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Activate Site</>
                                                        }
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(site)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Create New Site</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new site
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Site Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="e.g., Head Office"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Site ID *</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                                placeholder="e.g., HQ-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="region">Region *</Label>
                            {mounted && (
                                <Select
                                    value={formData.region}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, region: value })
                                    }
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

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitCreate} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Site'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-lg" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Edit Site</DialogTitle>
                        <DialogDescription>
                            Update site information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Site Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-code">Site ID *</Label>
                            <Input
                                id="edit-code"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-region">Region *</Label>
                            {mounted && (
                                <Select
                                    value={formData.region}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, region: value })
                                    }
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

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button onClick={submitEdit} disabled={processing}>
                            {processing ? 'Updating...' : 'Update Site'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the site "
                            {selectedSite?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={processing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {processing ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Dashboards.layout = {
    breadcrumbs: [
        {
            title: 'Multi-Site Management',
            href: '#',
        },
        {
            title: 'Site Dashboards',
            href: '#',
        },
    ],
};
