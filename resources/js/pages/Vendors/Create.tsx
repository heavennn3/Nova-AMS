import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, X } from 'lucide-react';

export default function VendorCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        logo: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/vendors', {
            forceFormData: true,
        });
    };

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Add New Vendor" />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Add New Vendor</h1>
                <Link href="/vendors">
                    <Button variant="outline">Back to Vendors</Button>
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                {/* Logo Upload */}
                <div className="space-y-3">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden relative">
                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            ) : (
                                <Building2 className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" /> Upload Logo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG up to 2MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </div>
                    </div>
                    {errors.logo && <div className="text-sm text-red-500">{errors.logo}</div>}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Company / Vendor Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            required
                            placeholder="e.g. Dell Technologies"
                        />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                            id="contact_person"
                            value={data.contact_person}
                            onChange={e => setData('contact_person', e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                        {errors.contact_person && <div className="text-sm text-red-500">{errors.contact_person}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            placeholder="e.g. +60 12-345-6789"
                        />
                        {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="e.g. contact@vendor.com"
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={data.address}
                            onChange={e => setData('address', e.target.value)}
                            placeholder="Full business address"
                        />
                        {errors.address && <div className="text-sm text-red-500">{errors.address}</div>}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={processing}>
                        Create Vendor
                    </Button>
                </div>
            </form>
        </div>
    );
}

VendorCreate.layout = {
    breadcrumbs: [
        { title: 'Vendors', href: '/vendors' },
        { title: 'Create', href: '#' },
    ],
};
