import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    UserCog,
    Edit,
    MapPin,
    Shield,
    Search,
    Filter,
    X,
    Check,
    User,
    UserCheck,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
    site: string;
    site_id: number | null;
}

interface Site {
    id: number;
    name: string;
    code: string;
    region?: string;
}

export default function Access({
    sites = [],
    users = [],
}: {
    sites: Site[];
    users: UserRecord[];
}) {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedSite, setSelectedSite] = useState('all');
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

    // Combobox state for typing/filtering users inside the select dropdown
    const [userComboOpen, setUserComboOpen] = useState(false);
    const [comboSearch, setComboSearch] = useState('');

    // Case-insensitive check to identify base users (excluding Admins if appropriate, but keeping it flexible)
    const baseUsers = useMemo(() => {
        return users.filter((u) => (u.role || '').toLowerCase() !== 'admin');
    }, [users]);

    // Unique options derived dynamically
    const allRoles = useMemo(
        () => [...new Set(baseUsers.map((u) => u.role).filter(Boolean))].sort(),
        [baseUsers],
    );
    const allSites = useMemo(
        () => [...new Set(baseUsers.map((u) => u.site).filter(Boolean))].sort(),
        [baseUsers],
    );

    // Filter combo users list as they type in the combo dropdown
    const comboFilteredUsers = useMemo(() => {
        return baseUsers.filter((u) =>
            u.name.toLowerCase().includes(comboSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(comboSearch.toLowerCase())
        );
    }, [baseUsers, comboSearch]);

    // Apply all multi-layered filters to the main datatable
    const filteredUsers = useMemo(() => {
        return baseUsers.filter((u) => {
            const matchesRole =
                selectedRole === 'all' || u.role === selectedRole;
            const matchesSite =
                selectedSite === 'all' || u.site === selectedSite;
            const matchesUser =
                !selectedUser || u.id === selectedUser.id;
            
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.site && u.site.toLowerCase().includes(q));

            return matchesRole && matchesSite && matchesUser && matchesSearch;
        });
    }, [baseUsers, search, selectedRole, selectedSite, selectedUser]);

    const activeFilterCount =
        (selectedRole !== 'all' ? 1 : 0) + 
        (selectedSite !== 'all' ? 1 : 0) +
        (selectedUser ? 1 : 0);

    const columns = [
        {
            accessorKey: 'name',
            header: 'User Name',
            cell: ({ row }: any) => (
                <button
                    onClick={() => setSelectedUser(row.original)}
                    className="flex flex-col text-left hover:text-primary transition-colors focus:outline-none group"
                >
                    <span className="font-semibold text-foreground group-hover:underline flex items-center gap-1">
                        {row.original.name}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground font-normal ml-1">
                            (filter)
                        </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {row.original.email}
                    </span>
                </button>
            ),
        },
        {
            accessorKey: 'role',
            header: 'System Role',
            cell: ({ row }: any) => {
                const role = row.original.role;
                let colorClass = 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-900/40 dark:text-slate-300';

                if (role === 'Admin') {
colorClass = 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 dark:bg-rose-950/20 dark:text-rose-400';
}

                if (role === 'Site Manager') {
colorClass = 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
}

                if (role === 'Technician') {
colorClass = 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
}

                return (
                    <button
                        onClick={() => setSelectedRole(role)}
                        title={`Filter by role: ${role}`}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${colorClass} flex w-fit items-center transition-colors focus:outline-none`}
                    >
                        <Shield className="mr-1 h-3 w-3 animate-pulse" />
                        {role}
                    </button>
                );
            },
        },
        {
            accessorKey: 'site',
            header: 'Site Access',
            cell: ({ row }: any) => (
                <button
                    onClick={() => row.original.site && setSelectedSite(row.original.site)}
                    title={`Filter by site: ${row.original.site}`}
                    className="flex items-center text-sm hover:text-primary transition-colors focus:outline-none hover:underline text-left"
                >
                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-zinc-400 group-hover:text-primary" />
                    <span
                        className={
                            row.original.site_id
                                ? 'text-foreground'
                                : 'font-medium text-primary'
                        }
                    >
                        {row.original.site}
                    </span>
                </button>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${row.original.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Manage
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Access Control" />

            <div className="flex items-end justify-between">
                <div>
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-foreground">
                        <ShieldCheck className="mr-3 h-7 w-7 text-primary" />
                        Access Control
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage user permissions and site-specific access rights.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/users/create">
                        <UserCog className="mr-2 h-4 w-4" />
                        Add New User
                    </Link>
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    <span>
                        <strong>Security Policy:</strong> Admins have global
                        access. Site Managers and Technicians are restricted to
                        their assigned locations. Click table rows or tags below to filter instantly.
                    </span>
                </div>

                {/* Search + Filter row */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {/* General Text Search */}
                    <div className="relative w-[240px]">
                        <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Query name, email, base..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs bg-background/50"
                        />
                    </div>

                    {/* 1. Filter by User - Combo Search Combobox */}
                    <Popover open={userComboOpen} onOpenChange={setUserComboOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-semibold border-dashed"
                            >
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                {selectedUser ? `User: ${selectedUser.name}` : 'Filter by User'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0" align="start">
                            <div className="p-2 border-b border-border/40 bg-muted/20">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Type to search user..."
                                        value={comboSearch}
                                        onChange={(e) => setComboSearch(e.target.value)}
                                        className="h-8 pl-8 text-xs bg-background"
                                    />
                                </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setUserComboOpen(false);
                                        setComboSearch('');
                                    }}
                                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left hover:bg-muted font-bold transition-colors"
                                >
                                    <span>All Users</span>
                                    {!selectedUser && <Check className="h-3 w-3 text-primary" />}
                                </button>
                                {comboFilteredUsers.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setUserComboOpen(false);
                                            setComboSearch('');
                                        }}
                                        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left hover:bg-muted transition-colors"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{u.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {u.role} • {u.site}
                                            </span>
                                        </div>
                                        {selectedUser?.id === u.id && (
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />
                                        )}
                                    </button>
                                ))}
                                {comboFilteredUsers.length === 0 && (
                                    <div className="p-3 text-center text-xs text-muted-foreground">
                                        No matching users found.
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* 2. Popover Filters (Role & Site) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 border-dashed text-xs"
                            >
                                <Filter className="h-3.5 w-3.5" /> Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[260px] p-0" align="start">
                            <div className="border-b p-3 bg-muted/20">
                                <p className="text-sm font-semibold">
                                    Filter Access Rules
                                </p>
                            </div>
                            <div className="border-b p-3">
                                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Role
                                </p>
                                <div className="space-y-0.5">
                                    <button
                                        onClick={() => setSelectedRole('all')}
                                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted ${selectedRole === 'all' ? 'font-bold' : ''}`}
                                    >
                                        <span>All Roles</span>
                                        {selectedRole === 'all' && (
                                            <Check className="h-3 w-3 text-primary" />
                                        )}
                                    </button>
                                    {allRoles.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setSelectedRole(r)}
                                            className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted ${selectedRole === r ? 'font-bold' : ''}`}
                                        >
                                            <span>{r}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {
                                                        baseUsers.filter(
                                                            (u) => u.role === r,
                                                        ).length
                                                    }
                                                </span>
                                                {selectedRole === r && (
                                                    <Check className="h-3 w-3 text-primary" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="border-b p-3">
                                <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Site
                                </p>
                                <div className="max-h-[150px] space-y-0.5 overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => setSelectedSite('all')}
                                        className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted ${selectedSite === 'all' ? 'font-bold' : ''}`}
                                    >
                                        <span>All Sites</span>
                                        {selectedSite === 'all' && (
                                            <Check className="h-3 w-3 text-primary" />
                                        )}
                                    </button>
                                    {allSites.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSite(s)}
                                            className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition-colors hover:bg-muted ${selectedSite === s ? 'font-bold' : ''}`}
                                        >
                                            <span>{s}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {
                                                        baseUsers.filter(
                                                            (u) => u.site === s,
                                                        ).length
                                                    }
                                                </span>
                                                {selectedSite === s && (
                                                    <Check className="h-3 w-3 text-primary" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && (
                                <div className="p-2 bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-full text-xs"
                                        onClick={() => {
                                            setSelectedRole('all');
                                            setSelectedSite('all');
                                            setSelectedUser(null);
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Filter Badges for active filters */}
                    {selectedUser && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400">
                            User: {selectedUser.name}
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="ml-0.5 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {selectedRole !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-400">
                            Role: {selectedRole}
                            <button
                                onClick={() => setSelectedRole('all')}
                                className="ml-0.5 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {selectedSite !== 'all' && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400">
                            Site: {selectedSite}
                            <button
                                onClick={() => setSelectedSite('all')}
                                className="ml-0.5 focus:outline-none"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}

                    {activeFilterCount > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground font-semibold">
                            {filteredUsers.length} of {baseUsers.length} users
                        </span>
                    )}
                </div>

                <DataTable columns={columns} data={filteredUsers} hideToolbar />
            </div>
        </div>
    );
}

Access.layout = {
    breadcrumbs: [
        {
            title: 'Access Control',
            href: '#',
        },
    ],
};
