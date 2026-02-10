import React, { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ActionButtons from '@/Components/ActionButtons.jsx';

export default function ToolIndex() {
    const { tools } = usePage().props;

    const [search, setSearch] = useState('');

    const filteredData = tools.filter(tool => {
        const s = search.toLowerCase();
        return (
            (tool.name ?? '').toLowerCase().includes(s) ||
            (tool.type ?? '').toLowerCase().includes(s) ||
            (tool.brand ?? '').toLowerCase().includes(s)
        );
    });

    const columns = [
        { header: 'Brand', accessor: 'brand' },
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Stock', accessor: 'amount_in_stock' },
        {
            header: 'Actions',
            render: (row) => <ActionButtons row={row} />
        }
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Tools</h1>
                    </div>
                </div>
            }
        >
            <Head title="Tools" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">

                    {/* ADD TOOL BUTTON — now left above filters */}
                    <div className="mb-6">
                        <Link
                            href={route("tools.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new tool
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
