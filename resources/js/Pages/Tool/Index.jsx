import React, { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ActionButtons from '@/Components/ActionButtons.jsx';

export default function ToolIndex() {
    const { tools, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = tools.filter(tool => {
        return (
            normalize(tool.name).includes(normalizedSearch) ||
            normalize(tool.type).includes(normalizedSearch) ||
            normalize(tool.brand).includes(normalizedSearch) ||
            normalize(tool.category?.name).includes(normalizedSearch)
        );
    });

    const isLowStock = (tool) =>
        tool.minimal_stock != null && tool.amount_in_stock <= tool.minimal_stock;

    const columns = [
        { header: 'Brand', accessor: 'brand' },
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Category', render: (row) => row.category?.name || '-' },
        {
            header: 'Stock',
            render: (row) => (
                <span className={`flex items-center gap-1 ${isLowStock(row) ? 'text-red-600 font-semibold' : ''}`}>
                    {row.amount_in_stock}
                    {isLowStock(row) && (
                        <span title={`Below minimum (${row.minimal_stock})`} className="text-red-500">&#9888;</span>
                    )}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => <ActionButtons row={row} canDelete={canDelete} />
        }
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Inventory" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">

                    <h1 className="text-xl font-bold mb-4">Inventory</h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Link
                            href={route("tools.create")}
                            className="w-44 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-center whitespace-nowrap"
                        >
                            Add new tool
                        </Link>
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
