import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ toolbagTypes }) {

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        employee_number: "",
        role: "",
        shoe_size: "",
        pants_size: "",
        jacket_size: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("employees.store"));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">New employee</h1>
                    </div>
                </div>
            }
        >
            <Head title="New employee" />

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
                        {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                    </div>

                    {/* EMPLOYEE NUMBER */}
                    <div>
                        <label className="block font-medium">Employee Nr</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.employee_number}
                            onChange={(e) => setData("employee_number", e.target.value)}
                        />
                        {errors.employee_number && <div className="text-red-600 text-sm">{errors.employee_number}</div>}
                    </div>

                    {/* TOOLBAG TYPE */}
                    <div>
                        <label className="block font-medium">Toolbag type</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                        >
                            <option value="">Select a toolbag type</option>
                            {toolbagTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.role && <div className="text-red-600 text-sm">{errors.role}</div>}
                    </div>

                    {/* SHOE SIZE */}
                    <div>
                        <label className="block font-medium">Shoe Size</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.shoe_size}
                            onChange={(e) => setData("shoe_size", e.target.value)}
                        />
                    </div>

                    {/* PANTS SIZE */}
                    <div>
                        <label className="block font-medium">Pants Size</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.pants_size}
                            onChange={(e) => setData("pants_size", e.target.value)}
                        />
                    </div>

                    {/* JACKET SIZE */}
                    <div>
                        <label className="block font-medium">Jacket Size</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.jacket_size}
                            onChange={(e) => setData("jacket_size", e.target.value)}
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-between">
                        <Link
                            href={route("employees.index")}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            Add employee
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
