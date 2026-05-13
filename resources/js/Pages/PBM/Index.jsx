import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

export default function PbmIndex() {
    const { items, categories, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');


    const normalize = (str) =>
        (str ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    const normalizedSearch = normalize(search);

    const filtered = items.filter((item) => {
        const matchesSearch =
            normalize(item.name).includes(normalizedSearch) ||
            normalize(item.size).includes(normalizedSearch) ||
            normalize(item.category?.name).includes(normalizedSearch);
        const matchesCategory = !filterCategory || String(item.pbm_category_id) === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const isLowStock = (item) =>
        item.minimal_stock != null && item.amount_in_stock <= item.minimal_stock;

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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.patch(route('pbm.decrementStock', row.id))}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold flex items-center justify-center"
                    >−</button>
                    <span className={`w-8 text-center font-medium ${isLowStock(row) ? 'text-red-600' : ''}`}>
                        {row.amount_in_stock}
                        {isLowStock(row) && <span title={`Below minimum (${row.minimal_stock})`}> ⚠</span>}
                    </span>
                    <button
                        onClick={() => router.patch(route('pbm.incrementStock', row.id))}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold flex items-center justify-center"
                    >+</button>
                </div>
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
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Link href={route('pbm.edit', row.id)} className="text-blue-600 hover:underline text-sm">Edit</Link>
                    {canDelete && (
                        <button
                            onClick={() => { if (confirm('Delete this item?')) router.delete(route('pbm.destroy', row.id)); }}
                            className="text-red-600 hover:underline text-sm"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="PPE / PBM" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
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
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <Table columns={columns} data={filtered} />
            </div>
        </AuthenticatedLayout>
    );
}
