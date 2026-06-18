import { Head } from '@inertiajs/react';

export default function TestLicensePage() {
    return (
        <div className="w-full space-y-6 p-8">
            <Head title="Test License Page" />
            <h1 className="text-3xl font-bold tracking-tight">License Page Test</h1>
            <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="text-green-800 font-medium">✅ License page is working!</p>
                <p className="text-green-700 text-sm mt-2">If you can see this, the routing and basic rendering works.</p>
            </div>
        </div>
    );
}

TestLicensePage.layout = {
    breadcrumbs: [
        { title: 'Test', href: '/test' },
    ],
};