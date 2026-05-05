import { Head, useForm, router, Link } from '@inertiajs/react';
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function WorkOrders({ workOrders, assets, technicians }: any) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
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
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <Head title="Work Orders Management" />
            
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
                        <FileText className="h-8 w-8 mr-3 text-primary" />
                        Maintenance Operations
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage technical work orders and maintenance lifecycle.</p>
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

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6">
                <DataTable 
                    columns={columns} 
                    data={workOrders} 
                    searchKey="issue" 
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
