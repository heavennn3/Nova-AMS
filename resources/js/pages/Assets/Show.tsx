import * as React from 'react';
import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Printer,
    UserPlus,
    UserMinus,
    Calendar,
    MapPin,
    Tag,
    Landmark,
    FileText,
    ShoppingBag,
    ShieldCheck,
    DollarSign,
    QrCode,
    Clock,
    RefreshCw,
    AlertTriangle,
    Info,
    HeartPulse,
    User,
    CheckCircle2,
    X,
    FileSpreadsheet,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Show({ asset, users = [] }: { asset: any; users?: any[] }) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form setup for Checkout
    const checkoutForm = useForm({
        asset_id: asset.id,
        user_id: '',
        remarks: '',
    });

    // Form setup for Checkin
    const checkinForm = useForm({
        remarks: '',
    });

    // Find active assignment
    const activeAssignment = asset.assignments?.find(
        (a: any) => a.status === 'active'
    );

    // Calculate dates & EOL progress
    const purchaseDateStr = asset.purchase_date || asset.created_at;
    const purchaseDate = purchaseDateStr ? new Date(purchaseDateStr) : null;
    const eolDate = asset.eol_date ? new Date(asset.eol_date) : null;
    const currentDate = new Date('2026-06-15T09:01:36+08:00'); // current mock/system time

    let eolTotalMonths = 36;
    let eolElapsedMonths = 0;
    let eolPercentage = 100;

    if (purchaseDate && eolDate) {
        eolTotalMonths =
            (eolDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            (eolDate.getMonth() - purchaseDate.getMonth());
        eolElapsedMonths =
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            (currentDate.getMonth() - purchaseDate.getMonth());
        eolElapsedMonths = Math.max(0, Math.min(eolTotalMonths, eolElapsedMonths));
        const remaining = eolTotalMonths - eolElapsedMonths;
        eolPercentage = eolTotalMonths > 0 ? Math.round((remaining / eolTotalMonths) * 100) : 0;
    } else if (asset.warranty_months) {
        eolTotalMonths = parseInt(asset.warranty_months) || 36;
        if (purchaseDate) {
            eolElapsedMonths =
                (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
                (currentDate.getMonth() - purchaseDate.getMonth());
            eolElapsedMonths = Math.max(0, Math.min(eolTotalMonths, eolElapsedMonths));
            const remaining = eolTotalMonths - eolElapsedMonths;
            eolPercentage = eolTotalMonths > 0 ? Math.round((remaining / eolTotalMonths) * 100) : 0;
        }
    }

    // Warranty calculation
    let warrantyTotalMonths = parseInt(asset.warranty_months) || 36;
    let warrantyElapsedMonths = 0;
    let warrantyPercentage = 100;
    let warrantyExpiresDateStr = 'N/A';

    if (purchaseDate) {
        const expiresDate = new Date(purchaseDate);
        expiresDate.setMonth(expiresDate.getMonth() + warrantyTotalMonths);
        warrantyExpiresDateStr = expiresDate.toISOString().split('T')[0];

        warrantyElapsedMonths =
            (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            (currentDate.getMonth() - purchaseDate.getMonth());
        warrantyElapsedMonths = Math.max(0, Math.min(warrantyTotalMonths, warrantyElapsedMonths));
        const remaining = warrantyTotalMonths - warrantyElapsedMonths;
        warrantyPercentage = warrantyTotalMonths > 0 ? Math.round((remaining / warrantyTotalMonths) * 100) : 0;
    }

    // Cost calculations
    const purchaseCost = parseFloat(asset.purchase_cost) || 0;
    const maintenanceCost = 0.00; // Mocked / default
    const totalCost = purchaseCost + maintenanceCost;

    // Last Audit & Next Audit mock calculations
    const lastAuditDateStr = asset.updated_at ? asset.updated_at.split('T')[0] : 'N/A';
    const nextAuditDateStr = purchaseDateStr ? purchaseDateStr.split('T')[0] : 'N/A';

    // Formatter helpers
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(val);
    };

    const handleCheckoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        checkoutForm.post('/live-tracking/checkout', {
            onSuccess: () => {
                setIsCheckoutOpen(false);
                checkoutForm.reset();
                toast.success('Asset checked out successfully.');
            },
            onError: (err) => {
                toast.error(err.user_id || err.asset_id || 'Failed to check out asset.');
            },
        });
    };

    const handleCheckinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeAssignment) return;
        checkinForm.patch(`/live-tracking/${activeAssignment.id}/checkin`, {
            onSuccess: () => {
                setIsCheckinOpen(false);
                checkinForm.reset();
                toast.success('Asset returned successfully.');
            },
            onError: () => {
                toast.error('Failed to check in asset.');
            },
        });
    };

    const handleDeleteSubmit = () => {
        router.delete(`/assets/${asset.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success('Asset deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete asset.');
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Format audit creator or fallback
    const creatorName = asset.audits?.[0]?.user?.name || 'admin admin';
    const createdDateFormatted = asset.created_at
        ? new Date(asset.created_at).toLocaleString()
        : 'N/A';
    const updatedDateFormatted = asset.updated_at
        ? new Date(asset.updated_at).toLocaleString()
        : 'N/A';

    // Status pill coloring logic
    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
        available: { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-500' },
        in_use: { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' },
        maintenance: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', dot: 'bg-yellow-500' },
        faulty: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
        retired: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-500' },
        pending: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500' },
    };

    const statusObj = statusColors[asset.status] || {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        dot: 'bg-blue-500',
    };

    // QR Code URL generator
    const detailUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/assets/${asset.id}`
        : `/assets/${asset.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        detailUrl
    )}`;

    return (
        <div className="w-full p-8 space-y-6 print:p-0">
            <Head title={`Asset Details - ${asset.asset_id}`} />

            {/* Breadcrumb Header - Hidden when printing */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center space-x-4">
                    <Link href="/assets">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground font-sans">
                            Asset Details Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Overview of metrics, cost allocations, and check history.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Show Dashboard Page Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* LEFT CARD - Main Stats Dashboard (2/3 width) */}
                <div className="md:col-span-2 space-y-6 print:col-span-3">
                    <Card className="border border-border/45 bg-card/65 backdrop-blur-md shadow-lg overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                            <div className="flex items-center space-x-3">
                                {/* Status label pill */}
                                <div className={`flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusObj.bg} ${statusObj.text}`}>
                                    <span className={`h-2 w-2 rounded-full ${statusObj.dot} animate-pulse`} />
                                    <span>{asset.statusLabel?.name || asset.status}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1.5">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Last Checkout:</span>
                                    <span className="font-semibold text-foreground">
                                        {activeAssignment ? activeAssignment.user?.name : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Expected Checkin:</span>
                                    <span className="font-semibold text-foreground">N/A</span>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-6 space-y-8">
                            
                            {/* Top row: Specifications & EOL progress indicators */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/40">
                                
                                {/* Spec table list */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Asset Tag</span>
                                        <span className="font-semibold text-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">{asset.asset_id || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Asset Name</span>
                                        <span className="font-semibold text-foreground">{asset.asset_name || asset.product_name || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Current Value</span>
                                        <span className="font-bold text-foreground">{formatCurrency(purchaseCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Last Audit</span>
                                        <span className="font-semibold text-foreground">{lastAuditDateStr}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Next Audit Date</span>
                                        <span className="font-semibold text-foreground">{nextAuditDateStr}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Default Location</span>
                                        <span className="font-semibold text-foreground">{asset.location?.name || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/20 text-sm">
                                        <span className="text-muted-foreground font-medium">Device EOL</span>
                                        <span className="font-semibold text-foreground">{asset.eol_date || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 text-sm">
                                        <span className="text-muted-foreground font-medium">MAC Address</span>
                                        <span className="font-semibold text-foreground font-mono">00:1a:2b:3c:4d:5e</span>
                                    </div>
                                </div>

                                {/* Dynamic indicators progress bars */}
                                <div className="space-y-6 flex flex-col justify-center bg-slate-900/10 dark:bg-slate-900/35 border border-border/30 rounded-xl p-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium flex items-center">
                                                Device EOL <span className="ml-1.5 text-foreground font-semibold">({eolElapsedMonths}/{eolTotalMonths} months)</span>
                                            </span>
                                            <span className="font-bold text-primary">{eolPercentage}%</span>
                                        </div>
                                        <Progress value={eolPercentage} className="h-2 bg-slate-200 dark:bg-slate-800" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground font-medium flex items-center">
                                                Warranty Expires <span className="ml-1.5 text-foreground font-semibold">{warrantyExpiresDateStr}</span>
                                            </span>
                                            <span className="font-bold text-cyan-500">{warrantyPercentage}%</span>
                                        </div>
                                        <Progress value={warrantyPercentage} className="h-2 bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                </div>
                            </div>

                            {/* Middle section: Cost allocation & stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                
                                {/* Cost breakdown list */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold tracking-wide text-foreground uppercase border-b pb-2 mb-3">Cost Breakdown</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Purchase Cost</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(purchaseCost)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Maintenances</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(0.00)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Accessories</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(0.00)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Licenses</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(0.00)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Components</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(0.00)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1 border-b border-border/10">
                                            <span className="text-muted-foreground">Assets</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(0.00)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-2 font-bold text-foreground bg-primary/5 px-2 rounded mt-2">
                                            <span>Total Cost</span>
                                            <span className="text-primary">{formatCurrency(totalCost)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata / stats cards counters */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold tracking-wide text-foreground uppercase border-b pb-2 mb-3">Operational Summary</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-border/30 bg-card p-4 rounded-xl text-center space-y-1 shadow-sm">
                                            <span className="text-xs text-muted-foreground font-medium block">Active Maintenances</span>
                                            <span className="text-2xl font-bold text-foreground">0</span>
                                        </div>
                                        <div className="border border-border/30 bg-card p-4 rounded-xl text-center space-y-1 shadow-sm">
                                            <span className="text-xs text-muted-foreground font-medium block">Checkouts</span>
                                            <span className="text-2xl font-bold text-foreground">{asset.assignments?.length || 0}</span>
                                        </div>
                                        <div className="border border-border/30 bg-card p-4 rounded-xl text-center space-y-1 shadow-sm">
                                            <span className="text-xs text-muted-foreground font-medium block">Checkins</span>
                                            <span className="text-2xl font-bold text-foreground">
                                                {asset.assignments?.filter((a: any) => a.status === 'returned').length || 0}
                                            </span>
                                        </div>
                                        <div className="border border-border/30 bg-card p-4 rounded-xl text-center space-y-1 shadow-sm">
                                            <span className="text-xs text-muted-foreground font-medium block">Requests</span>
                                            <span className="text-2xl font-bold text-foreground">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom row: QR Code container */}
                            <div className="flex flex-col items-center justify-center pt-8 border-t border-border/40">
                                <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200">
                                    <img
                                        src={qrCodeUrl}
                                        alt={`QR Code for ${asset.asset_id}`}
                                        className="h-32 w-32 object-contain"
                                        onError={(e) => {
                                            // Fallback if network offline / QR API fails
                                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>';
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground mt-2 font-mono">Scan tag QR code to view page on mobile</span>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT CARD - Metadata Details & Toolbar Sidebar (1/3 width) */}
                <div className="space-y-6 print:hidden">
                    <Card className="border border-border/45 bg-card/65 backdrop-blur-md shadow-lg overflow-hidden">
                        
                        {/* Quick Actions Toolbar */}
                        <div className="bg-slate-900/20 dark:bg-slate-950/40 p-4 border-b border-border/45 flex items-center justify-between gap-1.5">
                            <Link href="/assets">
                                <Button variant="ghost" size="icon" title="Back to Inventory" className="rounded-lg h-9 w-9">
                                    <ArrowLeft className="h-4.5 w-4.5" />
                                </Button>
                            </Link>
                            
                            <Link href={`/assets/${asset.id}/edit`}>
                                <Button variant="ghost" size="icon" title="Edit Asset" className="rounded-lg h-9 w-9 text-amber-500 hover:bg-amber-500/10">
                                    <Edit className="h-4.5 w-4.5" />
                                </Button>
                            </Link>
                            
                            {/* Toggle checkout/checkin based on active assignment */}
                            {activeAssignment ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCheckinOpen(true)}
                                    title="Check In Asset"
                                    className="rounded-lg h-9 w-9 text-blue-500 hover:bg-blue-500/10"
                                >
                                    <UserMinus className="h-4.5 w-4.5" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCheckoutOpen(true)}
                                    title="Check Out Asset"
                                    className="rounded-lg h-9 w-9 text-green-500 hover:bg-green-500/10"
                                    disabled={asset.status === 'retired' || asset.status === 'maintenance'}
                                >
                                    <UserPlus className="h-4.5 w-4.5" />
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrint}
                                title="Print Asset Tag Label"
                                className="rounded-lg h-9 w-9 text-cyan-500 hover:bg-cyan-500/10"
                            >
                                <Printer className="h-4.5 w-4.5" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDeleteOpen(true)}
                                title="Delete Asset"
                                className="rounded-lg h-9 w-9 text-red-500 hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                        </div>
                        
                        {/* Sidebar Details Metadata List */}
                        <CardContent className="p-6 space-y-6 text-sm">
                            
                            {/* Text notes */}
                            <div className="space-y-1.5 border-b pb-4 border-border/20">
                                <div className="flex items-center text-muted-foreground gap-2 font-medium">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span>Notes</span>
                                </div>
                                <p className="text-foreground pl-6 text-xs italic leading-relaxed">
                                    {asset.notes || 'No administrative notes provided.'}
                                </p>
                            </div>

                            {/* Property Attributes metadata */}
                            <div className="space-y-4 pb-4 border-b border-border/20">
                                <div className="flex items-start gap-3">
                                    <Tag className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Serial Number</span>
                                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
                                            {asset.serial_number || 'No serial code'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ShoppingBag className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Product Model</span>
                                        <span className="font-semibold text-foreground">{asset.product_name || '—'}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileSpreadsheet className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Model Number</span>
                                        <span className="font-semibold text-foreground">{asset.brand ? `Model ${asset.brand}` : 'Model N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Unit Cost</span>
                                        <span className="font-bold text-foreground">{formatCurrency(purchaseCost)}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Purchase Order (PO)</span>
                                        <span className="font-semibold text-foreground text-xs text-blue-500 hover:underline cursor-pointer">
                                            {asset.order_number || 'PO-99481'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Landmark className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Vendor / Brand</span>
                                        <span className="font-semibold text-foreground">{asset.vendor?.name || 'Nexus Cybernetics'}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Tag className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Category</span>
                                        <span className="font-semibold text-foreground text-xs text-blue-500 hover:underline cursor-pointer">
                                            {asset.category?.name || 'Laptops'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Default Location</span>
                                        <span className="font-semibold text-foreground">{asset.site?.name || 'HQ - Austin'}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ShoppingBag className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Supplier</span>
                                        <span className="font-semibold text-foreground text-xs text-blue-500 hover:underline cursor-pointer">
                                            {asset.supplier?.name || 'CDW Direct Sales'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Landmark className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Manufacturer</span>
                                        <span className="font-semibold text-foreground text-xs text-blue-500 hover:underline cursor-pointer">
                                            Apex Tech Corp
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Extra attributes (Dates & ownership flags) */}
                            <div className="space-y-4 pb-4 border-b border-border/20">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Device EOL</span>
                                        <span className="text-foreground font-semibold">
                                            {asset.eol_date ? `${asset.eol_date} - 2 years 7 months` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <span className="text-xs text-muted-foreground block">Purchased Date</span>
                                        <span className="text-foreground font-semibold">
                                            {purchaseDateStr ? `${purchaseDateStr.split('T')[0]} - 4 months ago` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-1 text-xs">
                                    <span className="text-muted-foreground font-medium">Ownership Type</span>
                                    <span className="font-semibold text-foreground bg-slate-500/10 px-2 py-0.5 rounded">BYOD</span>
                                </div>

                                <div className="flex items-center justify-between py-1 text-xs">
                                    <span className="text-muted-foreground font-medium">Availability</span>
                                    <span className="font-bold text-green-500 flex items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Requestable
                                    </span>
                                </div>
                            </div>

                            {/* Creator details */}
                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-slate-400" /> Created By
                                    </span>
                                    <span className="font-semibold text-foreground text-blue-500 hover:underline cursor-pointer">
                                        {creatorName}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created At
                                    </span>
                                    <span className="text-muted-foreground">{createdDateFormatted}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Updated At
                                    </span>
                                    <span className="text-muted-foreground">{updatedDateFormatted}</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Print Label Stylesheet Injection */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    .print\\:col-span-3,
                    .print\\:col-span-3 * {
                        visibility: visible !important;
                    }
                    .print\\:col-span-3 {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Custom Asset Card Label Layout for print */
                    .print-label-view {
                        display: block !important;
                        width: 4in;
                        height: 2.2in;
                        border: 2px solid #000;
                        padding: 0.15in;
                        border-radius: 8px;
                        font-family: monospace;
                        page-break-inside: avoid;
                    }
                }
            `}} />

            {/* MODALS / DIALOGS POPUPS */}

            {/* CHECKOUT DIALOG */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign / Checkout Asset</DialogTitle>
                        <DialogDescription>
                            Assign this asset ({asset.asset_id}) to an active user.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 py-2 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">Select User</Label>
                            <Select
                                value={checkoutForm.data.user_id}
                                onValueChange={(val) => checkoutForm.setData('user_id', val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select target user..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Administrative Notes / Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={checkoutForm.data.remarks}
                                onChange={(e) => checkoutForm.setData('remarks', e.target.value)}
                                placeholder="State condition, reason, or remarks..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCheckoutOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={checkoutForm.processing}>
                                Checkout
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CHECKIN DIALOG */}
            <Dialog open={isCheckinOpen} onOpenChange={setIsCheckinOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Return / Checkin Asset</DialogTitle>
                        <DialogDescription>
                            Return this asset back to the central inventory store.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCheckinSubmit} className="space-y-4 py-2 text-left">
                        <div className="bg-slate-500/10 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Currently Checked Out To:</span>
                                <span className="font-semibold text-foreground">{activeAssignment?.user_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Checked Out Duration:</span>
                                <span className="font-semibold text-foreground">{activeAssignment?.duration}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Return Condition / Notes</Label>
                            <Textarea
                                id="remarks"
                                value={checkinForm.data.remarks}
                                onChange={(e) => checkinForm.setData('remarks', e.target.value)}
                                placeholder="State returning physical condition..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCheckinOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={checkinForm.processing}
                            >
                                Checkin
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Danger: Delete Asset
                        </DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure you want to delete asset{' '}
                            <span className="font-bold font-mono text-foreground">
                                {asset.asset_id}
                            </span>
                            ? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteSubmit}
                        >
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Asset Inventory',
            href: '/assets',
        },
        {
            title: 'Show Details',
            href: '#',
        },
    ],
};
