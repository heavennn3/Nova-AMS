import { Link, router } from '@inertiajs/react';

export default function AssetIndex({ assets }) {
    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Asset Register</h1>
            <Link href={route('assets.create')} className="btn btn-primary mb-4">Register New Asset</Link>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th>Asset ID</th>
                        <th>Product Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => (
                        <tr key={asset.id}>
                            <td>{asset.asset_id}</td>
                            <td>{asset.product_name}</td>
                            <td>{asset.status}</td>
                            <td>
                                <Link href={route('assets.edit', asset.id)} className="btn btn-sm">Edit</Link>
                                <button
                                    onClick={() => router.delete(route('assets.destroy', asset.id))}
                                    className="btn btn-sm btn-danger ml-2"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}