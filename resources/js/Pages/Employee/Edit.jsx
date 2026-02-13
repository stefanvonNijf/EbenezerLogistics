import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ employee, roles }) {

    const { data, setData, put, processing, errors } = useForm({
        name: employee.name ?? "",
        employee_number: employee.employee_number ?? "",
        role: employee.role ?? "",
        remark: employee.remark ?? "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("employees.update", employee.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit employee</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit employee" />

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
                        {errors.employee_number && (
                            <div className="text-red-600 text-sm">{errors.employee_number}</div>
                        )}
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="block font-medium">Role</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                        >
                            <option value="">Select a role</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* REMARK */}
                    <div>
                        <label className="block font-medium">Remark</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            rows="3"
                            value={data.remark}
                            onChange={(e) => setData("remark", e.target.value)}
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
                            Save changes
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
