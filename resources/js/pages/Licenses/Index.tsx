import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Check,
    ChevronsUpDown,
    PlusCircle,
    Key,
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function LicensesIndex({ licenses = [], users = [], assets = [], sites = [], vendors = [], licenseTypes = [] }: any) {
    // Error boundary - if data is not in expected format, show simple version
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});
    const [createKeyVisible, setCreateKeyVisible] = useState(false);
    const [vendorOpen, setVendorOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');
    const [deleteReason, setDeleteReason] = useState('');
    const [selectedVendor, setSelectedVendor] = useState<string>('all');
    const [selectedLicenseType, setSelectedLicenseType] = useState<string>('all');

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
        license_type: 'perpetual',
        vendor_id: '',
        product_key: '',
        expiration_date: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const isSub = form.data.license_type === 'subscription';
        const data = {
            name: form.data.name,
            product_key: form.data.product_key || null,
            license_type: isSub ? 'subscription' : 'perpetual',
            pricing_model: isSub ? 'annual' : 'one_time',
            total_seats: 1,
            vendor_id: form.data.vendor_id ? Number(form.data.vendor_id) : null,
            expiration_date: form.data.expiration_date || null,
            auto_renew: false,
            notification_days: 30,
        };

        router.post('/licenses', data, {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
                setCreateKeyVisible(false);
                toast.success('License added successfully');
            },
            onError: (err) => {
                toast.error(Object.values(err).join(', ') || 'Failed to create license.');
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
            license_type_id: form.data.license_type_id === 'all' ? null : Number(form.data.license_type_id),
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
        if (!deleteReason.trim()) {
            toast.error('Please provide a reason for deletion');
            return;
        }

        router.delete(`/licenses/${selectedLicense.id}`, {
            data: { delete_reason: deleteReason },
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedLicense(null);
                setDeleteReason('');
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
                license_type_id: license.license_type_id ? String(license.license_type_id) : 'all',
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

    // Filter licenses by selected vendor and license type
    const filteredLicenses = useMemo(() => {
        let filtered = licenses;

        if (selectedVendor !== 'all') {
            filtered = filtered.filter((license: any) =>
                license.vendor_id === parseInt(selectedVendor)
            );
        }

        if (selectedLicenseType !== 'all') {
            filtered = filtered.filter((license: any) =>
                license.license_type_id === parseInt(selectedLicenseType)
            );
        }

        return filtered;
    }, [licenses, selectedVendor, selectedLicenseType]);

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
                id: 'vendor',
                accessorFn: (row: any) => row.vendor || 'No Vendor',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Vendor" />
                ),
                cell: ({ row }: any) => (
                    <span className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200/50">
                        {row.original.vendor || 'No Vendor'}
                    </span>
                ),
            },
            {
                id: 'license_type',
                accessorFn: (row: any) => row.license_type_name || 'Uncategorized',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="License Type" />
                ),
                cell: ({ row }: any) => (
                    <span className="inline-flex items-center rounded bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400 border border-purple-200/50">
                        {row.original.license_type_name || 'Uncategorized'}
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
    const totalLicenses = filteredLicenses.length;
    const totalSeats = filteredLicenses.reduce((sum: number, lic: any) => sum + lic.total_seats, 0);
    const totalAssignedSeats = filteredLicenses.reduce((sum: number, lic: any) => sum + lic.used_seats, 0);
    const totalAvailableSeats = totalSeats - totalAssignedSeats;

    // Active licenses (not expired)
    const activeLicenses = filteredLicenses.filter((lic: any) => {
        if (!lic.expiration_date) return true; // Never expires = active
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() > now.getTime();
    }).length;

    // Expiring this month (within 30 days)
    const expiringThisMonth = filteredLicenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    }).length;

    // Expired licenses
    const expiredLicenses = filteredLicenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() <= now.getTime();
    }).length;

    // In use licenses (has assigned seats)
    const inUseLicenses = filteredLicenses.filter((lic: any) => lic.used_seats > 0).length;

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

                    </div>
                </div>
                <div className="flex items-center gap-2">

                    <Button
                        onClick={() => {
                            form.reset();
                            setIsCreateOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create License
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-blue-500/10 p-3">
                        <FileKey className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Licenses</p>
                        <p className="text-2xl font-bold">{totalLicenses}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-green-500/10 p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Active </p>
                        <p className="text-2xl font-bold">{activeLicenses}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-amber-500/10 p-3">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Expiring This Month</p>
                        <p className="text-2xl font-bold">{expiringThisMonth}</p>

                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-red-500/10 p-3">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Expired Licenses</p>
                        <p className="text-2xl font-bold">{expiredLicenses}</p>

                    </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border bg-card p-4 shadow-sm">
                    <div className="rounded-full bg-purple-500/10 p-3">
                        <Percent className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">In Use</p>
                        <p className="text-2xl font-bold">{inUseLicenses}</p>

                    </div>
                </div>
            </div>

            <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">License Type:</label>
                            <Select value={selectedLicenseType} onValueChange={setSelectedLicenseType}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {licenseTypes.map((lt: any) => (
                                        <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">Vendor:</label>
                            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Vendors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Vendors</SelectItem>
                                    {vendors.map((v: any) => (
                                        <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {filteredLicenses.length} {filteredLicenses.length === 1 ? 'license' : 'licenses'} {(selectedVendor !== 'all' || selectedLicenseType !== 'all') ? 'filtered' : ''}
                    </div>
                </div>
                {error ? (
                    <div className="p-8 text-center text-red-600">
                        <p className="font-semibold">Unable to display licenses</p>
                        <p className="text-sm mt-2">{error}</p>
                        <p className="text-xs mt-4 text-muted-foreground">Please refresh the page or contact support if the problem persists.</p>
                    </div>
                ) : filteredLicenses.length > 0 ? (
                    <DataTable columns={columns} data={filteredLicenses} searchKey="name" />
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        <FileKey className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-lg font-medium mb-2">
                            {(selectedVendor !== 'all' || selectedLicenseType !== 'all') ? 'No licenses found for the selected filters' : 'No licenses found'}
                        </p>
                        <p className="text-sm mb-4">
                            {(selectedVendor !== 'all' || selectedLicenseType !== 'all')
                                ? 'Try adjusting your filters or add licenses that match your criteria.' : ''}
                        </p>
                        {(selectedVendor === 'all' && selectedLicenseType === 'all') && (
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add New License
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Create License Modal ── */}
            <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) { form.reset(); setCreateKeyVisible(false); } }}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create License</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            {/* License Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">License Name *</label>
                                <Input
                                    required
                                    placeholder="e.g. Microsoft 365 Business"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                />
                                {form.errors.name && <p className="text-xs text-rose-600">{form.errors.name}</p>}
                            </div>

                            {/* Vendor (searchable combobox + inline create) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vendor</label>
                                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={vendorOpen}
                                            className="w-full justify-between font-normal"
                                        >
                                            {form.data.vendor_id
                                                ? vendors.find((v: any) => String(v.id) === form.data.vendor_id)?.name
                                                : 'Select vendor…'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search vendor…"
                                                value={vendorSearch}
                                                onValueChange={setVendorSearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent"
                                                        onClick={async () => {
                                                            const name = vendorSearch.trim();
                                                            if (!name) return;
                                                            try {
                                                                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                                                const res = await fetch('/api/quick/vendors', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                                                                    body: JSON.stringify({ name }),
                                                                });
                                                                if (!res.ok) throw new Error('Failed to create vendor');
                                                                const vendor = await res.json();
                                                                form.setData('vendor_id', String(vendor.id));
                                                                setVendorOpen(false);
                                                                setVendorSearch('');
                                                                toast.success(`Vendor "${name}" created.`);
                                                            } catch {
                                                                toast.error('Failed to create vendor.');
                                                            }
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4" />
                                                        Create vendor "<span className="font-medium">{vendorSearch}</span>"
                                                    </button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {vendors.map((v: any) => (
                                                        <CommandItem
                                                            key={v.id}
                                                            value={v.name}
                                                            onSelect={() => {
                                                                form.setData('vendor_id', String(v.id));
                                                                setVendorOpen(false);
                                                                setVendorSearch('');
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    form.data.vendor_id === String(v.id) ? 'opacity-100' : 'opacity-0'
                                                                )}
                                                            />
                                                            {v.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* License Type (subscription / perpetual) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type *</label>
                                <Select
                                    value={form.data.license_type}
                                    onValueChange={(v) => form.setData('license_type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="perpetual">Perpetual</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Product Key (hidden by default, toggle) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Key</label>
                                <div className="relative">
                                    <Input
                                        type={createKeyVisible ? 'text' : 'password'}
                                        placeholder="AAAAA-BBBBB-CCCCC-DDDDD-EEEEE"
                                        value={form.data.product_key ?? ''}
                                        onChange={(e) => form.setData('product_key', e.target.value)}
                                        className="pr-9 font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCreateKeyVisible(!createKeyVisible)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {createKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">Key is hidden by default. Toggle to reveal.</p>
                            </div>

                            {/* Expiry Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry Date</label>
                                <Input
                                    type="date"
                                    value={form.data.expiration_date ?? ''}
                                    onChange={(e) => form.setData('expiration_date', e.target.value)}
                                />
                                {form.errors.expiration_date && <p className="text-xs text-rose-600">{form.errors.expiration_date}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => { setIsCreateOpen(false); form.reset(); setCreateKeyVisible(false); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Creating…' : 'Create License'}
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
                                    <label className="text-sm font-medium">License Type</label>
                                    <Select
                                        value={form.data.license_type_id}
                                        onValueChange={(v) => form.setData('license_type_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select License Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">No License Type</SelectItem>
                                            {licenseTypes.map((lt: any) => (
                                                <SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                        <DialogTitle className="text-rose-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" /> Delete License
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete the license <strong>{selectedLicense?.name}</strong>?
                            This will move the license to the trash bin.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason for deletion *</label>
                            <Textarea
                                required
                                placeholder="Please provide a reason for deleting this license..."
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={!deleteReason.trim()}>
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
