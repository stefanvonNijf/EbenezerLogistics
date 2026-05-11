import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function PbmEdit({ item, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        name: item.name || '',
        pbm_category_id: item.pbm_category_id || '',
        size: item.size || '',
        amount_in_stock: item.amount_in_stock ?? 0,
        minimal_stock: item.minimal_stock ?? '',
        replacement_cost: item.replacement_cost ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('pbm.update', item.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit PPE item</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit PPE item" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block font-medium">Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block font-medium">Category</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.pbm_category_id}
                            onChange={(e) => setData('pbm_category_id', e.target.value)}
                        >
                            <option value="">No category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.pbm_category_id && <div className="text-red-600 text-sm">{errors.pbm_category_id}</div>}
                    </div>

                    <div>
                        <label className="block font-medium">Size</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.size}
                            onChange={(e) => setData('size', e.target.value)}
                            placeholder="e.g. S, M, L, XL, 42"
                        />
                        {errors.size && <div className="text-red-600 text-sm">{errors.size}</div>}
                    </div>

                    <div>
                        <label className="block font-medium">Stock</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded px-3 py-2"
                            value={data.amount_in_stock}
                            onChange={(e) => setData('amount_in_stock', e.target.value)}
                        />
                        {errors.amount_in_stock && <div className="text-red-600 text-sm">{errors.amount_in_stock}</div>}
                    </div>

                    <div>
                        <label className="block font-medium">Minimal Stock</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded px-3 py-2"
                            value={data.minimal_stock}
                            onChange={(e) => setData('minimal_stock', e.target.value)}
                            placeholder="Leave empty for no minimum"
                        />
                        {errors.minimal_stock && <div className="text-red-600 text-sm">{errors.minimal_stock}</div>}
                    </div>

                    <div>
                        <label className="block font-medium">Replacement Cost</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded px-3 py-2"
                            value={data.replacement_cost}
                            onChange={(e) => setData('replacement_cost', e.target.value)}
                        />
                        {errors.replacement_cost && <div className="text-red-600 text-sm">{errors.replacement_cost}</div>}
                    </div>

                    <div className="flex justify-between">
                        <Link href={route('pbm.index')} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            Save
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
