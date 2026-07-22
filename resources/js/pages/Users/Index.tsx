import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    ShieldCheck,
    Users,
    Filter,
    X,
    Check,
    Search,
    Power,
    UserX,
    MapPin,
    MoreHorizontal,
    UserCheck,
    Shield,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableActions } from '@/components/data-table/data-table-actions';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { UserFormDialog } from '@/pages/Users/UserFormDialog';

type UserType = {
    id: number;
    name: string;
    email: string;
    role: string;
    site_id: number | null;
    site_name: string | null;
    is_active: boolean;
    created_at: string;
};

type SiteType = { id: number; name: string };

type ConfirmAction = {
    type: 'toggle' | 'delete';
    user: UserType;
};

function userBelongsToSite(user: UserType, siteId: number): boolean {
    if (!user.site_id) {
        return true;
    }

    return user.site_id === siteId;
}

export default function UsersIndex({
    users,
    sites,
    roles = [],
}: {
    users: UserType[];
    sites: SiteType[];
    roles?: string[];
}) {
    const [selectedSiteId, setSelectedSiteId] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [editUser, setEditUser] = useState<UserType | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
        null,
    );
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const [bulkAction, setBulkAction] = useState<string | null>(null);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

    const selectedSite = useMemo(
        () => sites.find((s) => s.id.toString() === selectedSiteId),
        [sites, selectedSiteId],
    );

    const siteScopedUsers = useMemo(() => {
        if (selectedSiteId === 'all') {
            return users;
        }

        const siteId = parseInt(selectedSiteId, 10);

        return users.filter((u) => userBelongsToSite(u, siteId));
    }, [users, selectedSiteId]);

    const allRoles = useMemo(() => {
        const roleSet = new Set(siteScopedUsers.map((u) => u.role));

        return Array.from(roleSet).sort();
    }, [siteScopedUsers]);

    const filteredUsers = useMemo(() => {
        return siteScopedUsers.filter((u) => {
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

            return matchesRole && matchesStatus && matchesSearch;
        });
    }, [siteScopedUsers, selectedRole, selectedStatus, search]);

    const activeFilterCount =
        (selectedRole !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

    const totalUsers = siteScopedUsers.length;
    const activeUsers = siteScopedUsers.filter((u) => u.is_active).length;
    const deactivatedUsers = siteScopedUsers.filter((u) => !u.is_active).length;

    const roleBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        siteScopedUsers.forEach((u) => {
            map[u.role] = (map[u.role] || 0) + 1;
        });

        return map;
    }, [siteScopedUsers]);

    const getSiteUserCount = useCallback(
        (siteId: number) =>
            users.filter((u) => userBelongsToSite(u, siteId)).length,
        [users],
    );

    const roleColors: Record<string, { color: string; bg: string; border: string }> = {
        Admin: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30' },
        Manager: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/30' },
        Employee: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30' },
        'Site Manager': { color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-500/10', border: 'border-sky-200 dark:border-sky-500/30' },
        Technician: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30' },
        Viewer: { color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-500/10', border: 'border-slate-200 dark:border-slate-500/30' },
        None: { color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30' },
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

    const executeConfirmAction = () => {
        if (!confirmAction) {
            return;
        }

        const { type, user } = confirmAction;

        if (type === 'toggle') {
            router.patch(`/users/${user.id}/toggle-active`, {}, {
                preserveScroll: true,
                onFinish: () => setConfirmAction(null),
            });
        } else {
            router.delete(`/users/${user.id}`, {
                preserveScroll: true,
                onFinish: () => setConfirmAction(null),
            });
        }
    };

    const createUserHref =
        selectedSiteId !== 'all'
            ? `/users/create?site_id=${selectedSiteId}`
            : '/users/create';

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev => {
            const next = new Set(prev);
            next.has(userId) ? next.delete(userId) : next.add(userId);
            return next;
        });
    };

    const toggleAllUsers = () => {
        const filteredIds = filteredUsers.map(u => u.id);
        if (filteredIds.every(id => selectedUsers.has(id))) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredIds));
        }
    };

    const executeBulkAction = () => {
        if (!bulkAction || selectedUsers.size === 0) return;

        const payload: any = {
            user_ids: Array.from(selectedUsers),
            action: bulkAction,
        };

        if (bulkAction === 'role') {
            payload.role_id = '2'; // Default to Manager
        } else if (bulkAction === 'site') {
            payload.site_id = selectedSiteId !== 'all' ? parseInt(selectedSiteId) : null;
        }

        router.post('/users/bulk-update', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUsers(new Set());
                setBulkAction(null);
                setBulkDialogOpen(false);
            },
        });
    };

    const columns = useMemo((): any[] => {
        const baseColumns = [
            {
                id: 'select',
                header: ({ table }: any) => (
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers.has(u.id))}
                        onChange={toggleAllUsers}
                    />
                ),
                cell: ({ row }: any) => {
                    const user = row.original;
                    return (
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                        />
                    );
                },
                enableSorting: false,
                size: 50,
            },
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
                headerText: 'Name',
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
                accessorKey: 'role',
                headerText: 'Role',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Role" />
                ),
                cell: ({ row }: any) => {
                    const role = row.original.role;
                    const colorClass = roleColors[role] || roleColors['None'];

                    return (
                        <button
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            title={`Filter by ${role}`}
                        >
                            <Badge variant="outline" className={`${colorClass.color} ${colorClass.border} ${colorClass.bg} grid w-[112px] grid-cols-[16px_1fr] items-center gap-1`}>
                                <span className="flex size-4 items-center justify-center">
                                    <Shield className="size-3 shrink-0" />
                                </span>
                                <span className="truncate text-left">{role}</span>
                            </Badge>
                        </button>
                    );
                },
            },
            {
                id: 'status',
                headerText: 'Status',
                header: ({ column }: any) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }: any) => {
                    const isActive = row.original.is_active;

                    const cfg = isActive
                        ? { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2, label: 'Active' }
                        : { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30', icon: XCircle, label: 'Deactivated' };
                    const Icon = cfg.icon;

                    return (
                        <Badge variant="outline" className={`${cfg.color} ${cfg.border} ${cfg.bg} grid w-[112px] grid-cols-[16px_1fr] items-center gap-1`}>
                            <span className="flex size-4 items-center justify-center">
                                <Icon className="size-3 shrink-0" />
                            </span>
                            <span className="truncate text-left">{cfg.label}</span>
                        </Badge>
                    );
                },
                enableSorting: false,
            },
        ] as any[];

        if (selectedSiteId === 'all') {
            baseColumns.push({
                accessorKey: 'site_name',
                headerText: 'Site',
                header: ({ column }: any) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Site"
                    />
                ),
                cell: ({ row }: any) => {
                    const siteName = row.original.site_name;

                    return (
                        <span className="text-sm text-muted-foreground">
                            {siteName || (
                                <span className="text-xs italic text-muted-foreground/50">
                                    No site
                                </span>
                            )}
                        </span>
                    );
                },
                enableSorting: false,
            });
        }

        baseColumns.push(
            {
                accessorKey: 'created_at',
                headerText: 'Created',
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
                header: '',
                cell: ({ row }: any) => {
                    const user = row.original;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"
                                onClick={() => setEditUser(user)}
                                aria-label="Edit user"
                                title="Edit"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-300 dark:hover:bg-amber-500/10"
                                onClick={() => setConfirmAction({ type: 'toggle', user })}
                                aria-label={user.is_active ? 'Deactivate user' : 'Activate user'}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                            >
                                <Power className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10"
                                onClick={() => setConfirmAction({ type: 'delete', user })}
                                aria-label="Delete user"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        );

        return baseColumns;
    }, [selectedSiteId, sites, selectedUsers, filteredUsers, toggleUserSelection]);

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="User Management" />

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Manage Users
                    </h1>
                </div>
                <Link href={createUserHref}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New User
                        {selectedSite ? ` · ${selectedSite.name}` : ''}
                    </Button>
                </Link>
            </div>

            {/* Site tabs */}
            <div>
                <div className="no-scrollbar flex w-full space-x-2 overflow-x-auto border-b border-border pb-px">
                    <button
                        onClick={() => setSelectedSiteId('all')}
                        className={`flex items-center space-x-2 border-b-2 px-4 py-2 whitespace-nowrap transition-all ${selectedSiteId === 'all'
                            ? 'border-primary bg-primary/5 font-bold text-primary'
                            : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/30 hover:text-foreground'
                            }`}
                    >
                        <span>All Sites</span>
                        <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${selectedSiteId === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {users.length}
                        </span>
                    </button>
                    {sites.map((site) => {
                        const count = getSiteUserCount(site.id);

                        return (
                            <button
                                key={site.id}
                                onClick={() =>
                                    setSelectedSiteId(site.id.toString())
                                }
                                className={`flex items-center space-x-2 border-b-2 px-4 py-2 whitespace-nowrap transition-all ${selectedSiteId === site.id.toString()
                                    ? 'border-primary bg-primary/5 font-bold text-primary'
                                    : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                    }`}
                            >
                                <span>{site.name}</span>
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${selectedSiteId === site.id.toString()
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Site context banner */}
            {selectedSite && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500/10">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            {selectedSite.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Showing {filteredUsers.length} of {totalUsers} users
                            with access to this site
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                <div
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all ${selectedStatus === 'all' ? 'ring-1 ring-primary/30' : 'hover:border-primary/40'}`}
                    onClick={() => setSelectedStatus('all')}
                >
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
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all ${selectedStatus === 'active' ? 'border-emerald-400 ring-2 ring-emerald-500' : 'hover:border-emerald-300'}`}
                    onClick={() =>
                        setSelectedStatus(
                            selectedStatus === 'active' ? 'all' : 'active',
                        )
                    }
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10">
                        <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="mb-0.5 text-[11px] leading-none text-muted-foreground">
                            Active
                        </p>
                        <p className="text-lg leading-none font-bold text-emerald-600 dark:text-emerald-400">
                            {activeUsers}
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
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:border-primary/40 ${selectedRole === role ? 'ring-2 ring-primary' : ''}`}
                            onClick={() =>
                                setSelectedRole(
                                    selectedRole === role ? 'all' : role,
                                )
                            }
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-md ${color.bg} ${color.color}`}
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

            {/* Bulk actions bar */}
            {selectedUsers.size > 0 && (
                <div className="flex items-center gap-3 rounded-lg border bg-blue-50 px-4 py-3 dark:bg-blue-950/20">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={true}
                        readOnly
                    />
                    <span className="text-sm font-semibold">
                        {selectedUsers.size} user(s) selected
                    </span>
                    <div className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => { setBulkAction('activate'); setBulkDialogOpen(true); }}
                        >
                            <UserCheck className="mr-2 h-4 w-4" /> Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8"
                            onClick={() => { setBulkAction('deactivate'); setBulkDialogOpen(true); }}
                        >
                            <UserX className="mr-2 h-4 w-4" /> Deactivate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => { setBulkAction('role'); setBulkDialogOpen(true); }}
                        >
                            <ShieldCheck className="mr-2 h-4 w-4" /> Set Role
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => setSelectedUsers(new Set())}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Search + Filter row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-[250px]">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search "
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
                                {selectedSite && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Scoped to {selectedSite.name}
                                    </p>
                                )}
                            </div>

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
                                                    className={`inline-block h-2 w-2 rounded-full ${opt.value === 'active'
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
                                                {selectedStatus ===
                                                    opt.value && (
                                                        <Check className="h-3.5 w-3.5 text-primary" />
                                                    )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-b p-3">
                                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Role
                                </p>
                                <div className="max-h-[180px] space-y-0.5 overflow-y-auto">
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
                                            onClick={() =>
                                                setSelectedRole(role)
                                            }
                                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted ${selectedRole === role ? 'font-medium' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-block h-2 w-2 rounded-full ${role === 'Admin'
                                                        ? 'bg-purple-500'
                                                        : role ===
                                                            'Site Manager'
                                                            ? 'bg-blue-500'
                                                            : role ===
                                                                'Technician'
                                                                ? 'bg-emerald-500'
                                                                : role ===
                                                                    'Viewer'
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

                            {activeFilterCount > 0 && (
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full text-xs"
                                        onClick={() => {
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

                    {selectedStatus !== 'all' && (
                        <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${selectedStatus === 'active'
                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'border-red-100 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                                }`}
                        >
                            Status:{' '}
                            {selectedStatus === 'active'
                                ? 'Active'
                                : 'Deactivated'}
                            <button
                                onClick={() => setSelectedStatus('all')}
                                className="ml-0.5"
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

                <DataTableActions
                    data={filteredUsers}
                    columns={columns}
                    exportFileName={
                        selectedSite
                            ? `users_${selectedSite.name.replace(/\s+/g, '_').toLowerCase()}`
                            : 'users_export'
                    }
                />
            </div>

            <DataTable columns={columns} data={filteredUsers} hideToolbar />

            <UserFormDialog
                open={!!editUser}
                onOpenChange={(open) => !open && setEditUser(null)}
                user={editUser}
                roles={roles}
                sites={sites}
            />

            <Dialog
                open={!!confirmAction}
                onOpenChange={(open) => !open && setConfirmAction(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction?.type === 'delete'
                                ? 'Delete User'
                                : confirmAction?.user.is_active
                                    ? 'Deactivate User'
                                    : 'Activate User'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction?.type === 'delete'
                                ? `Are you sure you want to delete "${confirmAction?.user.name}"? This action cannot be undone.`
                                : confirmAction?.user.is_active
                                    ? `"${confirmAction?.user.name}" will lose access to the system until reactivated.`
                                    : `"${confirmAction?.user.name}" will regain access to the system.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmAction(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={
                                confirmAction?.type === 'delete'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={executeConfirmAction}
                        >
                            {confirmAction?.type === 'delete'
                                ? 'Delete User'
                                : confirmAction?.user.is_active
                                    ? 'Deactivate'
                                    : 'Activate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Action Dialog */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {bulkAction === 'activate' && 'Activate Users'}
                            {bulkAction === 'deactivate' && 'Deactivate Users'}
                            {bulkAction === 'role' && 'Update User Role'}
                            {bulkAction === 'delete' && 'Delete Users'}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkAction === 'activate' && `Activate ${selectedUsers.size} selected user(s). They will regain access to the system.`}
                            {bulkAction === 'deactivate' && `Deactivate ${selectedUsers.size} selected user(s). They will lose access to the system.`}
                            {bulkAction === 'role' && `Set role for ${selectedUsers.size} selected user(s) to Manager.`}
                            {bulkAction === 'delete' && `Delete ${selectedUsers.size} selected user(s). This action cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setBulkDialogOpen(false);
                                setBulkAction(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                            onClick={executeBulkAction}
                        >
                            {bulkAction === 'activate' && 'Activate'}
                            {bulkAction === 'deactivate' && 'Deactivate'}
                            {bulkAction === 'role' && 'Update Role'}
                            {bulkAction === 'delete' && 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'User Management', href: '/users' }],
};
