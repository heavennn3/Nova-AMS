import * as React from 'react';
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Eye,
    Plus,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RequestsIndex({ requests = [] }: { requests: any[] }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');

    const filteredRequests = requests.filter((r) => {
        const matchesSearch =
            search === '' ||
            r.request_number?.toLowerCase().includes(search.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            selectedStatus === 'all' || r.status === selectedStatus;
        const matchesPriority =
            selectedPriority === 'all' || r.priority === selectedPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>;
            case 'Approved':
                return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Approved</Badge>;
            case 'Fulfilled':
                return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Fulfilled</Badge>;
            case 'Rejected':
                return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Urgent</Badge>;
            case 'High':
                return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">High</Badge>;
            default:
                return <span className="text-sm text-muted-foreground">{priority}</span>;
        }
    };

    return (
        <>
            <Head title="My Requests" />

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Requests</h1>
                        <p className="text-sm text-muted-foreground">
                            Track your asset requests
                        </p>
                    </div>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => router.get('/requests/create')}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </div>

                <div className="flex items-center justify-between space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search request number..."
                            className="pl-8 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Requester</th>
                                <th className="px-4 py-3">Asset / Category</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredRequests.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-4 font-mono text-emerald-600">
                                        {r.request_number}
                                    </td>
                                    <td className="px-4 py-4">
                                        {r.user?.name}
                                    </td>
                                    <td className="px-4 py-4">
                                        {r.asset ? (
                                            <div>
                                                <div className="font-medium text-foreground">{r.asset.product_name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{r.asset.asset_id}</div>
                                            </div>
                                        ) : r.category ? (
                                            <div className="font-medium text-foreground">{r.category.name}</div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent">
                                            {r.request_type}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        {getPriorityBadge(r.priority)}
                                    </td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(r.status)}
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">
                                        {new Date(r.created_at).toLocaleDateString('en-US')}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        No requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
