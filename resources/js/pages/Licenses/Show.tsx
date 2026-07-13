import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    FileKey,
    ArrowLeft,
    Calendar,
    Mail,
    User as UserIcon,
    Laptop,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    Clipboard,
    Check,
    ChevronsUpDown,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function LicenseShow({ license, users = [], assets = [] }: any) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState<any>(null);
    const [keyVisible, setKeyVisible] = useState(false);
    const [userComboboxOpen, setUserComboboxOpen] = useState(false);

    const usersBySite = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        users.forEach((u: any) => {
            const site = u.site || 'Global / Unassigned';

            if (!groups[site]) {
groups[site] = [];
}

            groups[site].push(u);
        });
        
        const sortedKeys = Object.keys(groups).sort();

        return sortedKeys.map(key => ({
            site: key,
            users: groups[key].sort((a, b) => a.name.localeCompare(b.name))
        }));
    }, [users]);

    const checkoutForm = useForm({
        target_type: 'user',
        user_id: '',
        asset_id: '',
        notes: '',
    });

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (checkoutForm.data.target_type === 'user' && !checkoutForm.data.user_id) {
            toast.error('Please select a user to assign the seat');

            return;
        }

        if (checkoutForm.data.target_type === 'asset' && !checkoutForm.data.asset_id) {
            toast.error('Please select an asset to assign the seat');

            return;
        }

        router.post(`/licenses/seats/${selectedSeat.id}/checkout`, checkoutForm.data, {
            onSuccess: () => {
                setIsCheckoutOpen(false);
                checkoutForm.reset();
                setSelectedSeat(null);
                toast.success('License seat allocated successfully');
            },
            onError: () => {
                toast.error('Failed to checkout seat.');
            }
        });
    };

    const handleCheckin = (seat: any) => {
        if (confirm(`Are you sure you want to check in Seat #${seat.seat_number}?`)) {
            router.post(`/licenses/seats/${seat.id}/checkin`, {}, {
                onSuccess: () => {
                    toast.success('License seat checked in successfully');
                },
                onError: () => {
                    toast.error('Failed to checkin seat.');
                }
            });
        }
    };

    const copyToClipboard = () => {
        if (license.license_key) {
            navigator.clipboard.writeText(license.license_key);
            toast.success('Product key copied to clipboard');
        }
    };

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'seat_number',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Seat Number" />
                ),
                cell: ({ row }: any) => (
                    <span className="font-semibold text-foreground">
                        Seat #{row.getValue('seat_number')}
                    </span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({ row }: any) => {
                    const seat = row.original;
                    const isAssigned = seat.assigned_to_user_id || seat.assigned_to_asset_id;

                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isAssigned
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
                            }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${isAssigned ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            {isAssigned ? 'Checked Out' : 'Available'}
                        </span>
                    );
                },
            },
            {
                id: 'assigned_to',
                header: 'Checked Out To',
                cell: ({ row }: any) => {
                    const seat = row.original;

                    if (seat.assigned_to_user_id) {
                        return (
                            <div className="flex items-center gap-2 text-sm">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">{seat.assigned_user_name}</div>
                                    <div className="text-xs text-muted-foreground">{seat.assigned_user_email}</div>
                                </div>
                            </div>
                        );
                    } else if (seat.assigned_to_asset_id) {
                        return (
                            <div className="flex items-center gap-2 text-sm">
                                <Laptop className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="font-medium text-primary hover:underline">
                                        <Link href={`/assets/${seat.assigned_to_asset_id}`}>
                                            {seat.assigned_asset_name}
                                        </Link>
                                    </div>
                                    <div className="text-xs text-muted-foreground">SN: {seat.assigned_asset_serial || '—'}</div>
                                </div>
                            </div>
                        );
                    }

                    return <span className="text-xs text-muted-foreground italic">—</span>;
                },
            },
            {
                accessorKey: 'assigned_at',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Date Assigned" />
                ),
                cell: ({ row }: any) => row.getValue('assigned_at') ? (
                    <span className="text-xs text-muted-foreground">{row.getValue('assigned_at').split(' ')[0]}</span>
                ) : '—',
            },
            {
                accessorKey: 'notes',
                header: 'Remarks',
                cell: ({ row }: any) => row.getValue('notes') ? (
                    <span className="text-xs text-muted-foreground italic max-w-[200px] block truncate" title={row.getValue('notes')}>
                        {row.getValue('notes')}
                    </span>
                ) : '—',
            },
            {
                id: 'actions',
                cell: ({ row }: any) => {
                    const seat = row.original;
                    const isAssigned = seat.assigned_to_user_id || seat.assigned_to_asset_id;

                    return (
                        <div className="flex justify-end gap-2">
                            {isAssigned ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleCheckin(seat)}
                                >
                                    Check In
                                </Button>
                            ) : (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                        setSelectedSeat(seat);
                                        checkoutForm.reset();
                                        setIsCheckoutOpen(true);
                                    }}
                                >
                                    Check Out
                                </Button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const percent = license.seats > 0 ? (license.assigned_seats_count / license.seats) * 100 : 0;

    return (
        <div className="w-full space-y-6 p-8">
            <Head title={`${license.name} Details`} />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/licenses">
                            <Button variant="ghost" size="sm" className="h-8 p-1">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{license.name}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">
                        View license parameters and manage specific license seat assignments.
                    </p>
                </div>
                <div className="flex items-center gap-3 ml-8 sm:ml-0">
                    <span className="text-sm font-semibold px-3 py-1 rounded bg-secondary/80 border text-secondary-foreground">
                        {license.available_seats_count} Seats Available
                    </span>
                    <span className="text-sm font-semibold px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary">
                        {license.seats} Total Seats
                    </span>
                </div>
            </div>

            {/* Two-Column Details & Stats Panel */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Details Card */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">License Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Product Key</div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded border overflow-x-auto max-w-[280px]">
                                    {keyVisible ? (license.license_key || 'No key provided') : '••••-••••-••••-••••'}
                                </span>
                                {license.license_key && (
                                    <>
                                        <button
                                            onClick={() => setKeyVisible(!keyVisible)}
                                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                                            title={keyVisible ? "Hide Key" : "Show Key"}
                                        >
                                            {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="text-muted-foreground hover:text-foreground p-1 rounded"
                                            title="Copy Key"
                                        >
                                            <Clipboard className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Scope / Site Scope</div>
                            <div className="text-foreground font-medium">
                                {license.site || 'Global (All Sites)'}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Expiration Date</div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className={license.end_date ? '' : 'italic text-muted-foreground'}>
                                    {license.end_date || 'Never Expires'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Date</div>
                            <div className="text-foreground">{license.active_date || '—'}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Category</div>
                            <div className="text-foreground">{license.category || '—'}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Type</div>
                            <div className="text-foreground capitalize">{license.type || '—'}</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</div>
                            <div className="text-foreground">
                                {license.status === 'available' && <span className="text-green-600 font-medium">Available</span>}
                                {license.status === 'full' && <span className="text-blue-600 font-medium">Full</span>}
                                {license.status === 'expiring_soon' && <span className="text-amber-600 font-medium">Expiring Soon</span>}
                                {license.status === 'expired' && <span className="text-red-600 font-medium">Expired</span>}
                            </div>
                        </div>

                        {license.notes && (
                            <div className="space-y-1 md:col-span-2 border-t pt-3 mt-1">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Remarks / Notes</div>
                                <div className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">{license.notes}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Utilization Progress Card */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Allocation Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Allocation Ratio</span>
                                <span className="font-bold text-foreground">{Math.round(percent)}%</span>
                            </div>
                            <Progress value={percent} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4 text-center">
                            <div className="rounded bg-emerald-50 dark:bg-emerald-950/10 p-2 border border-emerald-100 dark:border-emerald-900/30">
                                <div className="text-2xl font-bold text-emerald-600">{license.available_seats_count}</div>
                                <div className="text-xs text-muted-foreground">Seats Available</div>
                            </div>
                            <div className="rounded bg-rose-50 dark:bg-rose-950/10 p-2 border border-rose-100 dark:border-rose-900/30">
                                <div className="text-2xl font-bold text-rose-600">{license.assigned_seats_count}</div>
                                <div className="text-xs text-muted-foreground">Seats In Use</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Seats List Table */}
            <div className="rounded-lg border bg-card shadow-sm">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold">Seats Allocations</h2>
                </div>
                <DataTable columns={columns} data={license.seats_list} searchKey="seat_number" />
            </div>

            {/* Seat Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent>
                    <form onSubmit={handleCheckout}>
                        <DialogHeader>
                            <DialogTitle>Allocate License Seat #{selectedSeat?.seat_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Checkout Target Type</label>
                                <Select
                                    value={checkoutForm.data.target_type}
                                    onValueChange={(v) => {
                                        checkoutForm.setData((prev) => ({
                                            ...prev,
                                            target_type: v,
                                            user_id: '',
                                            asset_id: '',
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Assign to User</SelectItem>
                                        <SelectItem value="asset">Assign to Hardware Asset</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {checkoutForm.data.target_type === 'user' ? (
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium">Select User *</label>
                                    <Popover open={userComboboxOpen} onOpenChange={setUserComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={userComboboxOpen}
                                                className="justify-between w-full font-normal"
                                            >
                                                {checkoutForm.data.user_id
                                                    ? users.find((u: any) => String(u.id) === checkoutForm.data.user_id)?.name || "User Selected"
                                                    : "Search user by name..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search user..." />
                                                <CommandList>
                                                    <CommandEmpty>No user found.</CommandEmpty>
                                                    {usersBySite.map((group) => (
                                                        <CommandGroup key={group.site} heading={group.site}>
                                                            {group.users.map((user) => (
                                                                <CommandItem
                                                                    key={user.id}
                                                                    value={`${user.name} ${user.email}`} // include both for searching
                                                                    onSelect={() => {
                                                                        checkoutForm.setData('user_id', String(user.id));
                                                                        setUserComboboxOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            checkoutForm.data.user_id === String(user.id) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{user.name}</span>
                                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Hardware Asset *</label>
                                    <Select
                                        value={checkoutForm.data.asset_id}
                                        onValueChange={(v) => checkoutForm.setData('asset_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Search / Select Asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assets.map((a: any) => (
                                                <SelectItem key={a.id} value={String(a.id)}>
                                                    {a.name} · Site: {a.site}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Remarks</label>
                                <Textarea
                                    placeholder="Enter checkout notes or usage context..."
                                    value={checkoutForm.data.notes}
                                    onChange={(e) => checkoutForm.setData('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsCheckoutOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={checkoutForm.processing}>
                                Check Out Seat
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

LicenseShow.layout = {
    breadcrumbs: [
        {
            title: 'Software Licenses',
            href: '/licenses',
        },
        {
            title: 'Details',
            href: '#',
        },
    ],
};
