import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    FileKey,
    Plus,
    Pencil,
    Trash2,
    Calendar,
    Eye,
    EyeOff,
    Percent,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Progress } from '@/components/ui/progress';

export default function LicensesIndex({ licenses = [], users = [], assets = [], sites = [], vendors = [] }: any) {
    // Error boundary - if data is not in expected format, show simple version
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

    // Validate data format
    useEffect(() => {
        try {
            if (!Array.isArray(licenses)) {
                console.error('Licenses is not an array:', typeof licenses);
                setError('Invalid data format received from server');
            } else {
                console.log('Licenses data loaded successfully:', licenses.length, 'licenses');
                setError(null); // Clear any previous errors
            }
        } catch (e) {
            console.error('Error validating data:', e);
            setError('Error processing license data');
        }
    }, [licenses]);

    const form = useForm({
        name: '',
        product_key: '',
        seats: 1, // This will be mapped to total_seats in backend
        purchase_cost: '',
        purchase_date: '',
        expiration_date: '',
        license_email: '',
        license_name: '',
        vendor_id: 'all',
        site_id: 'all',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form.data,
            vendor_id: form.data.vendor_id === 'all' ? null : Number(form.data.vendor_id),
            site_id: form.data.site_id === 'all' ? null : Number(form.data.site_id),
            purchase_cost: form.data.purchase_cost ? Number(form.data.purchase_cost) : null,
            total_seats: form.data.seats,
            license_type: 'perpetual',
            pricing_model: 'one_time',
            auto_renew: false,
            notification_days: 30,
        };

        router.post('/licenses', data, {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
                toast.success('Software license added successfully');
            },
            onError: (err) => {
                toast.error('Failed to create license. Check the form for details.');
            }
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLicense) {
            toast.error('No license selected');
            return;
        }

        const data = {
            ...form.data,
            vendor_id: form.data.vendor_id === 'all' ? null : Number(form.data.vendor_id),
            site_id: form.data.site_id === 'all' ? null : Number(form.data.site_id),
            purchase_cost: form.data.purchase_cost ? Number(form.data.purchase_cost) : null,
            total_seats: form.data.seats,
            license_type: 'perpetual',
            pricing_model: 'one_time',
            auto_renew: false,
            notification_days: 30,
        };

        router.put(`/licenses/${selectedLicense.id}`, data, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedLicense(null);
                toast.success('Software license updated successfully');
            },
            onError: (err) => {
                // If standard validation error or custom warning
                if (err.total_seats) {
                    toast.error(err.total_seats);
                } else {
                    toast.error('Failed to update license.');
                }
            }
        });
    };

    const handleDelete = () => {
        if (!selectedLicense) {
            toast.error('No license selected');
            return;
        }

        router.delete(`/licenses/${selectedLicense.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedLicense(null);
                toast.success('Software license deleted successfully');
            },
            onError: (err) => {
                toast.error(err.error || 'Failed to delete license. Ensure no seats are currently assigned.');
            }
        });
    };

    const openEdit = useCallback(
        (license: any) => {
            setSelectedLicense(license);
            form.setData({
                name: license.name || '',
                product_key: license.product_key || '',
                seats: license.total_seats || 1,
                purchase_cost: license.purchase_cost ? String(license.purchase_cost) : '',
                purchase_date: license.purchase_date || '',
                expiration_date: license.expiration_date || '',
                license_email: license.license_email || '',
                license_name: license.license_name || '',
                vendor_id: license.vendor_id ? String(license.vendor_id) : 'all',
                site_id: license.site_id ? String(license.site_id) : 'all',
                notes: license.notes || '',
            });
            setIsEditOpen(true);
        },
        [form],
    );

    const toggleKeyVisibility = (id: number) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Software License" />
                ),
                cell: ({ row }: any) => (
                    <Link
                        href={`/licenses/${row.original.id}`}
                        className="font-semibold text-primary hover:underline hover:text-primary/80"
                    >
                        {row.getValue('name')}
                    </Link>
                ),
            },
            {
                accessorKey: 'product_key',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Product Key" />
                ),
                cell: ({ row }: any) => {
                    const key = row.getValue('product_key') as string;
                    if (!key) return <span className="text-xs text-muted-foreground italic">No key provided</span>;
                    const isVisible = visibleKeys[row.original.id];
                    return (
                        <div className="flex items-center gap-1.5 font-mono text-xs max-w-[200px] truncate">
                            <span>{isVisible ? key : '••••-••••-••••-••••'}</span>
                            <button
                                onClick={() => toggleKeyVisibility(row.original.id)}
                                className="text-muted-foreground hover:text-foreground p-0.5"
                                type="button"
                            >
                                {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                        </div>
                    );
                },
            },
            {
                id: 'utilization',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Seat Allocation" />
                ),
                cell: ({ row }: any) => {
                    const total = row.original.total_seats;
                    const assigned = row.original.used_seats;
                    const percent = total > 0 ? (assigned / total) * 100 : 0;
                    return (
                        <div className="w-[160px] space-y-1.5">
                            <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                <span>{assigned} / {total} Seats</span>
                                <span>{Math.round(percent)}%</span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                        </div>
                    );
                },
            },
            {
                id: 'cost',
                accessorKey: 'purchase_cost',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Cost" />
                ),
                cell: ({ row }: any) =>
                    row.getValue('purchase_cost')
                        ? `$${Number(row.getValue('purchase_cost')).toFixed(2)}`
                        : '—',
            },
            {
                id: 'site',
                accessorFn: (row: any) => row.site || 'Global',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Site / Scope" />
                ),
                cell: ({ row }: any) => (
                    <span className="inline-flex items-center rounded bg-muted/60 px-2 py-0.5 text-xs font-medium border border-border/40">
                        {row.original.site || 'Global'}
                    </span>
                ),
            },
            {
                accessorKey: 'expiration_date',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Expiration" />
                ),
                cell: ({ row }: any) => {
                    const dateStr = row.getValue('expiration_date') as string;
                    if (!dateStr) return <span className="text-xs text-muted-foreground italic">Never Expires</span>;

                    const expiry = new Date(dateStr);
                    const now = new Date();
                    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    let badgeClass = "text-muted-foreground";
                    if (diffDays <= 0) {
                        badgeClass = "text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-200/50";
                    } else if (diffDays <= 30) {
                        badgeClass = "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-200/50";
                    }

                    return (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span className={`text-xs ${badgeClass}`}>
                                {dateStr}
                                {diffDays <= 0 && ' (Expired)'}
                                {diffDays > 0 && diffDays <= 30 && ' (Expiring)'}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                cell: ({ row }: any) => (
                    <div className="flex items-center justify-end gap-1">
                        <Link href={`/licenses/${row.original.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 text-primary">
                                View
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => openEdit(row.original)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                                setSelectedLicense(row.original);
                                setIsDeleteOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [openEdit, visibleKeys],
    );

    // Calc Summary Stats
    const totalLicenses = licenses.length;
    const totalSeats = licenses.reduce((sum: number, lic: any) => sum + lic.total_seats, 0);
    const totalAssignedSeats = licenses.reduce((sum: number, lic: any) => sum + lic.used_seats, 0);
    const totalAvailableSeats = totalSeats - totalAssignedSeats;

    const expiringSoonCount = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    }).length;

    const expiredCount = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() <= now.getTime();
    }).length;

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Software Licenses Dashboard" />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
                    <strong>Error:</strong> {error}
                    <div className="mt-2 text-sm">
                        Please check the browser console for more details and refresh the page.
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <FileKey className="mr-3 h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Software Licenses
                        </h1>
                        <p className="text-muted-foreground">
                            Manage application license compliance, seat assignments, and activation keys.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        form.reset();
                        setIsCreateOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Software License
                </Button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary shadow-sm bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Total Licenses
                                </p>
                                <p className="text-3xl font-bold text-foreground">
                                    {totalLicenses}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalSeats} total seats provisioned
                                </p>
                            </div>
                            <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                <FileKey className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Seats In Use
                                </p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {totalAssignedSeats}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {totalSeats > 0 ? Math.round((totalAssignedSeats / totalSeats) * 100) : 0}% seat utilization
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-blue-600">
                                <Percent className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Available Seats
                                </p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {totalAvailableSeats}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Free for new assignments
                                </p>
                            </div>
                            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 text-emerald-600">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-sm bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="mb-1 text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                    Compliance Alerts
                                </p>
                                <p className="text-3xl font-bold text-rose-600">
                                    {expiredCount + expiringSoonCount}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 text-rose-600 font-semibold">
                                    {expiredCount} expired · {expiringSoonCount} expiring soon
                                </p>
                            </div>
                            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 p-3 text-rose-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                {error ? (
                    <div className="p-8 text-center text-red-600">
                        <p className="font-semibold">Unable to display licenses</p>
                        <p className="text-sm mt-2">{error}</p>
                        <p className="text-xs mt-4 text-muted-foreground">Please refresh the page or contact support if the problem persists.</p>
                    </div>
                ) : licenses.length > 0 ? (
                    <DataTable columns={columns} data={licenses} searchKey="name" />
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <FileKey className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-lg font-medium mb-2">No licenses found</p>
                        <p className="text-sm mb-4">Create your first software license to get started tracking compliance and seats.</p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Your First License
                        </Button>
                    </div>
                )}
            </div>

            {/* Create License Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add Software License</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Software / License Name *</label>
                                    <Input
                                        required
                                        placeholder="e.g. Adobe Creative Cloud All Apps"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                    />
                                    {form.errors.name && <div className="text-xs text-rose-600">{form.errors.name}</div>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Product Activation Key</label>
                                    <Textarea
                                        placeholder="e.g. AAAA-BBBB-CCCC-DDDD-EEEE"
                                        value={form.data.product_key}
                                        onChange={(e) => form.setData('product_key', e.target.value)}
                                        rows={2}
                                        className="font-mono text-sm"
                                    />
                                    {form.errors.product_key && <div className="text-xs text-rose-600">{form.errors.product_key}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Seats *</label>
                                    <Input
                                        required
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={form.data.seats}
                                        onChange={(e) => form.setData('seats', parseInt(e.target.value) || 1)}
                                    />
                                    {form.errors.seats && <div className="text-xs text-rose-600">{form.errors.seats}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Purchase Cost</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={form.data.purchase_cost}
                                        onChange={(e) => form.setData('purchase_cost', e.target.value)}
                                    />
                                    {form.errors.purchase_cost && <div className="text-xs text-rose-600">{form.errors.purchase_cost}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Purchase Date</label>
                                    <Input
                                        type="date"
                                        value={form.data.purchase_date}
                                        onChange={(e) => form.setData('purchase_date', e.target.value)}
                                    />
                                    {form.errors.purchase_date && <div className="text-xs text-rose-600">{form.errors.purchase_date}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expiration Date</label>
                                    <Input
                                        type="date"
                                        value={form.data.expiration_date}
                                        onChange={(e) => form.setData('expiration_date', e.target.value)}
                                    />
                                    {form.errors.expiration_date && <div className="text-xs text-rose-600">{form.errors.expiration_date}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">License To Email</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. billing@company.com"
                                        value={form.data.license_email}
                                        onChange={(e) => form.setData('license_email', e.target.value)}
                                    />
                                    {form.errors.license_email && <div className="text-xs text-rose-600">{form.errors.license_email}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Licensed To Name</label>
                                    <Input
                                        placeholder="e.g. DCA Department"
                                        value={form.data.license_name}
                                        onChange={(e) => form.setData('license_name', e.target.value)}
                                    />
                                    {form.errors.license_name && <div className="text-xs text-rose-600">{form.errors.license_name}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Vendor</label>
                                    <Select
                                        value={form.data.vendor_id}
                                        onValueChange={(v) => form.setData('vendor_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">No Vendor</SelectItem>
                                            {vendors.map((v: any) => (
                                                <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Site Scope</label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) => form.setData('site_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Global (All Sites)</SelectItem>
                                            {sites.map((s: any) => (
                                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea
                                        placeholder="Any additional procurement details or usage conditions..."
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        rows={3}
                                    />
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
                                Save License
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit License Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Software License</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Software / License Name *</label>
                                    <Input
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                    />
                                    {form.errors.name && <div className="text-xs text-rose-600">{form.errors.name}</div>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Product Activation Key</label>
                                    <Textarea
                                        value={form.data.product_key}
                                        onChange={(e) => form.setData('product_key', e.target.value)}
                                        rows={2}
                                        className="font-mono text-sm"
                                    />
                                    {form.errors.product_key && <div className="text-xs text-rose-600">{form.errors.product_key}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Seats *</label>
                                    <Input
                                        required
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={form.data.seats}
                                        onChange={(e) => form.setData('seats', parseInt(e.target.value) || 1)}
                                    />
                                    {form.errors.seats && <div className="text-xs text-rose-600">{form.errors.seats}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Purchase Cost</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.data.purchase_cost}
                                        onChange={(e) => form.setData('purchase_cost', e.target.value)}
                                    />
                                    {form.errors.purchase_cost && <div className="text-xs text-rose-600">{form.errors.purchase_cost}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Purchase Date</label>
                                    <Input
                                        type="date"
                                        value={form.data.purchase_date}
                                        onChange={(e) => form.setData('purchase_date', e.target.value)}
                                    />
                                    {form.errors.purchase_date && <div className="text-xs text-rose-600">{form.errors.purchase_date}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expiration Date</label>
                                    <Input
                                        type="date"
                                        value={form.data.expiration_date}
                                        onChange={(e) => form.setData('expiration_date', e.target.value)}
                                    />
                                    {form.errors.expiration_date && <div className="text-xs text-rose-600">{form.errors.expiration_date}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">License To Email</label>
                                    <Input
                                        type="email"
                                        value={form.data.license_email}
                                        onChange={(e) => form.setData('license_email', e.target.value)}
                                    />
                                    {form.errors.license_email && <div className="text-xs text-rose-600">{form.errors.license_email}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Licensed To Name</label>
                                    <Input
                                        value={form.data.license_name}
                                        onChange={(e) => form.setData('license_name', e.target.value)}
                                    />
                                    {form.errors.license_name && <div className="text-xs text-rose-600">{form.errors.license_name}</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Vendor</label>
                                    <Select
                                        value={form.data.vendor_id}
                                        onValueChange={(v) => form.setData('vendor_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">No Vendor</SelectItem>
                                            {vendors.map((v: any) => (
                                                <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Site Scope</label>
                                    <Select
                                        value={form.data.site_id}
                                        onValueChange={(v) => form.setData('site_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Site" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Global (All Sites)</SelectItem>
                                            {sites.map((s: any) => (
                                                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea
                                        value={form.data.notes}
                                        onChange={(e) => form.setData('notes', e.target.value)}
                                        rows={3}
                                    />
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
                                Update License
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Software License</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Are you sure you want to delete{' '}
                            <strong>{selectedLicense?.name}</strong>?
                        </p>
                        <p className="mt-2 text-sm text-rose-600 font-medium">
                            Warning: This will permanently remove the license. You can only delete licenses that have all seats checked in.
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
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

LicensesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Software Licenses',
            href: '/licenses',
        },
    ],
};
