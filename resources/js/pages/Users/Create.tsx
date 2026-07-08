import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

export default function UserCreate({
    roles,
    sites,
}: {
    roles: string[];
    sites: any[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        site_id: '',
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const siteId = params.get('site_id');
        if (siteId) {
            setData('site_id', siteId);
        }
    }, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/users');
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Create User" />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                    Add New User
                </h1>
                <Link href="/users">
                    <Button variant="outline">Back to Users</Button>
                </Link>
            </div>

            <form
                onSubmit={submit}
                className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
            >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && (
                            <div className="text-sm text-red-500">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && (
                            <div className="text-sm text-red-500">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        {errors.password && (
                            <div className="text-sm text-red-500">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">
                            Confirm Password *
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        {mounted && (
                            <Select
                                value={data.role}
                                onValueChange={(val) => setData('role', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Employee', 'Manager'].map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {errors.role && (
                            <div className="text-sm text-red-500">
                                {errors.role}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="site_id">Site *</Label>
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
                            <div className="text-sm text-red-500">
                                {errors.site_id}
                            </div>
                        )}
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
