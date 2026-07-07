import { Head } from '@inertiajs/react';

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
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Software Licenses" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Software Licenses </h1>
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

            <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">License Inventory ({licenses.length})</h2>

                {licenses.length === 0 ? (
                    <p className="text-gray-500">No licenses found. Create your first license to get started.</p>
                ) : (
                    <div className="space-y-3">
                        {licenses.map((license: any) => (
                            <div key={license.id} className="border rounded p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{license.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {license.license_type} • {license.pricing_model} •
                                        {license.used_seats}/{license.total_seats} seats used
                                    </p>
                                    {license.expiration_date && (
                                        <p className="text-xs text-gray-500">
                                            Expires: {new Date(license.expiration_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    {license.compliance_status && (
                                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                                            license.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' :
                                            license.compliance_status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {license.compliance_status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                    <h3 className="font-semibold text-blue-900">Total Licenses</h3>
                    <p className="text-2xl font-bold text-blue-600">{licenses.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <h3 className="font-semibold text-green-900">Current Active</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {licenses.reduce((sum, l) => sum + (l.total_seats || 0), 0)}
                    </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <h3 className="font-semibold text-purple-900">Expiring Soon</h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {licenses.reduce((sum, l) => sum + (l.used_seats || 0), 0)}
                    </p>
                </div>

                 <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <h3 className="font-semibold text-purple-900">Expired</h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {licenses.reduce((sum, l) => sum + (l.used_seats || 0), 0)}
                    </p>
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