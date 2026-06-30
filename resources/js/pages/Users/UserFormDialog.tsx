import { useState, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { User, Upload, X, Loader2 } from 'lucide-react';

type UserType = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    ic_number: string | null;
    profile_photo: string | null;
    role: string;
    site_ids?: number[];
    sites: string[];
    is_active: boolean;
    created_at: string;
};

type SiteType = { id: number; name: string };

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: UserType | null;
    roles: string[];
    sites: SiteType[];
}

export function UserFormDialog({
    open,
    onOpenChange,
    user,
    roles,
    sites,
}: UserFormDialogProps) {
    const isEditing = !!user;
    const [preview, setPreview] = useState<string | null>(
        user?.profile_photo || null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            _method: isEditing ? 'PUT' : undefined,
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            password_confirmation: '',
            phone: user?.phone || '',
            ic_number: user?.ic_number || '',
            profile_photo: null as File | null,
            role: user?.role || '',
            site_ids: (user?.site_ids || []) as number[],
        });

    // Reset form when dialog opens/closes or user changes
    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                _method: isEditing ? ('PUT' as any) : undefined,
                name: user?.name || '',
                email: user?.email || '',
                password: '',
                password_confirmation: '',
                phone: user?.phone || '',
                ic_number: user?.ic_number || '',
                profile_photo: null as File | null,
                role: user?.role === 'None' ? '' : user?.role || '',
                site_ids: (user?.site_ids || []) as number[],
            } as any);
            setPreview(user?.profile_photo || null);
        }
    }, [open, user?.id]);

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
        const url = isEditing ? `/users/${user!.id}` : '/users';
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? `Update details for ${user?.name}`
                            : 'Create a new user account with role and site assignment.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-5">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-5">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-muted">
                            {preview ? (
                                <>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <User className="h-8 w-8 text-muted-foreground" />
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
                                <Upload className="h-3.5 w-3.5" />
                                {preview ? 'Change Photo' : 'Upload Photo'}
                            </Button>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                PNG, JPG up to 2MB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>
                    {errors.profile_photo && (
                        <p className="text-sm text-red-500">
                            {errors.profile_photo}
                        </p>
                    )}

                    {/* Fields Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-name">Full Name *</Label>
                            <Input
                                id="dlg-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-email">Email Address *</Label>
                            <Input
                                id="dlg-email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-phone">Phone</Label>
                            <Input
                                id="dlg-phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData('phone', e.target.value)
                                }
                                placeholder="e.g. +60 12-345-6789"
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-ic">IC Number</Label>
                            <Input
                                id="dlg-ic"
                                value={data.ic_number}
                                onChange={(e) =>
                                    setData('ic_number', e.target.value)
                                }
                                placeholder="e.g. 900101-01-1234"
                            />
                            {errors.ic_number && (
                                <p className="text-xs text-red-500">
                                    {errors.ic_number}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-pw">
                                {isEditing
                                    ? 'New Password (leave blank to keep)'
                                    : 'Password *'}
                            </Label>
                            <Input
                                id="dlg-pw"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required={!isEditing}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="dlg-pwc">Confirm Password{!isEditing && ' *'}</Label>
                            <Input
                                id="dlg-pwc"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                required={!isEditing}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Assign Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs text-red-500">
                                    {errors.role}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sites */}
                    <div className="space-y-2">
                        <Label>Assign Sites</Label>
                        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
                            {sites.map((site) => (
                                <div
                                    key={site.id}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        id={`dlg-site-${site.id}`}
                                        checked={data.site_ids.includes(
                                            site.id,
                                        )}
                                        onChange={(e) => {
                                            const ids = [...data.site_ids];
                                            if (e.target.checked) {
                                                ids.push(site.id);
                                            } else {
                                                const i = ids.indexOf(site.id);
                                                if (i > -1) ids.splice(i, 1);
                                            }
                                            setData('site_ids', ids);
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label
                                        htmlFor={`dlg-site-${site.id}`}
                                        className="cursor-pointer text-sm font-medium"
                                    >
                                        {site.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            User will have access to data across all selected
                            sites.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEditing ? 'Update User' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
