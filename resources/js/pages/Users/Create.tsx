import { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Upload, X } from 'lucide-react';

export default function UserCreate({ roles, sites }: { roles: string[], sites: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        ic_number: '',
        profile_photo: null as File | null,
        role: '',
        site_ids: [] as number[],
    });

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_photo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setData('profile_photo', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users', {
            forceFormData: true,
        });
    };

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Create User" />
            
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
                <Link href="/users">
                    <Button variant="outline">Back to Users</Button>
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
                {/* Profile Photo Upload */}
                <div className="space-y-3">
                    <Label>Profile Photo</Label>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden relative">
                            {preview ? (
                                <>
                                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </>
                            ) : (
                                <User className="h-10 w-10 text-muted-foreground" />
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
                                <Upload className="h-4 w-4" /> Upload Photo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1.5">PNG, JPG up to 2MB</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>
                    {errors.profile_photo && <div className="text-sm text-red-500">{errors.profile_photo}</div>}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="e.g. Ahmad bin Abdullah"
                        />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="e.g. user@company.com"
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="e.g. +60 12-345-6789"
                        />
                        {errors.phone && <div className="text-sm text-red-500">{errors.phone}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ic_number">IC Number</Label>
                        <Input
                            id="ic_number"
                            value={data.ic_number}
                            onChange={(e) => setData('ic_number', e.target.value)}
                            placeholder="e.g. 900101-01-1234"
                        />
                        {errors.ic_number && <div className="text-sm text-red-500">{errors.ic_number}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Assign Role</Label>
                        <Select onValueChange={(val) => setData('role', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <div className="text-sm text-red-500">{errors.role}</div>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Assign Sites</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border">
                            {sites.map(site => (
                                <div key={site.id} className="flex items-center space-x-2">
                                    <input 
                                        type="checkbox"
                                        id={`site-${site.id}`}
                                        checked={data.site_ids.includes(site.id)}
                                        onChange={(e) => {
                                            const siteIds = [...data.site_ids];
                                            if (e.target.checked) {
                                                siteIds.push(site.id);
                                            } else {
                                                const index = siteIds.indexOf(site.id);
                                                if (index > -1) siteIds.splice(index, 1);
                                            }
                                            setData('site_ids', siteIds);
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`site-${site.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        {site.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">User will have access to data across all selected sites.</p>
                        {errors.site_ids && <div className="text-sm text-red-500">{errors.site_ids}</div>}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={processing}>
                        Create User
                    </Button>
                </div>
            </form>
        </div>
    );
}

UserCreate.layout = {
    breadcrumbs: [
        {
            title: 'Create User',
            href: '#',
        },
    ],
};
