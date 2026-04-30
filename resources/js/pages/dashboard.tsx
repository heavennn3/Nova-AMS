import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';



import React from 'react';

export default function Dashboard({ totalAssets, availableAssets, inUseAssets, underMaintenance, faultyAssets }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">System Status</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-gray-500">Total Assets</div>
                    <div className="text-3xl font-bold">{totalAssets}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-gray-500">Available Assets</div>
                    <div className="text-3xl font-bold">{availableAssets}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-gray-500">In Use Assets</div>
                    <div className="text-3xl font-bold">{inUseAssets}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-gray-500">Under Maintenance</div>
                    <div className="text-3xl font-bold">{underMaintenance}</div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <div className="text-gray-500">Faulty Assets</div>
                    <div className="text-3xl font-bold">{faultyAssets}</div>
                </div>
            </div>
        </div>
    );
}