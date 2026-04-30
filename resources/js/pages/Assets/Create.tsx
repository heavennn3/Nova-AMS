
import { useForm, Link } from "@inertiajs/react";
export default function Create() {
    const { data, setData, post, processing } = useForm({
        asset_id: "",
        product_name: "",
        status: "available",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/assets");
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Asset</h1>
            
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID *</label>
                    <input
                        type="text"
                        placeholder="ATM-123456"
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
                        placeholder="Product name"
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
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
                    >
                        {processing ? 'Saving...' : 'Save Asset'}
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