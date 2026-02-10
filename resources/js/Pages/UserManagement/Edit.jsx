import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ user }) {

    const { data, setData, put, processing, errors } = useForm({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "user",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("users.update", user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit user</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit user" />

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

                    {/* EMAIL */}
                    <div>
                        <label className="block font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded px-3 py-2"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="block font-medium">Role</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && <div className="text-red-600 text-sm">{errors.role}</div>}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="Leave blank to keep current password"
                        />
                        {errors.password && <div className="text-red-600 text-sm">{errors.password}</div>}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                        <label className="block font-medium">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full border rounded px-3 py-2"
                            value={data.password_confirmation}
                            onChange={(e) => setData("password_confirmation", e.target.value)}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-between">
                        <Link
                            href={route("users.index")}
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
