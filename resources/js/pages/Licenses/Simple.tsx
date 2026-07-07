import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

type SimpleLicensesProps = {
    licenses: any[];
    users: any[];
    assets: any[];
    sites: any[];
    vendors: any[];
    error?: string;
};

export default function SimpleLicensesIndex({
    licenses = [],
    users = [],
    assets = [],
    sites = [],
    vendors = [],
    error = '',
}: SimpleLicensesProps) {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'expiring' | 'expired' | 'inuse'>('all');

    // Calculate metrics
    const totalLicenses = licenses.length;
    
    const activeLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return true; // Never expires = active
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() > now.getTime();
    });

    const expiringLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    });

    const expiredLicenses = licenses.filter((lic: any) => {
        if (!lic.expiration_date) return false;
        const expiry = new Date(lic.expiration_date);
        const now = new Date();
        return expiry.getTime() <= now.getTime();
    });

    const inUseLicenses = licenses.filter((lic: any) => lic.used_seats > 0);

    // Get filtered licenses based on selected filter
    const filteredLicenses = useMemo(() => {
        switch (selectedFilter) {
            case 'active':
                return activeLicenses;
            case 'expiring':
                return expiringLicenses;
            case 'expired':
                return expiredLicenses;
            case 'inuse':
                return inUseLicenses;
            default:
                return licenses;
        }
    }, [selectedFilter, licenses, activeLicenses, expiringLicenses, expiredLicenses, inUseLicenses]);

    const getStatusBadge = (license: any) => {
        if (!license.expiration_date) {
            return <Badge variant="secondary">Never Expires</Badge>;
        }
        
        const expiry = new Date(license.expiration_date);
        const now = new Date();
        const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
            return <Badge variant="destructive">Expired</Badge>;
        } else if (diffDays <= 30) {
            return <Badge variant="outline" className="border-amber-300 text-amber-700">Expiring Soon</Badge>;
        } else {
            return <Badge variant="outline" className="border-green-300 text-green-700">Active</Badge>;
        }
    };

    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Software Licenses" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Software Licenses</h1>
                    <p className="text-muted-foreground mt-1">
                        Track software licenses, usage, renewals, and compliance
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Clickable Metric Cards - Old Box Style */}
            <div className="grid grid-cols-5 gap-4">
                <div 
                    className={`bg-blue-50 border border-blue-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedFilter('all')}
                >
                    <h3 className="font-semibold text-blue-900">Total Licenses</h3>
                    <p className="text-2xl font-bold text-blue-600">{totalLicenses}</p>
                    <p className="text-xs text-blue-700 mt-1">All licenses</p>
                </div>

                <div 
                    className={`bg-green-50 border border-green-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFilter === 'active' ? 'ring-2 ring-green-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedFilter('active')}
                >
                    <h3 className="font-semibold text-green-900">Active</h3>
                    <p className="text-2xl font-bold text-green-600">{activeLicenses.length}</p>
                    <p className="text-xs text-green-700 mt-1">Not expired</p>
                </div>

                <div 
                    className={`bg-amber-50 border border-amber-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFilter === 'expiring' ? 'ring-2 ring-amber-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedFilter('expiring')}
                >
                    <h3 className="font-semibold text-amber-900">Expiring Soon</h3>
                    <p className="text-2xl font-bold text-amber-600">{expiringLicenses.length}</p>
                    <p className="text-xs text-amber-700 mt-1">Next 30 days</p>
                </div>

                <div 
                    className={`bg-red-50 border border-red-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFilter === 'expired' ? 'ring-2 ring-red-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedFilter('expired')}
                >
                    <h3 className="font-semibold text-red-900">Expired </h3>
                    <p className="text-2xl font-bold text-red-600">{expiredLicenses.length}</p>
                    <p className="text-xs text-red-700 mt-1">Need renewal</p>
                </div>

                <div 
                    className={`bg-purple-50 border border-purple-200 p-4 rounded cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedFilter === 'inuse' ? 'ring-2 ring-purple-500 shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedFilter('inuse')}
                >
                    <h3 className="font-semibold text-purple-900">In Use</h3>
                    <p className="text-2xl font-bold text-purple-600">{inUseLicenses.length}</p>
                    <p className="text-xs text-purple-700 mt-1">Have assignments</p>
                </div>
            </div>

            {/* Filtered License Table */}
            <div className="bg-white border rounded-lg">
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            {selectedFilter === 'all' ? 'All Licenses' :
                             selectedFilter === 'active' ? 'Active Licenses' :
                             selectedFilter === 'expiring' ? 'Expiring This Month' :
                             selectedFilter === 'expired' ? 'Expired Licenses' :
                             'In Use Licenses'} 
                            ({filteredLicenses.length})
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {selectedFilter !== 'all' && `Filtered from ${totalLicenses} total licenses`}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {filteredLicenses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-lg font-medium text-muted-foreground mb-2">
                                No {selectedFilter === 'all' ? '' : 
                                    selectedFilter === 'active' ? 'active ' :
                                    selectedFilter === 'expiring' ? 'expiring ' :
                                    selectedFilter === 'expired' ? 'expired ' :
                                    'in-use '}licenses found
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {selectedFilter === 'all' ? 'Create your first license to get started.' :
                                 'Try selecting a different filter or add more licenses.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLicenses.map((license: any) => (
                                <div key={license.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{license.name}</h3>
                                                {getStatusBadge(license)}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Type:</span> {license.license_type || 'Not specified'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Seats:</span> {license.used_seats || 0}/{license.total_seats || 0} used
                                                </div>
                                                <div>
                                                    <span className="font-medium">Vendor:</span> {license.vendor || 'Not specified'}
                                                </div>
                                                {license.expiration_date && (
                                                    <div>
                                                        <span className="font-medium">Expires:</span> {new Date(license.expiration_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            {license.product_key && (
                                                <div className="mt-2 text-xs font-mono text-gray-500 bg-gray-100 p-2 rounded">
                                                    Key: {license.product_key.substring(0, 20)}...
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {license.purchase_cost ? `$${license.purchase_cost}` : 'No cost'}
                                            </div>
                                            {license.site && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Site: {license.site}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

SimpleLicensesIndex.layout = {
    breadcrumbs: [
        { title: 'Software Licenses', href: '/licenses' },
    ],
};