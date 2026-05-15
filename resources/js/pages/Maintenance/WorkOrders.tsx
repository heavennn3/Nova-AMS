import { useState, useMemo } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Search, Filter, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function WorkOrders({ workOrders, assets, technicians }: any) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    
    const { data, setData, post, processing, reset, errors } = useForm({
        asset_id: '',
        issue: '',
        priority: 'medium',
        assigned_to: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/maintenance/work-orders', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const updateStatus = (id: number, status: string) => {
        router.patch(`/maintenance/work-orders/${id}/status`, { status });
    };

    const allStatuses = useMemo(() => [...new Set(workOrders.map((w: any) => w.status).filter(Boolean))].sort(), [workOrders]);
    const allPriorities = useMemo(() => [...new Set(workOrders.map((w: any) => w.priority).filter(Boolean))].sort(), [workOrders]);

    const filteredOrders = useMemo(() => {
        return workOrders.filter((w: any) => {
            const matchesStatus = selectedStatus === 'all' || w.status === selectedStatus;
            const matchesPriority = selectedPriority === 'all' || w.priority === selectedPriority;
            const q = search.toLowerCase();
            const matchesSearch = !q ||
                (w.issue && w.issue.toLowerCase().includes(q)) ||
                (w.asset?.product_name && w.asset.product_name.toLowerCase().includes(q)) ||
                (w.asset?.asset_id && w.asset.asset_id.toLowerCase().includes(q)) ||
                (w.technician?.name && w.technician.name.toLowerCase().includes(q));
            return matchesStatus && matchesPriority && matchesSearch;
        });
    }, [workOrders, search, selectedStatus, selectedPriority]);

    const activeFilterCount = (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0);

    const columns = [
        {
            accessorKey: "asset.product_name",
            header: "Asset",
            cell: ({ row }: any) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.asset?.product_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.asset?.asset_id}</span>
                </div>
            )
        },
        {
            accessorKey: "issue",
            header: "Issue Description",
            cell: ({ row }: any) => <span className="text-sm line-clamp-1 max-w-[200px]">{row.original.issue}</span>
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }: any) => {
                const priority = row.original.priority;
                return (
                    <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'secondary'}>
                        {priority}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }: any) => {
                const status = row.original.status;
                const colors: any = {
                    open: 'bg-blue-100 text-blue-700 border-blue-200',
                    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
                    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    closed: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                return (
                    <Badge className={colors[status]}>
                        {status.replace('_', ' ')}
                    </Badge>
                );
            }
        },
        {
            accessorKey: "technician.name",
            header: "Assigned To",
            cell: ({ row }: any) => row.original.technician?.name || 'Unassigned'
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <Select onValueChange={(val) => updateStatus(row.original.id, val)}>
                    <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            )
        }
    ];

    const stats = [
        { title: 'Open Tickets', value: workOrders.filter((w: any) => w.status === 'open').length, icon: AlertCircle, color: 'text-blue-600' },
        { title: 'In Progress', value: workOrders.filter((w: any) => w.status === 'in_progress').length, icon: Clock, color: 'text-amber-600' },
        { title: 'Completed', value: workOrders.filter((w: any) => w.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-600' },
    ];

    return (
        <div className="p-8 w-full space-y-6">
            <Head title="Work Orders Management" />
            
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
                        <FileText className="h-7 w-7 mr-3 text-primary" />
                        Maintenance Operations
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage technical work orders and maintenance lifecycle.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Work Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={submit}>
                            <DialogHeader>
                                <DialogTitle>Create Work Order</DialogTitle>
                                <DialogDescription>Report an issue and assign it to a technician.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Select Asset</Label>
                                    <Select onValueChange={(val) => setData('asset_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assets.map((asset: any) => (
                                                <SelectItem key={asset.id} value={asset.id.toString()}>
                                                    {asset.product_name} ({asset.asset_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Issue Description</Label>
                                    <Textarea 
                                        placeholder="Describe the problem..." 
                                        value={data.issue}
                                        onChange={(e) => setData('issue', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Assign Technician</Label>
                                        <Select onValueChange={(val) => setData('assigned_to', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Optional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technicians.map((tech: any) => (
                                                    <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>Submit Work Order</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className={`p-3 rounded-full bg-muted`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6 space-y-4">
                {/* Search + Filter row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative w-[280px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Search asset, issue, technician..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed">
                                <Filter className="h-3.5 w-3.5" /> Filters
                                {activeFilterCount > 0 && <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[260px] p-0" align="start">
                            <div className="p-3 border-b"><p className="text-sm font-semibold">Filter Work Orders</p></div>
                            <div className="p-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                                <div className="space-y-0.5">
                                    <button onClick={() => setSelectedStatus('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedStatus === 'all' ? 'font-medium' : ''}`}>
                                        <span>All</span>{selectedStatus === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                    {allStatuses.map(s => (
                                        <button key={s} onClick={() => setSelectedStatus(s)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors capitalize ${selectedStatus === s ? 'font-medium' : ''}`}>
                                            <span>{s.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{workOrders.filter((w: any) => w.status === s).length}</span>{selectedStatus === s && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 border-b">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priority</p>
                                <div className="space-y-0.5">
                                    <button onClick={() => setSelectedPriority('all')} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors ${selectedPriority === 'all' ? 'font-medium' : ''}`}>
                                        <span>All</span>{selectedPriority === 'all' && <Check className="h-3.5 w-3.5 text-primary" />}
                                    </button>
                                    {allPriorities.map(p => (
                                        <button key={p} onClick={() => setSelectedPriority(p)} className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors capitalize ${selectedPriority === p ? 'font-medium' : ''}`}>
                                            <span>{p}</span>
                                            <div className="flex items-center gap-1.5"><span className="text-[10px] text-muted-foreground">{workOrders.filter((w: any) => w.priority === p).length}</span>{selectedPriority === p && <Check className="h-3.5 w-3.5 text-primary" />}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {activeFilterCount > 0 && <div className="p-2"><Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => { setSelectedStatus('all'); setSelectedPriority('all'); }}>Clear all filters</Button></div>}
                        </PopoverContent>
                    </Popover>
                    {selectedStatus !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 capitalize">Status: {selectedStatus.replace('_', ' ')}<button onClick={() => setSelectedStatus('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                    {selectedPriority !== 'all' && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 capitalize">Priority: {selectedPriority}<button onClick={() => setSelectedPriority('all')} className="ml-0.5"><X className="h-3 w-3" /></button></span>}
                    {activeFilterCount > 0 && <span className="text-xs text-muted-foreground ml-1">{filteredOrders.length} of {workOrders.length} orders</span>}
                </div>

                <DataTable 
                    columns={columns} 
                    data={filteredOrders} 
                    hideToolbar
                />
            </div>
        </div>
    );
}

WorkOrders.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: '#',
        },
    ],
};
