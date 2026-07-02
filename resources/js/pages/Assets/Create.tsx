import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
import { toast } from 'sonner';
import { Plus, X, Upload, FileText, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function AssetCreate({
    categories,
    types,
    vendors,
    sites,
    locations,
    suppliers,
    statusLabels,
    configurations = [],
}: any) {
    const defaultSiteId =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('site_id') || ''
            : '';

    // Build initial form state from configurations + static defaults
    const getInitialData = () => {
        const base: Record<string, any> = {
            image: null as File | null,
            notes: '',
            quantity: 1,
            status: 'available',
        };
        // Ensure every configured column_key has an initial value
        for (const c of configurations) {
            if (!(c.column_key in base)) {
                base[c.column_key] = '';
            }
        }
        // Default site from URL query param
        if (defaultSiteId && !base['site']) {
            base['site'] = defaultSiteId;
        }
        return base;
    };

    const { data, setData, post, processing, errors } = useForm(getInitialData());

    // Local states for dynamic selections
    const [localVendors, setLocalVendors] = useState(vendors || []);
    const [localTypes, setLocalTypes] = useState(types || []);
    const [localStatusLabels, setLocalStatusLabels] = useState(statusLabels || []);
    const [localSites, setLocalSites] = useState(sites || []);
    const [localLocations, setLocalLocations] = useState(locations || []);
    const [localSuppliers, setLocalSuppliers] = useState(suppliers || []);

    // Dialog state
    const [isVendorOpen, setIsVendorOpen] = useState(false);
    const [newVendor, setNewVendor] = useState('');

    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [newType, setNewType] = useState('');

    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newStatusType, setNewStatusType] = useState('deployable');

    const [isSiteOpen, setIsSiteOpen] = useState(false);
    const [newSite, setNewSite] = useState('');

    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [newLocation, setNewLocation] = useState('');

    const [isSupplierOpen, setIsSupplierOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState('');

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // CSRF helper
    const getCsrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    // Inline quick-create handlers
    const createVendor = async () => {
        if (!newVendor.trim()) return;
        try {
            const res = await fetch('/api/quick/vendors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newVendor }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalVendors([...localVendors, item]);
                setData('vendor_id', item.id.toString());
                setIsVendorOpen(false);
                setNewVendor('');
                toast.success('Vendor added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create vendor');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const createType = async () => {
        if (!newType.trim()) return;
        try {
            const res = await fetch('/api/quick/types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newType }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalTypes([...localTypes, item]);
                setData('type_id', item.id.toString());
                setIsTypeOpen(false);
                setNewType('');
                toast.success('Type added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create type');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const createStatus = async () => {
        if (!newStatus.trim()) return;
        try {
            const res = await fetch('/api/quick/status-labels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newStatus, type: newStatusType }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalStatusLabels([...localStatusLabels, item]);
                setData('status_label_id', item.id.toString());
                setIsStatusOpen(false);
                setNewStatus('');
                toast.success('Status label added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create status label');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const createSite = async () => {
        if (!newSite.trim()) return;
        try {
            const res = await fetch('/api/quick/sites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newSite }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalSites([...localSites, item]);
                setData('site_id', item.id.toString());
                setIsSiteOpen(false);
                setNewSite('');
                toast.success('Site added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create site');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const createLocation = async () => {
        if (!newLocation.trim()) return;
        try {
            const res = await fetch('/api/quick/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newLocation }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalLocations([...localLocations, item]);
                setData('location_id', item.id.toString());
                setIsLocationOpen(false);
                setNewLocation('');
                toast.success('Location added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create location');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const createSupplier = async () => {
        if (!newSupplier.trim()) return;
        try {
            const res = await fetch('/api/quick/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newSupplier }),
            });
            if (res.ok) {
                const item = await res.json();
                setLocalSuppliers([...localSuppliers, item]);
                setData('supplier_id', item.id.toString());
                setIsSupplierOpen(false);
                setNewSupplier('');
                toast.success('Supplier added successfully');
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to create supplier');
            }
        } catch (e) {
            toast.error('Connection error');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Lookup maps for FK-driven Select fields
    const fkOptions: Record<string, any[]> = {
        vendor: localVendors,
        type: localTypes,
        category: categories || [],
        status_label: localStatusLabels,
        site: localSites,
        location: localLocations,
        supplier: localSuppliers,
    };

    // Quick-create dialog openers for FK fields
    const fkQuickCreate: Record<string, () => void> = {
        vendor: () => setIsVendorOpen(true),
        type: () => setIsTypeOpen(true),
        status_label: () => setIsStatusOpen(true),
        site: () => setIsSiteOpen(true),
        location: () => setIsLocationOpen(true),
        supplier: () => setIsSupplierOpen(true),
    };

    // Render a single field based on its configuration
    function renderField(config: any, data: any, setData: any, errors: any) {
        const key = config.column_key;
        const label = config.column_title || key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
        const required = config.is_primary_key;

        // Foreign key fields → Select
        if (key in fkOptions) {
            return (
                <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor={key} className="font-medium">
                            {label}{required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {fkQuickCreate[key] && (
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                onClick={fkQuickCreate[key]}
                                className="h-auto p-0 text-xs font-semibold flex items-center gap-0.5 text-primary"
                            >
                                <Plus className="h-3.5 w-3.5" /> New
                            </Button>
                        )}
                    </div>
                    <Select
                        value={data[key]?.toString() || ''}
                        onValueChange={(val) => setData(key, val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {fkOptions[key].map((opt: any) => (
                                <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
                </div>
            );
        }

        // Boolean fields → Yes/No Select
        if (config.data_type === 'boolean') {
            return (
                <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="font-medium">
                        {label}{required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Select
                        value={data[key]?.toString() || ''}
                        onValueChange={(val) => setData(key, val === 'true' ? '1' : val === 'false' ? '0' : '')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
                </div>
            );
        }

        // Text / Number / Date fields → Input
        const inputType = config.data_type === 'number' ? 'number' : config.data_type === 'date' ? 'date' : 'text';
        return (
            <div key={key} className="space-y-2">
                <Label htmlFor={key} className="font-medium">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                    id={key}
                    type={inputType}
                    value={data[key] ?? ''}
                    onChange={(e) => setData(key, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
                {errors[key] && <div className="text-xs text-red-500 mt-1">{errors[key]}</div>}
            </div>
        );
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/assets');
    };

    return (
        <div className="w-full space-y-6 p-8 text-left">
            <Head title="Register Asset" />

            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Register New Asset
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Fill in core details, optional specifications, and order related details.
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-8">
                {/* 1. Core Details Card */}
                <div className="rounded-lg border bg-card/65 p-6 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2 border-b pb-2 mb-4">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-base font-semibold text-foreground">Asset Core Details</h2>
                    </div>

                    {configurations.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {configurations.map((config: any) => renderField(config, data, setData, errors))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No columns configured yet</p>
                            <p className="text-sm mt-1">Go to <strong>Master Data &rarr; Table Configuration</strong> to set up the asset table columns first.</p>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2 mt-4">
                        <Label htmlFor="notes" className="font-medium">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Add administrative or service notes regarding this asset..."
                            rows={3}
                        />
                        {errors.notes && (
                                <div className="text-xs text-red-500 mt-1">{errors.notes}</div>
                            )}
                    </div>

                    {/* Upload Images */}
                    <div className="space-y-2 mt-4">
                        <Label className="font-medium">Upload Image</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1">
                                <Label
                                    htmlFor="image"
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors rounded-lg h-28 cursor-pointer p-4"
                                >
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1.5" />
                                    <span className="text-xs font-semibold text-foreground">Click to upload file</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG up to 4MB</span>
                                </Label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            {imagePreview && (
                                <div className="relative h-28 w-28 border rounded-lg overflow-hidden group bg-muted/20">
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('image', null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Optional Information Card */}
                <div className="rounded-lg border bg-card/65 p-6 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2 border-b pb-2 mb-4">
                        <ShieldCheck className="h-5 w-5 text-indigo-500" />
                        <h2 className="text-base font-semibold text-foreground">Optional Specifications</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Asset Name */}
                        <div className="space-y-2">
                            <Label htmlFor="asset_name" className="font-medium">Asset Name (Custom alias)</Label>
                            <Input
                                id="asset_name"
                                value={data.asset_name}
                                onChange={(e) => setData('asset_name', e.target.value)}
                                placeholder="e.g. IT-LAP-042"
                            />
                            {errors.asset_name && (
                                <div className="text-xs text-red-500 mt-1">{errors.asset_name}</div>
                            )}
                        </div>

                        {/* Warranty Months */}
                        <div className="space-y-2">
                            <Label htmlFor="warranty_months" className="font-medium">Warranty Duration (Months)</Label>
                            <Input
                                id="warranty_months"
                                type="number"
                                min="0"
                                value={data.warranty_months}
                                onChange={(e) => setData('warranty_months', e.target.value)}
                                placeholder="e.g. 36"
                            />
                            {errors.warranty_months && (
                                <div className="text-xs text-red-500 mt-1">{errors.warranty_months}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Order Related Information Card */}
                <div className="rounded-lg border bg-card/65 p-6 shadow-sm space-y-6">
                    <div className="flex items-center space-x-2 border-b pb-2 mb-4">
                        <ShoppingBag className="h-5 w-5 text-amber-500" />
                        <h2 className="text-base font-semibold text-foreground">Order & Purchase Information</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Order Number */}
                        <div className="space-y-2">
                            <Label htmlFor="order_number" className="font-medium">Order Number</Label>
                            <Input
                                id="order_number"
                                value={data.order_number}
                                onChange={(e) => setData('order_number', e.target.value)}
                                placeholder="e.g. PO-892102"
                            />
                            {errors.order_number && (
                                <div className="text-xs text-red-500 mt-1">{errors.order_number}</div>
                            )}
                        </div>

                        {/* Purchase Cost */}
                        <div className="space-y-2">
                            <Label htmlFor="purchase_cost" className="font-medium">Purchase Cost (RM)</Label>
                            <Input
                                id="purchase_cost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.purchase_cost}
                                onChange={(e) => setData('purchase_cost', e.target.value)}
                                placeholder="e.g. 4500.00"
                            />
                            {errors.purchase_cost && (
                                <div className="text-xs text-red-500 mt-1">{errors.purchase_cost}</div>
                            )}
                        </div>

                        {/* Purchase Date */}
                        <div className="space-y-2">
                            <Label htmlFor="purchase_date" className="font-medium">Purchase Date</Label>
                            <Input
                                id="purchase_date"
                                type="date"
                                value={data.purchase_date}
                                onChange={(e) => setData('purchase_date', e.target.value)}
                            />
                            {errors.purchase_date && (
                                <div className="text-xs text-red-500 mt-1">{errors.purchase_date}</div>
                            )}
                        </div>

                        {/* EOL Date */}
                        <div className="space-y-2">
                            <Label htmlFor="eol_date" className="font-medium">End of Life (EOL) Date</Label>
                            <Input
                                id="eol_date"
                                type="date"
                                value={data.eol_date}
                                onChange={(e) => setData('eol_date', e.target.value)}
                            />
                            {errors.eol_date && (
                                <div className="text-xs text-red-500 mt-1">{errors.eol_date}</div>
                            )}
                        </div>

                        {/* Supplier Selection with inline "new" */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="supplier_id" className="font-medium">Supplier</Label>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={() => setIsSupplierOpen(true)}
                                    className="h-auto p-0 text-xs font-semibold flex items-center gap-0.5 text-primary"
                                >
                                    <Plus className="h-3.5 w-3.5" /> New
                                </Button>
                            </div>
                            <Select
                                value={data.supplier_id}
                                onValueChange={(val) => setData('supplier_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {localSuppliers.map((supp: any) => (
                                        <SelectItem key={supp.id} value={supp.id.toString()}>
                                            {supp.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.supplier_id && (
                                <div className="text-xs text-red-500 mt-1">{errors.supplier_id}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end items-center gap-3 border-t pt-6">
                    <Link href="/assets">
                        <Button type="button" variant="outline" size="lg" className="w-28">
                            CANCEL
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing} size="lg" className="w-32 font-semibold">
                        Register
                    </Button>
                </div>
            </form>

            {/* Inlines Dialog Popups */}
            {/* New Vendor Dialog */}
            <Dialog open={isVendorOpen} onOpenChange={setIsVendorOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Vendor</DialogTitle>
                        <DialogDescription>Create a new manufacturer or product vendor reference.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newVendorName">Vendor Name</Label>
                            <Input
                                id="newVendorName"
                                value={newVendor}
                                onChange={(e) => setNewVendor(e.target.value)}
                                placeholder="e.g. Lenovo Group"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVendorOpen(false)}>Cancel</Button>
                        <Button onClick={createVendor}>Add Vendor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Type Dialog */}
            <Dialog open={isTypeOpen} onOpenChange={setIsTypeOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Asset Type</DialogTitle>
                        <DialogDescription>Register a new system classification for assets.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newTypeName">Type Name</Label>
                            <Input
                                id="newTypeName"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                placeholder="e.g. Laptop, Server, Switch"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTypeOpen(false)}>Cancel</Button>
                        <Button onClick={createType}>Add Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Status Label Dialog */}
            <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Status Label</DialogTitle>
                        <DialogDescription>Create a custom status option for asset lifecycle states.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newStatusName">Status Label Name</Label>
                            <Input
                                id="newStatusName"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                placeholder="e.g. On-boarding, In-transit"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newStatusType">Lifecycle Type</Label>
                            <Select value={newStatusType} onValueChange={setNewStatusType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="deployable">Deployable (Available for assign)</SelectItem>
                                    <SelectItem value="pending">Pending (Awaiting setup/check)</SelectItem>
                                    <SelectItem value="undeployable">Undeployable (Cannot be assigned)</SelectItem>
                                    <SelectItem value="archived">Archived (Retired / Disposed)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusOpen(false)}>Cancel</Button>
                        <Button onClick={createStatus}>Add Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Site Dialog */}
            <Dialog open={isSiteOpen} onOpenChange={setIsSiteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Site</DialogTitle>
                        <DialogDescription>Create a new office, warehouse, or regional hub.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newSiteName">Site Name</Label>
                            <Input
                                id="newSiteName"
                                value={newSite}
                                onChange={(e) => setNewSite(e.target.value)}
                                placeholder="e.g. Kuala Lumpur Headquarters"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSiteOpen(false)}>Cancel</Button>
                        <Button onClick={createSite}>Add Site</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Location Dialog */}
            <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Sub-Location</DialogTitle>
                        <DialogDescription>Create a specific building, floor, room, or locker layout.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newLocationName">Location Name</Label>
                            <Input
                                id="newLocationName"
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                placeholder="e.g. Server Room B, Level 3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLocationOpen(false)}>Cancel</Button>
                        <Button onClick={createLocation}>Add Location</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New Supplier Dialog */}
            <Dialog open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                        <DialogDescription>Register a purchasing partner or local parts distributor.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="newSupplierName">Supplier Name</Label>
                            <Input
                                id="newSupplierName"
                                value={newSupplier}
                                onChange={(e) => setNewSupplier(e.target.value)}
                                placeholder="e.g. IT Solutions Sdn Bhd"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSupplierOpen(false)}>Cancel</Button>
                        <Button onClick={createSupplier}>Add Supplier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

AssetCreate.layout = {
    breadcrumbs: [
        {
            title: 'Assets',
            href: '/assets',
        },
        {
            title: 'Register Asset',
            href: '#',
        },
    ],
};
