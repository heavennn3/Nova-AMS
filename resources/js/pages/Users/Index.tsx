import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Plus,
    Edit,
    Trash2,
    ShieldCheck,
    User as UserIcon,
    Users,
    Filter,
    X,
    Check,
    Search,
    Power,
    UserX,
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
    is_active: boolean;
    created_at: string;
};

type SiteType = { id: number; name: string };

export default function UsersIndex({
    users,
    sites,
}: {
    users: UserType[];
    sites: SiteType[];
}) {
    const [selectedSite, setSelectedSite] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [search, setSearch] = useState('');

    // Unique roles
    const allRoles = useMemo(() => {
        const roles = new Set(users.map((u) => u.role));
        return Array.from(roles).sort();
    }, [users]);

    // Filter
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSite =
                selectedSite === 'all' || u.sites.includes(selectedSite);
            const matchesRole =
                selectedRole === 'all' || u.role === selectedRole;
            const matchesStatus =
                selectedStatus === 'all' ||
                (selectedStatus === 'active' && u.is_active) ||
                (selectedStatus === 'deactivated' && !u.is_active);
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.phone && u.phone.toLowerCase().includes(q)) ||
                (u.ic_number && u.ic_number.toLowerCase().includes(q));
            return matchesSite && matchesRole && matchesStatus && matchesSearch;
        });
    }, [users, selectedSite, selectedRole, selectedStatus, search]);

    const activeFilterCount =
        (selectedSite !== 'all' ? 1 : 0) +
        (selectedRole !== 'all' ? 1 : 0) +
        (selectedStatus !== 'all' ? 1 : 0);

    // Stats
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.is_active).length;
    const deactivatedUsers = users.filter((u) => !u.is_active).length;
    const roleBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        users.forEach((u) => {
            map[u.role] = (map[u.role] || 0) + 1;
        });
        return map;
    }, [users]);

    const roleColors: Record<string, string> = {
        Admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        'Site Manager':
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        Technician:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        Viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
        None: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    const avatarGradients = [
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-violet-500 to-purple-600',
        'from-cyan-500 to-blue-600',
    ];

    const columns: any[] = [
        {
            id: 'avatar',
            header: '',
            cell: ({ row }: any) => {
                const user = row.original;
                const gradient =
                    avatarGradients[user.id % avatarGradients.length];
                return (
                    <div
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border ${!user.profile_photo ? `bg-gradient-to-br ${gradient}` : 'bg-muted'} ${!user.is_active ? 'opacity-50 grayscale' : ''}`}
                    >
                        {user.profile_photo ? (
                            <img
                                src={user.profile_photo}
                                alt={user.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-white">
                                {getInitials(user.name)}
                            </span>
                        )}
                    </div>
                );
            },
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: 'name',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }: any) => {
                const user = row.original;
                return (
                    <div
                        className={`min-w-[140px] ${!user.is_active ? 'opacity-60' : ''}`}
                    >
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {user.email}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'phone',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }: any) => {
                const phone = row.original.phone;
                return phone ? (
                    <span className="text-sm">{phone}</span>
                ) : (
                    <span className="text-xs text-muted-foreground italic">
                        —
                    </span>
                );
            },
        },
        {
            accessorKey: 'ic_number',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="IC Number" />
            ),
            cell: ({ row }: any) => {
                const ic = row.original.ic_number;
                return ic ? (
                    <span className="font-mono text-sm">{ic}</span>
                ) : (
                    <span className="text-xs text-muted-foreground italic">
                        —
                    </span>
                );
            },
        },
        {
            accessorKey: 'role',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }: any) => {
                const role = row.original.role;
                const colorClass = roleColors[role] || roleColors['None'];
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
                    >
                        {role}
                    </span>
                );
            },
        },
        {
            id: 'status',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }: any) => {
                const isActive = row.original.is_active;
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
                        />
                        {isActive ? 'Active' : 'Deactivated'}
                    </span>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: 'sites',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Assigned Sites" />
            ),
            cell: ({ row }: any) => {
                const userSites: string[] = row.original.sites || [];
                if (userSites.length === 0) {
                    return (
                        <span className="text-xs text-muted-foreground italic">
                            All Sites
                        </span>
                    );
                }
                return (
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                        {userSites.map((site) => (
                            <span
                                key={site}
                                className="inline-flex items-center rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                                {site}
                            </span>
                        ))}
                    </div>
                );
            },
            enableSorting: false,
        },
        {
            accessorKey: 'created_at',
            header: ({ column }: any) => (
                <DataTableColumnHeader column={column} title="Created" />
            ),
            cell: ({ row }: any) => (
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                    {row.original.created_at.split(' ')[0]}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Link href={`/users/${user.id}/edit`}>
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
                            className={`h-8 gap-1 px-2 ${
                                user.is_active
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                            onClick={() => {
                                const action = user.is_active
                                    ? 'deactivate'
                                    : 'activate';
                                if (
                                    confirm(
                                        `${user.is_active ? 'Deactivate' : 'Activate'} user "${user.name}"?`,
                                    )
                                ) {
                                    router.patch(
                                        `/users/${user.id}/toggle-active`,
                                    );
                                }
                            }}
                        >
                            <Power className="h-3.5 w-3.5" />
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if (
                                    confirm(
                                        `Delete user "${user.name}"? This action cannot be undone.`,
                                    )
                                ) {
                                    router.delete(`/users/${user.id}`);
                                }
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="User Management" />

            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        User Management
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage user profiles, roles, and site access across the
                        system.
                    </p>
                </div>
                <Link href="/users/create">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add New User
                    </Button>
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10">
                        <Users className="h-4.5 w-4.5 text-blue-500" />
                    </div>
                    <div>
                        <p className="mb-0.5 text-[11px] leading-none text-muted-foreground">
                            Total Users
                        </p>
                        <p className="text-lg leading-none font-bold">
                            {totalUsers}
                        </p>
                    </div>
                </div>
                <div
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all ${selectedStatus === 'deactivated' ? 'border-red-400 ring-2 ring-red-500' : 'hover:border-red-300'}`}
                    onClick={() =>
                        setSelectedStatus(
                            selectedStatus === 'deactivated'
                                ? 'all'
                                : 'deactivated',
                        )
                    }
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500/10">
                        <UserX className="h-4.5 w-4.5 text-red-500" />
                    </div>
                    <div>
                        <p className="mb-0.5 text-[11px] leading-none text-muted-foreground">
                            Deactivated
                        </p>
                        <p className="text-lg leading-none font-bold text-red-600 dark:text-red-400">
                            {deactivatedUsers}
                        </p>
                    </div>
                </div>
                {Object.entries(roleBreakdown).map(([role, count]) => {
                    const color = roleColors[role] || roleColors['None'];
                    return (
                        <div
                            key={role}
                            className="flex items-center gap-3 rounded-lg border bg-card p-3"
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-md ${color}`}
                            >
                                <ShieldCheck className="h-4.5 w-4.5" />
                            </div>
                            <div>
                                <p className="mb-0.5 text-[11px] leading-none text-muted-foreground">
                                    {role}
                                </p>
                                <p className="text-lg leading-none font-bold">
                                    {count}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search + Filter row */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-[250px]">
                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search name, email, phone, IC..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-dashed"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                        <div className="border-b p-3">
                            <p className="text-sm font-semibold">
                                Filter Users
                            </p>
                        </div>

                        {/* Status Section */}
                        <div className="border-b p-3">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Status
                            </p>
                            <div className="space-y-0.5">
                                {[
                                    {
                                        value: 'all',
                                        label: 'All Users',
                                        count: totalUsers,
                                    },
                                    {
                                        value: 'active',
                                        label: 'Active',
                                        count: activeUsers,
                                    },
                                    {
                                        value: 'deactivated',
                                        label: 'Deactivated',
                                        count: deactivatedUsers,
                                    },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() =>
                                            setSelectedStatus(opt.value)
                                        }
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedStatus === opt.value ? 'font-medium' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full ${
                                                    opt.value === 'active'
                                                        ? 'bg-emerald-500'
                                                        : opt.value ===
                                                            'deactivated'
                                                          ? 'bg-red-500'
                                                          : 'bg-gray-400'
                                                }`}
                                            />
                                            <span>{opt.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {opt.count}
                                            </span>
                                            {selectedStatus === opt.value && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Site Section */}
                        <div className="border-b p-3">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Site
                            </p>
                            <div className="max-h-[180px] space-y-0.5 overflow-y-auto">
                                <button
                                    onClick={() => setSelectedSite('all')}
                                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedSite === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All Sites</span>
                                    {selectedSite === 'all' && (
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    )}
                                </button>
                                {sites.map((site) => (
                                    <button
                                        key={site.id}
                                        onClick={() =>
                                            setSelectedSite(site.name)
                                        }
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedSite === site.name ? 'font-medium' : ''}`}
                                    >
                                        <span>{site.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {
                                                    users.filter((u) =>
                                                        u.sites.includes(
                                                            site.name,
                                                        ),
                                                    ).length
                                                }
                                            </span>
                                            {selectedSite === site.name && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role Section */}
                        <div className="border-b p-3">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Role
                            </p>
                            <div className="space-y-0.5">
                                <button
                                    onClick={() => setSelectedRole('all')}
                                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedRole === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All Roles</span>
                                    {selectedRole === 'all' && (
                                        <Check className="h-3.5 w-3.5 text-primary" />
                                    )}
                                </button>
                                {allRoles.map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedRole === role ? 'font-medium' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-block h-2 w-2 rounded-full ${
                                                    role === 'Admin'
                                                        ? 'bg-purple-500'
                                                        : role ===
                                                            'Site Manager'
                                                          ? 'bg-blue-500'
                                                          : role ===
                                                              'Technician'
                                                            ? 'bg-emerald-500'
                                                            : role === 'Viewer'
                                                              ? 'bg-gray-500'
                                                              : 'bg-orange-500'
                                                }`}
                                            />
                                            <span>{role}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {roleBreakdown[role] || 0}
                                            </span>
                                            {selectedRole === role && (
                                                <Check className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear */}
                        {activeFilterCount > 0 && (
                            <div className="p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full text-xs"
                                    onClick={() => {
                                        setSelectedSite('all');
                                        setSelectedRole('all');
                                        setSelectedStatus('all');
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Active filter badges */}
                {selectedStatus !== 'all' && (
                    <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                            selectedStatus === 'active'
                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'border-red-100 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}
                    >
                        Status:{' '}
                        {selectedStatus === 'active' ? 'Active' : 'Deactivated'}
                        <button
                            onClick={() => setSelectedStatus('all')}
                            className="ml-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}
                {selectedSite !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        Site: {selectedSite}
                        <button
                            onClick={() => setSelectedSite('all')}
                            className="ml-0.5 hover:text-blue-900"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}
                {selectedRole !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                        Role: {selectedRole}
                        <button
                            onClick={() => setSelectedRole('all')}
                            className="ml-0.5 hover:text-purple-900"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}

                {activeFilterCount > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                        {filteredUsers.length} of {totalUsers} users
                    </span>
                )}
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={filteredUsers} hideToolbar />
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'User Management', href: '#' }],
};
