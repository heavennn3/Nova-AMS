import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus,
    Search,
    Building2,
    Package,
    Phone,
    Mail,
    MapPin,
    Trash2,
    Edit,
    Eye,
} from 'lucide-react';

type Vendor = {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    logo: string | null;
    assets_count: number;
};

export default function VendorsIndex({ vendors }: { vendors: Vendor[] }) {
    const [search, setSearch] = useState('');

    const filtered = vendors.filter(
        (v) =>
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.contact_person &&
                v.contact_person.toLowerCase().includes(search.toLowerCase())),
    );

    const totalAssets = vendors.reduce((sum, v) => sum + v.assets_count, 0);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Vendor Management" />

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Vendor / Company Management
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage vendor profiles, logos, and track assets by
                        vendor.
                    </p>
                </div>
                <Link href="/vendors/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add New Vendor
                    </Button>
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                        <Building2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Vendors
                        </p>
                        <p className="text-2xl font-bold">{vendors.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Assets (All Vendors)
                        </p>
                        <p className="text-2xl font-bold">{totalAssets}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                        <Building2 className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Avg Assets per Vendor
                        </p>
                        <p className="text-2xl font-bold">
                            {vendors.length > 0
                                ? Math.round(totalAssets / vendors.length)
                                : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search vendors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Vendor Cards Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border bg-card py-16 text-center">
                    <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">
                        No vendors found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Add your first vendor to get started.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="group overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Card Header with Logo */}
                            <div className="flex items-start gap-4 p-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-muted">
                                    {vendor.logo ? (
                                        <img
                                            src={vendor.logo}
                                            alt={vendor.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Building2 className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-lg font-semibold">
                                        {vendor.name}
                                    </h3>
                                    {vendor.contact_person && (
                                        <p className="truncate text-sm text-muted-foreground">
                                            {vendor.contact_person}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Asset Count Badge */}
                            <div className="px-5 pb-3">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                    <Package className="h-3.5 w-3.5" />
                                    {vendor.assets_count}{' '}
                                    {vendor.assets_count === 1
                                        ? 'Asset'
                                        : 'Assets'}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-1.5 px-5 pb-4">
                                {vendor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            {vendor.phone}
                                        </span>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            {vendor.email}
                                        </span>
                                    </div>
                                )}
                                {vendor.address && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            {vendor.address}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-5 py-3">
                                <Link href={`/vendors/${vendor.id}/edit`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-1 px-2 text-blue-600"
                                    >
                                        <Edit className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 px-2 text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `Delete vendor "${vendor.name}"?`,
                                            )
                                        ) {
                                            router.delete(
                                                `/vendors/${vendor.id}`,
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

VendorsIndex.layout = {
    breadcrumbs: [{ title: 'Vendor Management', href: '#' }],
};
