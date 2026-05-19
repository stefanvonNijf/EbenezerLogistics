import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function CarIndex() {
    const { cars, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const normalize = (str) =>
        (str ?? '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = cars.filter((car) => {
        const assignedTo = car.employee?.name ?? 'Available';
        return (
            normalize(car.brand).includes(normalizedSearch) ||
            normalize(car.license_plate).includes(normalizedSearch) ||
            normalize(assignedTo).includes(normalizedSearch)
        );
    });

    const handleDelete = () => {
        router.delete(route('cars.destroy', deleting.id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const columns = [
        {
            header: 'Brand',
            render: (row) => (
                <Link href={route('cars.edit', row.id)} className="text-blue-600 hover:underline">
                    {row.brand}
                </Link>
            ),
        },
        {
            header: 'License plate',
            render: (row) => row.license_plate,
        },
        {
            header: 'Assigned to',
            render: (row) =>
                row.employee ? (
                    row.employee.name
                ) : (
                    <span className="text-green-600">Available</span>
                ),
        },
        ...(canDelete
            ? [
                  {
                      header: 'Actions',
                      render: (row) => (
                          <button
                              onClick={() => setDeleting(row)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                              Delete
                          </button>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Cars" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-11/12 mx-auto">

                    <h1 className="text-xl font-bold mb-4">Cars ({cars.length})</h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Link
                            href={route('cars.create')}
                            className="w-44 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-center whitespace-nowrap"
                        >
                            Add new car
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
                name={deleting ? `${deleting.brand} — ${deleting.license_plate}` : ''}
            />
        </AuthenticatedLayout>
    );
}
