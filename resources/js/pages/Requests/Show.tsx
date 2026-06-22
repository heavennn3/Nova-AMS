import * as React from 'react';
import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Package,
    RotateCcw,
    Clock,
    CheckCircle2,
    User,
    Calendar,
    FileText,
    AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RequestShow({ assetRequest }: { assetRequest: any }) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('Admin') || false;
    const [adminNotes, setAdminNotes] = useState('');

    const r = assetRequest;

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'text-amber-600 border-amber-200 bg-amber-50',
            Approved: 'text-emerald-600 border-emerald-200 bg-emerald-50',
            Fulfilled: 'text-blue-600 border-blue-200 bg-blue-50',
            Returned: 'text-violet-600 border-violet-200 bg-violet-50',
            Rejected: 'text-red-600 border-red-200 bg-red-50',
            Cancelled: 'text-slate-500 border-slate-200 bg-slate-50',
        };
        return <Badge variant="outline" className={`${styles[status] || ''} text-sm px-3 py-1`}>{status}</Badge>;
    };

    const handleAction = (action: string) => {
        if (action === 'reject' && !adminNotes.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }
        router.post(`/requests/${r.id}/${action}`, { admin_notes: adminNotes }, { preserveScroll: true });
    };

    // Timeline
    const timelineEvents = [
        { label: 'Submitted', date: r.created_at, icon: FileText, color: 'text-slate-500', done: true },
        { label: 'Approved', date: r.approved_at, icon: CheckCircle2, color: 'text-emerald-500', done: !!r.approved_at && r.status !== 'Rejected' },
        { label: r.status === 'Rejected' ? 'Rejected' : 'Fulfilled', date: r.status === 'Rejected' ? r.approved_at : r.fulfilled_at, icon: r.status === 'Rejected' ? XCircle : Package, color: r.status === 'Rejected' ? 'text-red-500' : 'text-blue-500', done: r.status === 'Rejected' || !!r.fulfilled_at },
        ...(['Borrow', 'Checkout'].includes(r.request_type) ? [{ label: 'Returned', date: r.returned_at, icon: RotateCcw, color: 'text-violet-500', done: !!r.returned_at }] : []),
    ];

    return (
        <>
            <Head title={`Request ${r.request_number}`} />

            <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Request <span className="text-emerald-600">{r.request_number}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Submitted on {new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="bg-muted/30 border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Request Details</h2>
                                {getStatusBadge(r.status)}
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Request Type</span>
                                        <div className="font-semibold mt-0.5">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-transparent">
                                                {r.request_type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Priority</span>
                                        <div className="font-semibold mt-0.5">
                                            {r.priority === 'Urgent' ? (
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Urgent
                                                </Badge>
                                            ) : r.priority === 'High' ? (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">High</Badge>
                                            ) : (
                                                <span>Normal</span>
                                            )}
                                        </div>
                                    </div>
                                    {r.asset && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Asset</span>
                                            <div className="font-semibold mt-0.5">{r.asset.product_name} <span className="text-muted-foreground font-mono text-xs">({r.asset.asset_id})</span></div>
                                        </div>
                                    )}
                                    {r.category && (
                                        <div>
                                            <span className="text-muted-foreground">Category</span>
                                            <div className="font-semibold mt-0.5">{r.category.name}</div>
                                        </div>
                                    )}
                                    {r.required_from && (
                                        <div>
                                            <span className="text-muted-foreground">Required From</span>
                                            <div className="font-semibold mt-0.5 flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(r.required_from).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    {r.required_until && (
                                        <div>
                                            <span className="text-muted-foreground">Required Until</span>
                                            <div className="font-semibold mt-0.5 flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(r.required_until).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <span className="text-sm text-muted-foreground">Reason / Justification</span>
                                    <p className="mt-1 text-sm leading-relaxed bg-muted/30 rounded-lg p-3">{r.reason}</p>
                                </div>

                                {r.admin_notes && (
                                    <div className="pt-4 border-t">
                                        <span className="text-sm text-muted-foreground">Admin Notes</span>
                                        <p className="mt-1 text-sm leading-relaxed bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                            {r.admin_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && ['Pending', 'Approved', 'Fulfilled'].includes(r.status) && (
                            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                                <div className="bg-muted/30 border-b px-6 py-4">
                                    <h2 className="text-lg font-semibold">Admin Actions</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Notes</Label>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes (required for rejection)..."
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        {r.status === 'Pending' && (
                                            <>
                                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('approve')}>
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Approve
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleAction('reject')}>
                                                    <XCircle className="h-4 w-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {r.status === 'Approved' && (
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('fulfill')}>
                                                <Package className="h-4 w-4 mr-2" /> Mark Fulfilled
                                            </Button>
                                        )}
                                        {r.status === 'Fulfilled' && ['Borrow', 'Checkout'].includes(r.request_type) && (
                                            <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => handleAction('return')}>
                                                <RotateCcw className="h-4 w-4 mr-2" /> Mark Returned
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Requester Info */}
                        <div className="rounded-xl border bg-card shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Requester</h3>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="font-semibold">{r.user?.name}</div>
                                    <div className="text-xs text-muted-foreground">{r.user?.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Approver */}
                        {r.approver && (
                            <div className="rounded-xl border bg-card shadow-sm p-5">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    {r.status === 'Rejected' ? 'Rejected By' : 'Approved By'}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${r.status === 'Rejected' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                        <User className={`h-5 w-5 ${r.status === 'Rejected' ? 'text-red-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{r.approver?.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {r.approved_at && new Date(r.approved_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="rounded-xl border bg-card shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Timeline</h3>
                            <div className="space-y-0">
                                {timelineEvents.map((event, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className={`rounded-full p-1 ${event.done ? 'bg-white' : 'bg-muted/50'}`}>
                                                <event.icon className={`h-4 w-4 ${event.done ? event.color : 'text-muted-foreground/30'}`} />
                                            </div>
                                            {i < timelineEvents.length - 1 && (
                                                <div className={`w-px h-8 ${event.done ? 'bg-border' : 'bg-muted/30'}`} />
                                            )}
                                        </div>
                                        <div className="pb-6">
                                            <div className={`text-sm font-medium ${event.done ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                                                {event.label}
                                            </div>
                                            {event.date && (
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
