import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

export default function ToolbagIndex() {
    const { toolbags, employees } = usePage().props;
    const [selectedToolbag, setSelectedToolbag] = useState(null);
    const [assignEmployee, setAssignEmployee] = useState("");

    const [search, setSearch] = useState("");

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = toolbags.filter((toolbag) => {
        return normalize(toolbag.name).includes(normalizedSearch);
    });

    const columns = [
        {
            header: 'Name',
            render: (row) => (
                <Link
                    href={route("toolbags.edit", row.id)}
                    className="text-blue-600 hover:underline"
                >
                    {row.name}
                </Link>
            )
        },
        {
            header: "Type",
            render: (row) => row.type === "electrician" ? "Electrician" : "Ironworker"
        },
        {
            header: "Status",
            render: (row) =>
                row.employee
                    ? row.employee.name
                    : "Available"
        },
    ];



    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Toolbags</h1>
                    </div>
                </div>
            }
        >
            <Head title="Toolbags" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-11/12 mx-auto">

                    {/* CREATE BUTTON */}
                    <div className="mb-6">
                        <Link
                            href={route("toolbags.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new toolbag
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
