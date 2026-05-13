import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Edit, Trash2, ShieldCheck, User as UserIcon,
    Search, Users, MapPin, Phone, Mail, CreditCard,
    Filter, X, ChevronDown,
} from 'lucide-react';

type UserType = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    ic_number: string | null;
    profile_photo: string | null;
    role: string;
    sites: string[];
    created_at: string;
};

type SiteType = { id: number; name: string };

export default function UsersIndex({ users, sites }: { users: UserType[]; sites: SiteType[] }) {
    const [search, setSearch] = useState('');
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<string>('all');

    // Derive unique roles
    const allRoles = useMemo(() => {
        const roles = new Set(users.map(u => u.role));
        return Array.from(roles).sort();
    }, [users]);

    // Filtered users
    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                (u.phone && u.phone.includes(search)) ||
                (u.ic_number && u.ic_number.includes(search));
            const matchesSite =
                selectedSite === 'all' || u.sites.includes(selectedSite);
            const matchesRole =
                selectedRole === 'all' || u.role === selectedRole;
            return matchesSearch && matchesSite && matchesRole;
        });
    }, [users, search, selectedSite, selectedRole]);

    // Stats
    const totalUsers = users.length;
    const roleBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        users.forEach(u => {
            map[u.role] = (map[u.role] || 0) + 1;
        });
        return map;
    }, [users]);

    const hasActiveFilters = selectedSite !== 'all' || selectedRole !== 'all' || search !== '';

    const roleColors: Record<string, { badge: string; dot: string }> = {
        'Admin': { badge: 'bg-purple-500/10 text-purple-700 ring-purple-500/20', dot: 'bg-purple-500' },
        'Site Manager': { badge: 'bg-blue-500/10 text-blue-700 ring-blue-500/20', dot: 'bg-blue-500' },
        'Technician': { badge: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20', dot: 'bg-emerald-500' },
        'Viewer': { badge: 'bg-slate-500/10 text-slate-700 ring-slate-500/20', dot: 'bg-slate-500' },
        'None': { badge: 'bg-gray-500/10 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' },
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const avatarGradients = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-violet-500 to-purple-600',
        'from-cyan-500 to-blue-600',
    ];

    const getGradient = (id: number) => avatarGradients[id % avatarGradients.length];

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="User Management" />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user profiles, roles, and site assignments.
                    </p>
                </div>
                <Link href="/users/create">
                    <Button className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" /> Add New User
                    </Button>
                </Link>
            </div>

            {/* ── Stats ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-card border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                            <p className="text-xl font-bold">{totalUsers}</p>
                        </div>
                    </div>
                </div>
                {allRoles.slice(0, 3).map(role => {
                    const colors = roleColors[role] || roleColors['None'];
                    return (
                        <div key={role} className="bg-card border rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg ${colors.badge} flex items-center justify-center`}>
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{role}s</p>
                                    <p className="text-xl font-bold">{roleBreakdown[role] || 0}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Filters Bar ────────────────────────────────────────── */}
            <div className="bg-card border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name, email, phone, IC..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Site Filter */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={selectedSite}
                            onChange={e => setSelectedSite(e.target.value)}
                            className="h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">All Sites</option>
                            {sites.map(site => (
                                <option key={site.id} value={site.name}>{site.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            className="h-9 pl-9 pr-8 rounded-md border border-input bg-background text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">All Roles</option>
                            {allRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground hover:text-foreground shrink-0"
                            onClick={() => {
                                setSearch('');
                                setSelectedSite('all');
                                setSelectedRole('all');
                            }}
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}

                    <div className="ml-auto text-xs text-muted-foreground shrink-0">
                        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {totalUsers} users
                    </div>
                </div>
            </div>

            {/* ── User Cards Grid ────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-card border rounded-xl">
                    <UserIcon className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No users found</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(user => {
                        const colors = roleColors[user.role] || roleColors['None'];
                        return (
                            <div
                                key={user.id}
                                className="bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-foreground/10 transition-all duration-300 group"
                            >
                                {/* Top accent */}
                                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                                <div className="p-5">
                                    {/* Avatar + Name Row */}
                                    <div className="flex items-start gap-4">
                                        <div className={`h-14 w-14 rounded-full shrink-0 flex items-center justify-center overflow-hidden border-2 border-border ${!user.profile_photo ? `bg-gradient-to-br ${getGradient(user.id)}` : 'bg-muted'}`}>
                                            {user.profile_photo ? (
                                                <img
                                                    src={user.profile_photo}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-bold text-sm">
                                                    {getInitials(user.name)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base truncate">{user.name}</h3>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${colors.badge} mt-1`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        {user.ic_number && (
                                            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                                <CreditCard className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                                                <span>IC: {user.ic_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sites */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground/60" />
                                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Assigned Sites</span>
                                        </div>
                                        {user.sites.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.sites.map(site => (
                                                    <span
                                                        key={site}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/8 text-blue-700 text-[11px] font-medium border border-blue-500/15"
                                                    >
                                                        {site}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">All Sites (unrestricted)</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="border-t px-5 py-2.5 flex items-center justify-between bg-muted/20">
                                    <span className="text-[10px] text-muted-foreground">
                                        Joined {user.created_at.split(' ')[0]}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/users/${user.id}/edit`}>
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600 text-xs gap-1">
                                                <Edit className="h-3 w-3" /> Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-red-600 hover:bg-red-50 text-xs gap-1"
                                            onClick={() => {
                                                if (confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
                                                    router.delete(`/users/${user.id}`);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'User Management', href: '#' },
    ],
};
