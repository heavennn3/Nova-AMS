import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Check,
    ChevronsUpDown,
    PlusCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SimpleLicensesProps = {
    licenses: any[];
    users: any[];
    assets: any[];
    sites: any[];
    vendors: any[];
    error?: string;
};

export default function SimpleLicensesIndex({
    licenses = [],
    users = [],
    assets = [],
    sites = [],
    vendors = [],
    error = '',
}: SimpleLicensesProps) {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'inuse'>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createKeyVisible, setCreateKeyVisible] = useState(false);
    const [vendorOpen, setVendorOpen] = useState(false);
    const [vendorSearch, setVendorSearch] = useState('');

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

    // Calculate metrics
    const totalLicenses = licenses.length;

    const activeLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return true; // Never expires = active
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() > now.getTime();
    });

    const expiringLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    });

    const expiredLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() <= now.getTime();
    });

    const inUseLicenses = licenses.filter((lic: any) => lic.used_seats > 0);

    // Get filtered licenses based on selected filter
    const filteredLicenses = useMemo(() => {
        switch (selectedFilter) {
            case 'active':
                return activeLicenses;
            case 'expiring':
                return expiringLicenses;
            case 'expired':
                return expiredLicenses;
            case 'inuse':
                return inUseLicenses;
            default:
                return licenses;
        }
    }, [selectedFilter, licenses, activeLicenses, expiringLicenses, expiredLicenses, inUseLicenses]);

    const getStatusBadge = (license: any) => {
        if (!license.expiration_date) {
            return <Badge variant="secondary">Never Expires</Badge>;
        }

        const expiry = new Date(license.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return <Badge variant="destructive">Expired</Badge>;
        } else if (diffDays <= 30) {
            return <Badge variant="outline" className="border-amber-300 text-amber-700">Expiring Soon</Badge>;
        } else {
            return <Badge variant="outline" className="border-green-300 text-green-700">Active</Badge>;
        }
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Software Licenses" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Software Licenses</h1>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create License
                </Button>
            </div>



            {/* Clickable Metric Cards - Old Box Style */}
            <div className="grid grid-cols-5 gap-4">
                <div
                    className={`bg-blue-50 border border-blue-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        }`}
                    onClick={() => setSelectedFilter('all')}
                >
                    <h3 className="font-semibold text-blue-900">Total Licenses</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalLicenses}</p>

                </div>

                <div
                    className={`bg-green-50 border border-green-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedFilter === 'active' ? 'ring-2 ring-green-500 shadow-lg' : ''
                        }`}
                    onClick={() => setSelectedFilter('active')}
                >
                    <h3 className="font-semibold text-green-900">Active</h3>
                    <p className="text-2xl font-bold text-green-600">{activeLicenses.length}</p>

                </div>

                <div
                    className={`bg-purple-50 border border-purple-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedFilter === 'inuse' ? 'ring-2 ring-purple-500 shadow-lg' : ''
                        }`}
                    onClick={() => setSelectedFilter('inuse')}
                >
                    <h3 className="font-semibold text-purple-900">In Use</h3>
                    <p className="text-2xl font-bold text-purple-600">{inUseLicenses.length}</p>
                </div>

                <div
                    className={`bg-amber-50 border border-amber-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedFilter === 'expiring' ? 'ring-2 ring-amber-500 shadow-lg' : ''
                        }`}
                    onClick={() => setSelectedFilter('expiring')}
                >
                    <h3 className="font-semibold text-amber-900">Expiring Soon</h3>
                    <p className="text-2xl font-bold text-amber-600">{expiringLicenses.length}</p>

                </div>

                <div
                    className={`bg-red-50 border border-red-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedFilter === 'expired' ? 'ring-2 ring-red-500 shadow-lg' : ''
                        }`}
                    onClick={() => setSelectedFilter('expired')}
                >
                    <h3 className="font-semibold text-red-900">Expired </h3>
                    <p className="text-2xl font-bold text-red-600">{expiredLicenses.length}</p>

                </div>


            </div>







            {/* Filtered License Table */}
            <div className="bg-white border rounded-lg">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {selectedFilter === 'all' ? 'All Licenses' :
                                selectedFilter === 'active' ? 'Active Licenses' :
                                    selectedFilter === 'expiring' ? 'Expiring This Month' :
                                        selectedFilter === 'expired' ? 'Expired Licenses' :
                                            'In Use Licenses'}
                            ({filteredLicenses.length})
                        </h2>

                    </div>
                </div>

                <div className="p-6">
                    {filteredLicenses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                                No {selectedFilter === 'all' ? '' :
                                    selectedFilter === 'active' ? 'active ' :
                                        selectedFilter === 'expiring' ? 'expiring ' :
                                            selectedFilter === 'expired' ? 'expired ' :
                                                'in-use '}licenses found
                            </p>

                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLicenses.map((license: any) => (
                                <div key={license.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{license.name}</h3>
                                                {getStatusBadge(license)}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Type:</span> {license.license_type || 'Not specified'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Seats:</span> {license.used_seats || 0}/{license.total_seats || 0} used
                                                </div>
                                                <div>
                                                    <span className="font-medium">Vendor:</span> {license.vendor || 'Not specified'}
                                                </div>
                                                {license.expiration_date && (
                                                    <div>
                                                        <span className="font-medium">Expires:</span> {new Date(license.expiration_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            {license.product_key && (
                                                <div className="mt-2 text-xs font-mono text-gray-500 bg-gray-100 p-2 rounded">
                                                    Key: {license.product_key.substring(0, 20)}...
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {license.purchase_cost ? `$${license.purchase_cost}` : 'No cost'}
                                            </div>
                                            {license.site && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Site: {license.site}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create License Modal ── */}
            <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) { form.reset(); setCreateKeyVisible(false); } }}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Create License</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">License Name *</label>
                                <Input required placeholder="e.g. Microsoft 365 Business" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                                {form.errors.name && <p className="text-xs text-rose-600">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vendor</label>
                                <Popover open={vendorOpen} onOpenChange={setVendorOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={vendorOpen} className="w-full justify-between font-normal">
                                            {form.data.vendor_id ? vendors.find((v: any) => String(v.id) === form.data.vendor_id)?.name : 'Select vendor…'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search vendor…" value={vendorSearch} onValueChange={setVendorSearch} />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent"
                                                        onClick={async () => {
                                                            const name = vendorSearch.trim();
                                                            if (!name) return;
                                                            try {
                                                                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                                                const res = await fetch('/api/quick/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token }, body: JSON.stringify({ name }) });
                                                                if (!res.ok) throw new Error();
                                                                const vendor = await res.json();
                                                                form.setData('vendor_id', String(vendor.id));
                                                                setVendorOpen(false);
                                                                setVendorSearch('');
                                                                toast.success(`Vendor "${name}" created.`);
                                                            } catch { toast.error('Failed to create vendor.'); }
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4" /> Create vendor "<span className="font-medium">{vendorSearch}</span>"
                                                    </button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {vendors.map((v: any) => (
                                                        <CommandItem key={v.id} value={v.name} onSelect={() => { form.setData('vendor_id', String(v.id)); setVendorOpen(false); setVendorSearch(''); }}>
                                                            <Check className={cn('mr-2 h-4 w-4', form.data.vendor_id === String(v.id) ? 'opacity-100' : 'opacity-0')} />
                                                            {v.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type *</label>
                                <Select value={form.data.license_type} onValueChange={(v) => form.setData('license_type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="perpetual">Perpetual</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Product Key</label>
                                <div className="relative">
                                    <Input type={createKeyVisible ? 'text' : 'password'} placeholder="AAAAA-BBBBB-CCCCC-DDDDD-EEEEE" value={form.data.product_key ?? ''} onChange={(e) => form.setData('product_key', e.target.value)} className="pr-9 font-mono text-sm" />
                                    <button type="button" onClick={() => setCreateKeyVisible(!createKeyVisible)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {createKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">Key is hidden by default. Toggle to reveal.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expiry Date</label>
                                <Input type="date" value={form.data.expiration_date ?? ''} onChange={(e) => form.setData('expiration_date', e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => { setIsCreateOpen(false); form.reset(); setCreateKeyVisible(false); }}>Cancel</Button>
                            <Button type="submit" disabled={form.processing}>{form.processing ? 'Creating…' : 'Create License'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

SimpleLicensesIndex.layout = {
    breadcrumbs: [
        { title: 'Software Licenses', href: '/licenses' },
    ],
};