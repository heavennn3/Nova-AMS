import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table/data-table';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCog, Edit, MapPin, Shield, Search, Filter, X, Check } from 'lucide-react';

export default function Access({ sites, users }: { sites: any[], users: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedSite, setSelectedSite] = useState('all');

    const allRoles = useMemo(() => [...new Set(users.map(u => u.role).filter(Boolean))].sort(), [users]);
    const allSites = useMemo(() => [...new Set(users.map(u => u.site).filter(Boolean))].sort(), [users]);

    const baseUsers = users.filter(u => u.role !== 'admin');

    const filteredUsers = useMemo(() => {
        return baseUsers.filter(u => {
            const matchesRole = selectedRole === 'all' || u.role === selectedRole;
            const matchesSite = selectedSite === 'all' || u.site === selectedSite;
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.site && u.site.toLowerCase().includes(q));
            return matchesRole && matchesSite && matchesSearch;
        });
    }, [baseUsers, search, selectedRole, selectedSite]);

    const activeFilterCount = (selectedRole !== 'all' ? 1 : 0) + (selectedSite !== 'all' ? 1 : 0);

    const columns = [
        { 
            accessorKey: "name", 
            header: "User Name",
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.email}</span>
                </div>
            )
        },
        { 
            accessorKey: "role", 
            header: "System Role",
            cell: ({ row }: any) => {
                const role = row.original.role;
                let colorClass = "bg-slate-100 text-slate-800 border-slate-200";
                
                if (role === 'Admin') colorClass = "bg-rose-100 text-rose-800 border-rose-200";
                if (role === 'Site Manager') colorClass = "bg-amber-100 text-amber-800 border-amber-200";
                if (role === 'Technician') colorClass = "bg-blue-100 text-blue-800 border-blue-200";
                
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass} flex items-center w-fit`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {role}
                    </span>
                );
            }
        },
        { 
            accessorKey: "site", 
            header: "Site Access",
            cell: ({ row }: any) => (
                <div className="flex items-center text-sm">
                    <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                    <span className={row.original.site_id ? "text-foreground" : "text-primary font-medium"}>
                        {row.original.site}
                    </span>
                </div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/users/${row.original.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                    </Link>
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Access Control" />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                        <ShieldCheck className="h-7 w-7 mr-3 text-primary" />
                        Access Control
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user permissions and site-specific access rights.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/users/create">
                        <UserCog className="h-4 w-4 mr-2" />
                        Add New User
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
                <div className="flex items-center mb-6 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                    <span>
                        <strong>Security Policy:</strong> Admins have global access. Site Managers and Technicians are restricted to their assigned locations.
                    </span>
                </div>

                {/* Search + Filter row */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <div className="relative w-[260px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search user, email, site..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed">
                                <Filter className="h-3.5 w-3.5" /> Filters
                                {activeFilterCount > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[260px] p-0" align="start">
                            <div className="p-3 border-b"><p className="text-sm font-semibold">Filter Access</p></div>
                            <div className="p-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Role</p>
                                <div className="space-y-0.5">
                                    <button onClick={() => setSelectedRole('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedRole === 'all' ? 'font-medium' : ''}`}>
                                        <span>All Roles</span>{selectedRole === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                    {allRoles.map(r => (
                                        <button key={r} onClick={() => setSelectedRole(r)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedRole === r ? 'font-medium' : ''}`}>
                                            <span>{r}</span>
                                            <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{baseUsers.filter(u => u.role === r).length}</span>{selectedRole === r && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Site</p>
                                <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                    <button onClick={() => setSelectedSite('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedSite === 'all' ? 'font-medium' : ''}`}>
                                        <span>All Sites</span>{selectedSite === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                    {allSites.map(s => (
                                        <button key={s} onClick={() => setSelectedSite(s)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedSite === s ? 'font-medium' : ''}`}>
                                            <span>{s}</span>
                                            <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{baseUsers.filter(u => u.site === s).length}</span>{selectedSite === s && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && <div className="p-2"><Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => { setSelectedRole('all'); setSelectedSite('all'); }}>Clear all filters</Button></div>}
                        </PopoverContent>
                    </Popover>
                    {selectedRole !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">Role: {selectedRole}<button onClick={() => setSelectedRole('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                    {selectedSite !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">Site: {selectedSite}<button onClick={() => setSelectedSite('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                    {activeFilterCount > 0 && <span className="text-xs text-muted-foreground ml-1">{filteredUsers.length} of {baseUsers.length} users</span>}
                </div>

                <DataTable 
                    columns={columns} 
                    data={filteredUsers} 
                    hideToolbar
                />
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
