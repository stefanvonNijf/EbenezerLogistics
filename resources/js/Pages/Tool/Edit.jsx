import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ tool, categories, roles }) {

    const { data, setData, post, processing, errors } = useForm({
        name: tool.name || "",
        brand: tool.brand || "",
        type: tool.type || "",
        category_id: tool.category_id || "",
        amount_in_stock: tool.amount_in_stock || 0,
        minimal_stock: tool.minimal_stock ?? "",
        replacement_cost: tool.replacement_cost ?? "",
        roletype: tool.roletype || "shared",
        image: null,
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tools.update", tool.id),{
            forceFormData: true,
            _method: "put",
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit tool</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit tool" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* NAME */}
                    <div>
                        <label className="block font-medium">Name</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <div className="text-red-600 text-sm">{errors.name}</div>
                        )}
                    </div>

                    {/* BRAND */}
                    <div>
                        <label className="block font-medium">Brand</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.brand}
                            onChange={(e) => setData("brand", e.target.value)}
                        />
                        {errors.brand && (
                            <div className="text-red-600 text-sm">{errors.brand}</div>
                        )}
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="block font-medium">Type</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                        />
                        {errors.type && (
                            <div className="text-red-600 text-sm">{errors.type}</div>
                        )}
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="block font-medium">Category</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.category_id}
                            onChange={(e) => setData("category_id", e.target.value)}
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <div className="text-red-600 text-sm">{errors.category_id}</div>
                        )}
                    </div>

                    {/* ROLETYPE */}
                    <div>
                        <label className="block font-medium">Role Type</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.roletype}
                            onChange={(e) => setData("roletype", e.target.value)}
                        >
                            <option value="shared">Shared</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* STOCK */}
                    <div>
                        <label className="block font-medium">Stock</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded px-3 py-2"
                            value={data.amount_in_stock}
                            onChange={(e) => setData("amount_in_stock", e.target.value)}
                        />
                        {errors.amount_in_stock && (
                            <div className="text-red-600 text-sm">{errors.amount_in_stock}</div>
                        )}
                    </div>
                    {/* MINIMAL STOCK */}
                    <div>
                        <label className="block font-medium">Minimal Stock</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full border rounded px-3 py-2"
                            value={data.minimal_stock}
                            onChange={(e) => setData("minimal_stock", e.target.value)}
                            placeholder="Leave empty for no minimum"
                        />
                        {errors.minimal_stock && (
                            <div className="text-red-600 text-sm">{errors.minimal_stock}</div>
                        )}
                    </div>

                    {/* REPLACEMENT COST */}
                    <div>
                        <label className="block font-medium">Replacement Cost</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border rounded px-3 py-2"
                            value={data.replacement_cost}
                            onChange={(e) => setData("replacement_cost", e.target.value)}
                        />
                        {errors.replacement_cost && (
                            <div className="text-red-600 text-sm">{errors.replacement_cost}</div>
                        )}
                    </div>

                    {/* IMAGE */}
                    <div>
                        <label className="block font-medium">Replace image</label>

                        {tool.image_path && (
                            <div>
                                <label className="block font-medium">Current image</label>

                                <img
                                    src={`/storage/${tool.image_path}`}
                                    alt={tool.name}
                                    className="mt-2 h-24 rounded border"
                                />
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="w-full border rounded px-3 py-2"
                            onChange={(e) => setData("image", e.target.files[0])}
                        />

                        {data.image && (
                            <div>
                                <label className="block font-medium">New image preview</label>

                                <img
                                    src={URL.createObjectURL(data.image)}
                                    alt="Preview"
                                    className="mt-2 h-24 rounded border"
                                />
                            </div>
                        )}

                        {errors.image && (
                            <div className="text-red-600 text-sm">{errors.image}</div>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-between">
                        <Link
                            href={route("tools.index")}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Annuleren
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            Opslaan
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
