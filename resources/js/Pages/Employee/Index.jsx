import React, { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

export default function EmployeeIndex() {
    const { employees } = usePage().props;

    const [search, setSearch] = useState('');
    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = employees.filter(employee => {
        return (
            normalize(employee.name).includes(normalizedSearch) ||
            normalize(employee.employee_number).includes(normalizedSearch) ||
            normalize(employee.role).includes(normalizedSearch)
        );
    });

    const columns = [
        {
            header: 'Name',
            render: (row) => (
                <Link
                    href={route("employees.edit", row.id)}
                    className="text-blue-600 hover:underline"
                >
                    {row.name}
                </Link>
            )
        },
        { header: 'Employee Nr', render: (row) => row.employee_number || '-' },
        { header: 'Role', accessor: 'role' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Employees</h1>
                    </div>
                </div>
            }
        >
            <Head title="Employees" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">

                    <div className="mb-6">
                        <Link
                            href={route("employees.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new employee
                        </Link>
                    </div>

                    {/* SEARCH */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredData} />
                    </div>

                </div>

            </div>

        </AuthenticatedLayout>
    );
}
