import React, { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import PbmActionButtons from '@/Components/PbmActionButtons.jsx';

export default function PbmIndex() {
    const { items, categories, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const normalize = (str) =>
        (str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    const normalizedSearch = normalize(search);

    const filtered = items.filter((item) =>
        normalize(item.name).includes(normalizedSearch) ||
        normalize(item.size).includes(normalizedSearch) ||
        normalize(item.category?.name).includes(normalizedSearch)
    );

    const isLowStock = (item) =>
        item.minimal_stock != null && item.amount_in_stock < item.minimal_stock;

    const columns = [
        {
            header: 'Category',
            render: (row) => row.category
                ? <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">{row.category.name}</span>
                : <span className="text-gray-400">—</span>
        },
        { header: 'Name', accessor: 'name' },
        {
            header: 'Size',
            render: (row) => row.size || <span className="text-gray-400">—</span>
        },
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
            header: 'Min. Stock',
            render: (row) => row.minimal_stock ?? <span className="text-gray-400">—</span>
        },
        {
            header: 'Repl. Cost',
            render: (row) => row.replacement_cost
                ? `€ ${parseFloat(row.replacement_cost).toFixed(2)}`
                : <span className="text-gray-400">—</span>
        },
        {
            header: 'Actions',
            render: (row) => <PbmActionButtons row={row} canDelete={canDelete} />
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="PPE / PBM" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-full mx-auto">

                    <h1 className="text-xl font-bold mb-4">PPE / PBM</h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Link
                            href={route('pbm.create')}
                            className="w-44 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-center whitespace-nowrap"
                        >
                            Add new item
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
                        <Table columns={columns} data={filtered} />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
