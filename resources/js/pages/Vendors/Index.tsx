import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Package, Phone, Mail, MapPin, Trash2, Edit, Eye } from 'lucide-react';

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

    const filtered = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(search.toLowerCase()))
    );

    const totalAssets = vendors.reduce((sum, v) => sum + v.assets_count, 0);

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Vendor Management" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendor / Company Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage vendor profiles, logos, and track assets by vendor.
                    </p>
                </div>
                <Link href="/vendors/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add New Vendor
                    </Button>
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Vendors</p>
                        <p className="text-2xl font-bold">{vendors.length}</p>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Assets (All Vendors)</p>
                        <p className="text-2xl font-bold">{totalAssets}</p>
                    </div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Avg Assets per Vendor</p>
                        <p className="text-2xl font-bold">{vendors.length > 0 ? Math.round(totalAssets / vendors.length) : 0}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search vendors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Vendor Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-card border rounded-xl">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">No vendors found</p>
                    <p className="text-muted-foreground text-sm mt-1">Add your first vendor to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(vendor => (
                        <div
                            key={vendor.id}
                            className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                            {/* Card Header with Logo */}
                            <div className="p-5 flex items-start gap-4">
                                <div className="h-16 w-16 rounded-xl border-2 border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
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
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">{vendor.name}</h3>
                                    {vendor.contact_person && (
                                        <p className="text-sm text-muted-foreground truncate">
                                            {vendor.contact_person}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Asset Count Badge */}
                            <div className="px-5 pb-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold">
                                    <Package className="h-3.5 w-3.5" />
                                    {vendor.assets_count} {vendor.assets_count === 1 ? 'Asset' : 'Assets'}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="px-5 pb-4 space-y-1.5">
                                {vendor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{vendor.phone}</span>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{vendor.email}</span>
                                    </div>
                                )}
                                {vendor.address && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{vendor.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="border-t px-5 py-3 flex items-center justify-end gap-2 bg-muted/20">
                                <Link href={`/vendors/${vendor.id}/edit`}>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-blue-600 gap-1">
                                        <Edit className="h-3.5 w-3.5" /> Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-red-600 hover:bg-red-50 gap-1"
                                    onClick={() => {
                                        if (confirm(`Delete vendor "${vendor.name}"?`)) {
                                            router.delete(`/vendors/${vendor.id}`);
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
    breadcrumbs: [
        { title: 'Vendor Management', href: '#' },
    ],
};
