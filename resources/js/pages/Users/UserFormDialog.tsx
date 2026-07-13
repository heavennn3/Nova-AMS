import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

type UserType = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role: string;
    site_id: number | null;
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

// Filter out Admin role for regular user management
const availableRoles = ['Manager', 'Employee'];

export function UserFormDialog({
    open,
    onOpenChange,
    user,
    roles,
    sites,
}: UserFormDialogProps) {
    const isEditing = !!user;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
 setMounted(true); 
}, []);

    // Get role ID from role name for editing
    const getRoleIdFromName = (roleName: string | undefined): string => {
        if (!roleName || roleName === 'None') return '';
        const roleMap: Record<string, string> = {
            'Manager': '2',
            'Employee': '3',
        };
        return roleMap[roleName] || '';
    };

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            _method: isEditing ? 'PUT' : undefined,
            name: user?.name || '',
            email: user?.email || '',
            password: '',
            password_confirmation: '',
            role_id: getRoleIdFromName(user?.role),
            site_id: user?.site_id?.toString() || '',
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
                role_id: getRoleIdFromName(user?.role),
                site_id: user?.site_id?.toString() || '',
            } as any);
        }
    }, [open, user?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing ? `/users/${user!.id}` : '/users';
        post(url, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" onCloseAutoFocus={(e) => e.preventDefault()}>
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
                            <Label>Role *</Label>
                            {mounted && (
                                <Select
                                    value={data.role_id}
                                    onValueChange={(val) => setData('role_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role, index) => (
                                            <SelectItem key={role} value={String(index + 2)}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.role_id && (
                                <p className="text-xs text-red-500">
                                    {errors.role_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Site *</Label>
                            {mounted && (
                                <Select
                                    value={data.site_id}
                                    onValueChange={(val) => setData('site_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map((site) => (
                                            <SelectItem
                                                key={site.id}
                                                value={site.id.toString()}
                                            >
                                                {site.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.site_id && (
                                <p className="text-xs text-red-500">
                                    {errors.site_id}
                                </p>
                            )}
                        </div>
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
