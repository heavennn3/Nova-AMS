import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserEdit({ user, roles, sites }: { user: any, roles: string[], sites: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        role: user.role || '',
        site_ids: user.site_ids || [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/users/${user.id}`);
    };

    return (
        <div className="p-8 w-full space-y-6">
            <Head title={`Edit User: ${user.name}`} />
            
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
                <Link href="/multi-site/access">
                    <Button variant="outline">Back to Users</Button>
                </Link>
            </div>

            <form onSubmit={submit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <div className="text-sm text-red-500">{errors.name}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <div className="text-sm text-red-500">{errors.email}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Assign Role</Label>
                        <Select value={data.role} onValueChange={(val) => setData('role', val)}>
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
                        Update User
                    </Button>
                </div>
            </form>
        </div>
    );
}

UserEdit.layout = {
    breadcrumbs: [
        {
            title: 'UserEdit',
            href: '#',
        },
    ],
};
