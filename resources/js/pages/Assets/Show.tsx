import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
    Clock,
    User,
    AlertTriangle,
    CheckCircle2,
    FileSpreadsheet,
    Info,
    Wrench,
    LineChart,
    RefreshCw,
    Monitor,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function Show({ asset, users = [] }: { asset: any; users?: any[] }) {
    const { auth } = usePage<any>().props;
    const isAdmin = auth?.user?.roles?.includes('Admin') ?? false;

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('information');

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

    // Find active loan (approved)
    const activeLoan = asset.activeLoan || null;
    const isOnLoan = !!activeLoan;
    const loanUser = activeLoan?.user?.name || null;
    const loanReturnDate = activeLoan?.expected_return_date || null;
    const isOverdue = loanReturnDate && new Date(loanReturnDate) < new Date();

    const fields = asset;

    const formatCurrency = (val: any) => {
        if (!val || val === '—') {
return '—';
}

        const cleanVal = String(val).trim();

        if (cleanVal.startsWith('$') || cleanVal.startsWith('RM') || cleanVal.startsWith('Rp')) {
            return cleanVal;
        }

        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));

        if (!isNaN(num)) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        }

        return cleanVal;
    };

    const assetCode = asset.asset_id || `AS-${asset.id}`;

    // Asset Name/Title
    const assetTitle = asset.asset_name || assetCode;

    // Subtitle
    const brandModel = [asset.type?.name, asset.oem?.name].filter(Boolean).join(' / ') || '';

    // Badges:
    // Status Badge value and styling
    const statusValue = asset.status || 'available';
    // Condition Badge
    const conditionValue = asset.condition || 'Good';
    // Category Badge
    const categoryValue = asset.category?.name || '—';

    // Top Summary Card Columns:
    // Department
    const departmentValue = asset.department || (activeAssignment?.user?.department?.name) || '—';
    // Assigned to
    const assignedToValue = isOnLoan
        ? `On loan to ${loanUser}`
        : (activeAssignment ? (activeAssignment.user?.name || '—') : '—');
    // Location
    const locationValue = asset.location || asset.site?.name || '—';
    // Serial Number
    const serialNumberValue = asset.serial_number || '—';

    const handleCheckoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        checkoutForm.post('/asset-track/checkout', {
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

        if (!activeAssignment) {
return;
}

        checkinForm.patch(`/asset-track/${activeAssignment.id}/checkin`, {
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
    const creatorName = asset.audits?.[0]?.user?.name || 'System Admin';

    // Status styling helper
    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();

        if (s.includes('avail') || s.includes('sedia') || s.includes('good') || s.includes('elok')) {
            return { bg: 'bg-green-50 text-green-600 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-green-600' };
        }

        if (s.includes('use') || s.includes('assign') || s.includes('guna') || s.includes('pinjam') || s.includes('aktif')) {
            return { bg: 'bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-blue-600' };
        }

        if (s.includes('maint') || s.includes('repair') || s.includes('selenggara') || s.includes('baiki')) {
            return { bg: 'bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-amber-600' };
        }

        if (s.includes('fault') || s.includes('damage') || s.includes('broke') || s.includes('rosak')) {
            return { bg: 'bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-red-600' };
        }

        return { bg: 'bg-slate-50 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-slate-600' };
    };

    const getConditionStyle = (cond: string) => {
        const c = cond.toLowerCase();

        if (c.includes('good') || c.includes('elok') || c.includes('baik') || c.includes('new')) {
            return { bg: 'bg-green-50 text-green-600 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-green-600' };
        }

        if (c.includes('fair') || c.includes('sederhana')) {
            return { bg: 'bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-amber-600' };
        }

        return { bg: 'bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-red-600' };
    };

    const getCategoryStyle = () => {
        return { bg: 'bg-purple-50 text-purple-600 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-semibold', text: 'text-purple-600' };
    };

    // Information tab fields definition
    const leftFields = [
        { label: 'Asset Name', value: asset.asset_name || '—' },
        { label: 'Type', value: asset.type?.name || '—' },
        { label: 'Added Date/Time', value: asset.created_at ? new Date(asset.created_at).toLocaleString() : '—' },
        { label: 'Original Value', value: formatCurrency(asset.original_value) },
        { label: 'Asset ID', value: asset.asset_id || '—' },
       
    ];

    const rightFields = [
        { label: 'Description', value: asset.description || '—' },
       
        { label: 'Manufacturer / Brand', value: asset.oem?.name || '—' },

        { label: 'Category', value: asset.category?.name || '—' },

        { label: 'Created By', value: creatorName },


    ];

    // Identify custom configuration fields not represented in topCard or matched list
    const topCardKeys = [
        'asset_name', 'jenis_aset', 'product', 'nama_aset',
        'serial_number', 'no_siri', 'serial',
        'location', 'lokasi',
        'category', 'kategori_aset', 'kategori',
        'status'
    ];
    const topCardKeysLower = topCardKeys.map(k => k.toLowerCase());
    const matchedKeysLower = [
        'description', 'keterangan', 'desc',
        'source', 'sumber', 'punca',
        'usage_start_date', 'tarikh_mula_guna', 'usage_date',
        'original_value', 'nilai_asal', 'original_cost',
        'warranty_expiry', 'tamat_waranti', 'warranty_date',
        'insurance_policy_number', 'no_polisi_insurans', 'insurance_policy',
        'notes', 'nota', 'catatan',
        'purchase_date', 'tarikh_beli', 'date_of_purchase',
        'purchase_price', 'harga_beli', 'cost',
        'current_value', 'nilai_semasa', 'current_cost',
        'insurance_expiry', 'tamat_insurans', 'insurance_date'
    ];

    const extraFields = [];

    return (
        <div className="w-full p-8 space-y-6 print:p-0 bg-slate-50/40 dark:bg-transparent min-h-screen">
            <Head title={`Asset Details - ${assetCode}`} />

            {/* Header / Actions Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden pb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                        {assetTitle}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {assetCode}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link href="/assets">
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>

                    <Button variant="outline" onClick={handlePrint} className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Label
                    </Button>

                    {isAdmin && (
                        <>
                            {activeAssignment ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCheckinOpen(true)}
                                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Return
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900"
                                    disabled={asset.status === 'retired' || asset.status === 'maintenance'}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Checkout
                                </Button>
                            )}
                        </>
                    )}

                    <Link href="/multi-site/transfers">
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Transfer
                        </Button>
                    </Link>

                    {isAdmin && (
                        <>
                            <Link href={`/assets/${asset.id}/edit`}>
                                <Button className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium shadow-sm transition-colors">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteOpen(true)}
                                className="h-10 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* Left Card - Main Asset Summary (2/3 width) */}
                <Card className="lg:col-span-2 border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden p-6 flex flex-col justify-between print:col-span-3">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        {/* Rounded Square Asset Icon Container */}
                        <div className="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 flex items-center justify-center shrink-0">
                            <Monitor className="h-9 w-9 text-slate-400 dark:text-slate-500" />
                        </div>

                        {/* Title, Subtitle, Badges */}
                        <div className="space-y-2.5 flex-1">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                                    {assetTitle}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    {brandModel}
                                </p>
                            </div>

                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-2">
                                <span className={cn(
                                    "px-3 py-0.5 rounded-full text-xs font-semibold border transition-colors",
                                    getStatusStyle(statusValue).bg,
                                    getStatusStyle(statusValue).text,
                                    getStatusStyle(statusValue).bg.includes('slate') ? 'border-slate-200' : getStatusStyle(statusValue).bg.replace('bg-', 'border-').replace('/80', '').replace('-50', '-200')
                                )}>
                                    {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                                </span>
                                <span className={cn(
                                    "px-3 py-0.5 rounded-full text-xs font-semibold border transition-colors",
                                    getConditionStyle(conditionValue).bg,
                                    getConditionStyle(conditionValue).text,
                                    getConditionStyle(conditionValue).bg.includes('slate') ? 'border-slate-200' : getConditionStyle(conditionValue).bg.replace('bg-', 'border-').replace('/80', '').replace('-50', '-200')
                                )}>
                                    {conditionValue}
                                </span>
                                <span className={cn(
                                    "px-3 py-0.5 rounded-full text-xs font-semibold border transition-colors",
                                    getCategoryStyle().bg,
                                    getCategoryStyle().text,
                                    'border-purple-200'
                                )}>
                                    {categoryValue}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata details block */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Asset ID</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{departmentValue}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Status</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{assignedToValue}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Location</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{locationValue}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Serial Number</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">{serialNumberValue}</span>
                        </div>
                    </div>
                </Card>

                {/* Right Card - Asset Hardware (1/3 width) */}
                <Card className="border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden p-6 flex flex-col items-center justify-between print:hidden">
                    <div className="my-4 flex h-32 w-32 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                        <Monitor className="h-16 w-16 text-slate-400 dark:text-slate-500" aria-label="Hardware asset" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono text-center mb-1">
                        {assetCode}
                    </span>
                </Card>
            </div>

            {/* Bottom Tab Layout */}
            <Card className="border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
                <div className="border-b border-slate-100 dark:border-slate-800 px-6 print:hidden">
                    <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
                        {[
                            { id: 'information', name: 'Information', icon: Info },
                            { id: 'history', name: 'History', icon: Clock },
                            { id: 'documents', name: 'Documents', icon: FileText },
                            { id: 'maintenance', name: 'Maintenance', icon: Wrench },

                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-all whitespace-nowrap",
                                        isActive
                                            ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                                            : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-555 dark:hover:text-slate-350"
                                    )}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-8 print:p-0">
                    {activeTab === 'information' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            {/* Column 1 (Left) */}
                            <div className="space-y-6">
                                {leftFields.map((f, idx) => (
                                    <div key={idx} className="space-y-1 pb-3 border-b border-slate-100/50 dark:border-slate-800/40">
                                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">{f.label}</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{f.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Column 2 (Right) */}
                            <div className="space-y-6">
                                {rightFields.map((f, idx) => (
                                    <div key={idx} className="space-y-1 pb-3 border-b border-slate-100/50 dark:border-slate-800/40">
                                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">{f.label}</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{f.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Extra custom columns dynamic list */}
                         
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                                Checkout / Assignment History
                            </h3>
                            {asset.assignments && asset.assignments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                                                <th className="pb-3">User</th>
                                                <th className="pb-3">Site / Location</th>
                                                <th className="pb-3">Status</th>
                                                <th className="pb-3">Assigned At</th>
                                                <th className="pb-3">Returned At</th>
                                                <th className="pb-3">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-slate-700 dark:text-slate-350">
                                            {asset.assignments.map((assignment: any) => (
                                                <tr key={assignment.id} className="border-b border-slate-50 dark:border-slate-800/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                    <td className="py-4 font-medium text-slate-900 dark:text-slate-100">
                                                        {assignment.user?.name || '—'}
                                                        <span className="text-xs text-slate-400 block font-normal mt-0.5">{assignment.user?.email}</span>
                                                    </td>
                                                    <td className="py-4">
                                                        {assignment.site?.name || '—'}
                                                        {assignment.location?.name && (
                                                            <span className="text-xs text-slate-400 block mt-0.5">{assignment.location.name}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-xs font-semibold border",
                                                            assignment.status === 'active'
                                                                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800/40 dark:text-blue-400"
                                                                : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-850/20 dark:border-slate-800/40 dark:text-slate-400"
                                                        )}>
                                                            {assignment.status === 'active' ? 'Active' : 'Returned'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4">
                                                        {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="py-4">
                                                        {assignment.returned_at ? new Date(assignment.returned_at).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="py-4 text-xs italic text-slate-500 max-w-xs truncate">
                                                        {assignment.remarks || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <Clock className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                                    <p className="text-sm">No assignment history found for this asset.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="text-center py-16 text-slate-400">
                            <FileText className="mx-auto h-16 w-16 text-slate-250 dark:text-slate-850 mb-4" />
                            <p className="text-sm font-medium">No documents attached to this asset.</p>
                            <p className="text-xs text-slate-400 mt-1">Upload and associate relevant manuals, invoices, or guides in settings.</p>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                                Maintenance History & Schedule
                            </h3>
                            <div className="text-center py-16 text-slate-400">
                                <Wrench className="mx-auto h-16 w-16 text-slate-250 dark:text-slate-850 mb-4" />
                                <p className="text-sm font-medium">No maintenance records found.</p>
                                <p className="text-xs text-slate-400 mt-1">This asset has no scheduled or past maintenance events.</p>
                            </div>
                        </div>
                    )}


                </div>
            </Card>

            {/* Print Label Stylesheet Injection */}
            <style dangerouslySetInnerHTML={{
                __html: `
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
                            Assign this asset to an active user.
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
                            <Button type="submit" disabled={checkoutForm.processing} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAssignment?.user?.name || activeAssignment?.user_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Checked Out Duration:</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{activeAssignment?.duration || '—'}</span>
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
                                className="bg-blue-600 hover:bg-blue-700 text-white"
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
                            Are you sure you want to delete this asset? This action is permanent and cannot be undone.
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
