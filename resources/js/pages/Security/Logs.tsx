import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldAlert, Eye, History, User, Activity, Globe, MapPin, Search, Filter, X, Check } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function Logs({ logs = [] }: { logs: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedSite, setSelectedSite] = useState<string>('all');

    // Derive unique values
    const allEvents = useMemo(() => [...new Set(logs.map(l => l.event))].sort(), [logs]);
    const allUsers = useMemo(() => [...new Set(logs.map(l => l.user_name))].sort(), [logs]);
    const allSites = useMemo(() => [...new Set(logs.map(l => l.site_name))].sort(), [logs]);

    // Filter
    const filteredLogs = useMemo(() => {
        return logs.filter(l => {
            const matchesEvent = selectedEvent === 'all' || l.event === selectedEvent;
            const matchesUser = selectedUser === 'all' || l.user_name === selectedUser;
            const matchesSite = selectedSite === 'all' || l.site_name === selectedSite;
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                l.user_name.toLowerCase().includes(q) ||
                l.site_name.toLowerCase().includes(q) ||
                l.event.toLowerCase().includes(q) ||
                l.auditable_type.toLowerCase().includes(q) ||
                (l.ip_address && l.ip_address.includes(q));
            return matchesEvent && matchesUser && matchesSite && matchesSearch;
        });
    }, [logs, search, selectedEvent, selectedUser, selectedSite]);

    const activeFilterCount =
        (selectedEvent !== 'all' ? 1 : 0) +
        (selectedUser !== 'all' ? 1 : 0) +
        (selectedSite !== 'all' ? 1 : 0);

    const eventColors: Record<string, string> = {
        created: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        updated: 'bg-amber-100 text-amber-700 border-amber-200',
        deleted: 'bg-red-100 text-red-700 border-red-200',
        login: 'bg-blue-100 text-blue-700 border-blue-200',
    };

    const eventDots: Record<string, string> = {
        created: 'bg-emerald-500',
        updated: 'bg-amber-500',
        deleted: 'bg-red-500',
        login: 'bg-blue-500',
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'created_at',
            header: 'Timestamp',
            headerText: 'Timestamp',
            cell: ({ row }: any) => <span className="font-mono text-xs">{row.getValue('created_at')}</span>
        },
        {
            id: 'user_site',
            accessorFn: (row: any) => `${row.user_name} ${row.site_name}`,
            header: 'User & Location',
            headerText: 'User & Location',
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium">{row.original.user_name}</span>
                    </div>
                    <div className="flex items-center ml-8 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {row.original.site_name}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'event',
            header: 'Action',
            headerText: 'Action',
            cell: ({ row }: any) => {
                const event = row.getValue('event') as string;
                return (
                    <Badge variant="outline" className={`${eventColors[event] || 'bg-slate-100'} capitalize px-2 py-0 h-5 text-[10px]`}>
                        {event}
                    </Badge>
                );
            }
        },
        {
            accessorKey: 'auditable_type',
            header: 'Resource',
            headerText: 'Resource',
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>{row.getValue('auditable_type')}</span>
                </div>
            )
        },
        {
            accessorKey: 'ip_address',
            header: 'Source IP',
            headerText: 'Source IP',
            cell: ({ row }: any) => (
                <div className="flex flex-col text-[10px] text-muted-foreground font-mono leading-tight">
                    <div className="flex items-center">
                        <Globe className="h-2.5 w-2.5 mr-1" />
                        {row.getValue('ip_address')}
                    </div>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Changes',
            cell: ({ row }: any) => {
                const log = row.original;
                return (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/5">
                                <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center">
                                    <History className="h-5 w-5 mr-2 text-primary" />
                                    Change Audit Detail
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground">Previous State</h4>
                                    <pre className="bg-muted p-3 rounded-lg text-[10px] overflow-auto border min-h-[200px]">
                                        {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-emerald-600">Updated State</h4>
                                    <pre className="bg-emerald-50/50 p-3 rounded-lg text-[10px] overflow-auto border border-emerald-100 min-h-[200px]">
                                        {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
        }
    ], []);

    return (
        <div className="p-8 space-y-6 w-full">
            <Head title="System Audit Logs" />

            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="text-left">
                    <div className="flex items-center space-x-2 text-primary mb-1">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Compliance & Governance</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">System Activity Logs</h1>
                    <p className="text-muted-foreground mt-1">Track & view all system activities and audit trails.</p>
                </div>
            </div>

            {/* Search + Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-[280px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search user, site, action, resource..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                    />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed">
                            <Filter className="h-3.5 w-3.5" />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                        <div className="p-3 border-b">
                            <p className="text-sm font-semibold">Filter Logs</p>
                        </div>

                        {/* Event / Action */}
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action</p>
                            <div className="space-y-0.5">
                                <button
                                    onClick={() => setSelectedEvent('all')}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedEvent === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All Actions</span>
                                    {selectedEvent === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allEvents.map(event => (
                                    <button
                                        key={event}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedEvent === event ? 'font-medium' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block h-2 w-2 rounded-full ${eventDots[event] || 'bg-gray-400'}`} />
                                            <span className="capitalize">{event}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {logs.filter(l => l.event === event).length}
                                            </span>
                                            {selectedEvent === event && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User */}
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">User</p>
                            <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedUser('all')}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedUser === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All Users</span>
                                    {selectedUser === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allUsers.map(user => (
                                    <button
                                        key={user}
                                        onClick={() => setSelectedUser(user)}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedUser === user ? 'font-medium' : ''}`}
                                    >
                                        <span>{user}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {logs.filter(l => l.user_name === user).length}
                                            </span>
                                            {selectedUser === user && <Check className="h-3.5 w-3.5 text-primary" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Site */}
                        <div className="p-3 border-b">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Site</p>
                            <div className="space-y-0.5 max-h-[150px] overflow-y-auto">
                                <button
                                    onClick={() => setSelectedSite('all')}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedSite === 'all' ? 'font-medium' : ''}`}
                                >
                                    <span>All Sites</span>
                                    {selectedSite === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                </button>
                                {allSites.map(site => (
                                    <button
                                        key={site}
                                        onClick={() => setSelectedSite(site)}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedSite === site ? 'font-medium' : ''}`}
                                    >
                                        <span>{site}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-muted-foreground">
                                                {logs.filter(l => l.site_name === site).length}
                                            </span>
                                            {selectedSite === site && <Check className="h-3.5 w-3.5 text-primary" />}
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
                                    className="w-full h-8 text-xs"
                                    onClick={() => {
                                        setSelectedEvent('all');
                                        setSelectedUser('all');
                                        setSelectedSite('all');
                                    }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Active filter badges */}
                {selectedEvent !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                        Action: {selectedEvent}
                        <button onClick={() => setSelectedEvent('all')} className="ml-0.5 hover:text-emerald-900">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}
                {selectedUser !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                        User: {selectedUser}
                        <button onClick={() => setSelectedUser('all')} className="ml-0.5 hover:text-blue-900">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}
                {selectedSite !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                        Site: {selectedSite}
                        <button onClick={() => setSelectedSite('all')} className="ml-0.5 hover:text-purple-900">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                )}

                {activeFilterCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-1">
                        {filteredLogs.length} of {logs.length} logs
                    </span>
                )}
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredLogs}
                    hideToolbar
                />
            </div>
        </div>
    );
}

Logs.layout = {
    breadcrumbs: [
        {
            title: 'System Security',
            href: '#',
        },
        {
            title: 'Audit Logs',
            href: '/security/logs',
        },
    ],
};
