import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function UserIndex() {
    const { users, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = users.filter(user => {
        return (
            normalize(user.name).includes(normalizedSearch) ||
            normalize(user.email).includes(normalizedSearch) ||
            normalize(user.role).includes(normalizedSearch)
        );
    });

    const handleDelete = () => {
        router.delete(route('users.destroy', deleting.id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const columns = [
        {
            header: 'Name',
            render: (row) => (
                <Link
                    href={route("users.edit", row.id)}
                    className="text-blue-600 hover:underline"
                >
                    {row.name}
                </Link>
            )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        ...(canDelete ? [{
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => setDeleting(row)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                    Delete
                </button>
            )
        }] : []),
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">

                    <h1 className="text-xl font-bold mb-4">Users</h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Link
                            href={route("users.create")}
                            className="w-44 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-center whitespace-nowrap"
                        >
                            Add new user
                        </Link>
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredData} />
                    </div>

                </div>

            </div>

            <ConfirmDeleteModal
                show={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                name={deleting?.name}
            />
        </AuthenticatedLayout>
    );
}
