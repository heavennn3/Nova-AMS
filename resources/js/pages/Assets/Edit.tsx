import { useForm, Link } from "@inertiajs/react";

export default function Edit({ asset }) {
    const { data, setData, put, processing } = useForm({
        asset_id: asset.asset_id,
        product_name: asset.product_name,
        status: asset.status,
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/assets/${asset.id}`);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Asset</h1>
            
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
                    <input
                        type="text"
                        value={data.asset_id}
                        onChange={(e) => setData("asset_id", e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                        type="text"
                        value={data.product_name}
                        onChange={(e) => setData("product_name", e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                        value={data.status}
                        onChange={(e) => setData("status", e.target.value)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                    >
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="faulty">Faulty</option>
                        <option value="retired">Retired</option>
                    </select>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
                    >
                        {processing ? 'Updating...' : 'Update Asset'}
                    </button>
                    
                    <Link 
                        href="/assets" 
                        className="ml-3 text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}