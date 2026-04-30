import { Link, router } from '@inertiajs/react';

export default function AssetIndex({ assets }) {
    const handleDelete = (e, id) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this asset?')) {
            router.delete(`/assets/${id}`);
        }
    };

    if (!assets || assets.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-xl font-bold mb-4">Asset Register</h1>
                <Link href="/assets/create" className="bg-blue-500 text-white px-4 py-2 rounded">
                    + Register New Asset
                </Link>
                <div className="mt-4 p-4 bg-yellow-100 rounded">
                    No assets found. Click "Register New Asset" to add some.
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">Asset Register</h1>
            <Link href="/assets/create" className="bg-blue-500 text-white px-4 py-2 rounded inline-block mb-4">
                + Register New Asset
            </Link>
            
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="border p-2 text-left">Asset ID</th>
                            <th className="border p-2 text-left">Product Name</th>
                            <th className="border p-2 text-left">Status</th>
                            <th className="border p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map(asset => (
                            <tr key={asset.id}>
                                <td className="border p-2">{asset.asset_id}</td>
                                <td className="border p-2">{asset.product_name}</td>
                                <td className="border p-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        asset.status === 'available' ? 'bg-green-100 text-green-800' :
                                        asset.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                                        asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="border p-2">
                                    <Link 
                                        href={`/assets/${asset.id}/edit`} 
                                        className="text-blue-600 hover:text-blue-800 mr-3"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={(e) => handleDelete(e, asset.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}