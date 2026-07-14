import { Head, router, usePage } from '@inertiajs/react';
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
    Key,
    Copy,
    Shield,
    Image as ImageIcon,
    ZoomIn,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function RequestShow({ assetRequest }: { assetRequest: any }) {
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.roles?.includes('Admin') || false;
    const [adminNotes, setAdminNotes] = useState('');
    const [copied, setCopied] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const copyKey = () => {
        if (r.license?.product_key) {
            navigator.clipboard.writeText(r.license.product_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
        ...(['Borrow', 'Checkout'].includes(r.request_type) || r.type === 'loan' ? [{
            label: 'Return Requested',
            date: r.return_requested_at,
            icon: Clock,
            color: 'text-orange-500',
            done: !!r.return_requested_at
        }] : []),
        ...(['Borrow', 'Checkout'].includes(r.request_type) || r.type === 'loan' ? [{
            label: 'Returned',
            date: r.returned_at,
            icon: RotateCcw,
            color: 'text-violet-500',
            done: !!r.returned_at,
            hasProof: !!(r.return_proof_path || r.proof_photo_path || r.return_proof_photo)
        }] : []),
    ];

    return (
        <>
            <Head title={`Request ${r.request_number}`} />

            <div className="flex flex-col space-y-6 p-8">
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
                                    {r.license && (
                                        <>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Software License</span>
                                                <div className="font-semibold mt-0.5 text-violet-700">{r.license.name}</div>
                                            </div>
                                            {r.license.version && (
                                                <div>
                                                    <span className="text-muted-foreground">Version</span>
                                                    <div className="font-semibold mt-0.5">{r.license.version}</div>
                                                </div>
                                            )}
                                            {r.license.license_type && (
                                                <div>
                                                    <span className="text-muted-foreground">License Type</span>
                                                    <div className="font-semibold mt-0.5 capitalize">{r.license.license_type.replace('_', ' ')}</div>
                                                </div>
                                            )}
                                            {r.license.category && (
                                                <div>
                                                    <span className="text-muted-foreground">Software Category</span>
                                                    <div className="font-semibold mt-0.5">{r.license.category}</div>
                                                </div>
                                            )}
                                            {r.license.expiration_date && (
                                                <div>
                                                    <span className="text-muted-foreground">Expires</span>
                                                    <div className="font-semibold mt-0.5 flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {new Date(r.license.expiration_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
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

                                {(r.return_notes || r.return_proof_path || r.proof_photo_path || r.return_proof_photo) && (
                                    <div className="pt-4 border-t">
                                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <RotateCcw className="h-4 w-4 text-violet-600" />
                                            Return Information
                                        </h3>
                                        {r.return_notes && (
                                            <div className="mb-3">
                                                <span className="text-sm text-muted-foreground">Return Notes:</span>
                                                <p className="mt-1 text-sm leading-relaxed bg-violet-50/50 rounded-lg p-3 border border-violet-100">
                                                    {r.return_notes}
                                                </p>
                                            </div>
                                        )}
                                        {(r.return_proof_path || r.proof_photo_path || r.return_proof_photo) && (
                                            <div>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                    Proof Photo:
                                                </span>
                                                <div className="rounded-lg border border-slate-200 overflow-hidden inline-block">
                                                    <img
                                                        src={`/storage/${r.return_proof_path || r.proof_photo_path || r.return_proof_photo}`}
                                                        alt="Return proof"
                                                        className="max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setImagePreview(`/storage/${r.return_proof_path || r.proof_photo_path || r.return_proof_photo}`)}
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 text-xs"
                                                    onClick={() => setImagePreview(`/storage/${r.return_proof_path || r.proof_photo_path || r.return_proof_photo}`)}
                                                >
                                                    <ZoomIn className="h-3 w-3 mr-1" />
                                                    View Full Size
                                                </Button>
                                            </div>
                                        )}
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

                        {/* License Key Card — shown when approved */}
                        {r.license && ['Approved', 'Fulfilled'].includes(r.status) && r.license.product_key && (
                            <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm p-5">
                                <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Key className="h-4 w-4" />
                                    Product Key
                                </h3>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm font-mono bg-white/80 text-emerald-800 px-3 py-2.5 rounded-lg border border-emerald-200 select-all break-all">
                                        {r.license.product_key}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={`h-10 w-10 shrink-0 transition-colors ${
                                            copied
                                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                : 'hover:bg-emerald-50 border-emerald-200'
                                        }`}
                                        onClick={copyKey}
                                        title="Copy key"
                                    >
                                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[11px] text-emerald-600 mt-2">Click the key to select it, or use the copy button.</p>
                                {r.license.license_email && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200/50 text-sm">
                                        <span className="text-emerald-600">Licensed to: </span>
                                        <span className="font-medium text-emerald-800">{r.license.license_email}</span>
                                    </div>
                                )}
                                {r.license.license_name && (
                                    <div className="text-sm mt-1">
                                        <span className="text-emerald-600">License Name: </span>
                                        <span className="font-medium text-emerald-800">{r.license.license_name}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* License pending notice */}
                        {r.license && r.status === 'Pending' && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                                <div className="flex items-center gap-2 text-sm text-amber-700">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">License key will be revealed once your request is approved.</span>
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
                                            {(event.hasProof || (event.label === 'Returned' && (r.return_proof_path || r.proof_photo_path || r.return_proof_photo))) && (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-violet-600">
                                                    <ImageIcon className="h-3 w-3" />
                                                    <span>Proof photo attached</span>
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

            {/* Image Preview Dialog */}
            <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
                <DialogContent className="max-w-4xl border-0 bg-black/95 p-3 shadow-2xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Proof Photo Preview</DialogTitle>
                    </DialogHeader>
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Return proof preview"
                            className="max-h-[85vh] w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

RequestShow.layout = {
    breadcrumbs: [
        { title: 'Requests', href: '/requests' },
        { title: 'Request Details', href: '#' },
    ],
};
