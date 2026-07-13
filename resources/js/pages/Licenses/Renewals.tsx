import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, RefreshCw, DollarSign, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
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

type RenewalsProps = {
    licenses: any[];
};

export default function Renewals({ licenses = [] }: RenewalsProps) {
    const [isRenewalDialogOpen, setIsRenewalDialogOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<any>(null);
    const [renewalFormData, setRenewalFormData] = useState<any>({});

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'License Name',
                cell: ({ row }: any) => (
                    <Link
                        href={`/licenses/${row.original.id}`}
                        className="font-semibold hover:text-primary"
                    >
                        {row.getValue('name')}
                    </Link>
                ),
            },
            {
                accessorKey: 'oem',
                header: 'OEM',
                cell: ({ row }: any) => row.original.oem || 'N/A',
            },
            {
                accessorKey: 'end_date',
                header: ({ column }: any) => <DataTableColumnHeader column={column} title="Expiration" />,
                cell: ({ row }: any) => {
                    const date = row.getValue('end_date');
                    if (!date) return <span className="text-muted-foreground">No expiration</span>;

                    const dateObj = new Date(date);
                    const isExpired = dateObj < new Date();
                    const isExpiringSoon = !isExpired && (dateObj.getTime() - new Date().getTime()) < (30 * 24 * 60 * 60 * 1000);

                    return (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                                {dateObj.toLocaleDateString()}
                            </span>
                            {isExpiringSoon && !isExpired && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30 text-xs">Expiring Soon</Badge>
                            )}
                            {isExpired && (
                                <Badge variant="destructive" className="text-xs">Expired</Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }: any) => {
                    const status = row.original.status;
                    const colors: Record<string, string> = {
                        available: 'bg-green-100 text-green-700 border-green-200',
                        full: 'bg-blue-100 text-blue-700 border-blue-200',
                        expiring_soon: 'bg-amber-100 text-amber-700 border-amber-200',
                        expired: 'bg-red-100 text-red-700 border-red-200',
                    };
                    return <Badge className={`text-xs ${colors[status] || ''}`}>{status?.replace(/_/g, ' ')}</Badge>;
                },
            },
            {
                accessorKey: 'type',
                header: 'Type',
                cell: ({ row }: any) => <span className="capitalize">{row.original.type || '—'}</span>,
            },
            {
                accessorKey: 'oem',
                header: 'OEM',
                cell: ({ row }: any) => <span>{row.original.oem || '—'}</span>,
            },
            {
                accessorKey: 'renewals_history',
                header: 'Renewal History',
                cell: ({ row }: any) => {
                    const history = row.original.renewals_history || [];
                    if (history.length === 0) return <span className="text-muted-foreground">No renewals</span>;

                    return (
                        <div className="max-h-[150px] space-y-2 overflow-y-auto">
                            {history.slice(0, 3).map((renewal: any, index: number) => (
                                <div key={index} className="flex items-center justify-between border-b border-border pb-1">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium">
                                            {new Date(renewal.new_expiration).toLocaleDateString()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(renewal.renewed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge variant="outline" className="text-[10px]">
                                            {renewal.renewal_type}
                                        </Badge>
                                        {renewal.renewal_cost && (
                                            <span className="text-xs font-medium">
                                                ${renewal.renewal_cost}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {history.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                    +{history.length - 3} more renewals
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'actions',
                header: 'Actions',
                cell: ({ row }: any) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecordRenewal(row.original)}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Record Renewal
                    </Button>
                ),
            },
        ],
        [],
    );

    // Statistics
    const stats = React.useMemo(() => {
        const total = licenses.length;
        const expired = licenses.filter(l => {
            return l.status === 'expired';
        }).length;
        const expiringSoon = licenses.filter(l => {
            return l.status === 'expiring_soon';
        }).length;

        return { total, expired, expiringSoon };
    }, [licenses]);

    const handleRecordRenewal = (license: any) => {
        setSelectedLicense(license);
        setRenewalFormData({
            license_id: license.id,
            new_expiration: license.end_date || '',
            renewal_cost: '',
            renewal_type: 'manual',
            notes: '',
        });
        setIsRenewalDialogOpen(true);
    };

    const handleSubmitRenewal = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            `/licenses/${selectedLicense.id}/record-renewal`,
            renewalFormData,
            {
                onSuccess: () => setIsRenewalDialogOpen(false),
            }
        );
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="License Renewals" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">License Renewals Management</h1>

                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Licenses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
                                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.expired}</p>
                                <p className="text-sm text-muted-foreground">Expired</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                                <RefreshCw className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{licenses.length}</p>
                                <p className="text-sm text-muted-foreground">Total Licenses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Alert */}
            {(stats.expiringSoon > 0 || stats.expired > 0) && (
                <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900">Renewal Action Required</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                {stats.expired} licenses have expired and {stats.expiringSoon} licenses are expiring soon.
                                Review these licenses for renewal to ensure continued compliance.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <DataTable columns={columns} data={licenses} searchKey="name" />
            </div>

            {/* Record Renewal Dialog */}
            <Dialog open={isRenewalDialogOpen} onOpenChange={setIsRenewalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record License Renewal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitRenewal} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>License</Label>
                            <Input value={selectedLicense?.name || ''} disabled className="bg-muted" />
                        </div>

                        <div className="grid gap-2">
                            <Label>Current Expiration</Label>
                            <Input
                                value={selectedLicense?.end_date ? new Date(selectedLicense.end_date).toLocaleDateString() : 'N/A'}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>New Expiration Date *</Label>
                            <Input
                                type="date"
                                value={renewalFormData.new_expiration || ''}
                                onChange={(e) => setRenewalFormData({ ...renewalFormData, new_expiration: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Renewal Cost</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={renewalFormData.renewal_cost || ''}
                                onChange={(e) => setRenewalFormData({ ...renewalFormData, renewal_cost: parseFloat(e.target.value) })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Renewal Type *</Label>
                            <Select
                                value={renewalFormData.renewal_type || 'manual'}
                                onValueChange={(val) => setRenewalFormData({ ...renewalFormData, renewal_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select renewal type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="automatic">Automatic</SelectItem>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="upgrade">Upgrade</SelectItem>
                                    <SelectItem value="downgrade">Downgrade</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Input
                                value={renewalFormData.notes || ''}
                                onChange={(e) => setRenewalFormData({ ...renewalFormData, notes: e.target.value })}
                                placeholder="Renewal notes, reference numbers, etc."
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsRenewalDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Record Renewal
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Renewals.layout = {
    breadcrumbs: [
        { title: 'Software Licenses', href: '/licenses' },
        { title: 'Renewals', href: '/licenses/renewals' },
    ],
};