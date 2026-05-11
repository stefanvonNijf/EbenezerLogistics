import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

function CategoryManager({ categories }) {
    const [newName, setNewName] = useState('');
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');
    const [confirming, setConfirming] = useState(null);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        router.post(route('pbm.categories.store'), { name: newName.trim() });
        setNewName('');
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        if (!editName.trim()) return;
        router.put(route('pbm.categories.update', id), { name: editName.trim() });
        setEditing(null);
    };

    const handleDelete = (id) => {
        router.delete(route('pbm.categories.destroy', id));
        setConfirming(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">PPE Categories</h2>

            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New category..."
                    className="border rounded px-3 py-2 flex-1"
                />
                <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap">
                    Add
                </button>
            </form>

            <div className="space-y-2">
                {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 border-b pb-2">
                        {editing === cat.id ? (
                            <form onSubmit={(e) => handleUpdate(e, cat.id)} className="flex gap-2 flex-1">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border rounded px-3 py-1 flex-1"
                                    autoFocus
                                />
                                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Save</button>
                                <button type="button" onClick={() => setEditing(null)} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span className="flex-1">{cat.name}</span>
                                <button onClick={() => { setEditing(cat.id); setEditName(cat.name); }} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">Edit</button>
                                {confirming === cat.id ? (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Confirm</button>
                                        <button onClick={() => setConfirming(null)} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirming(cat.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {categories.length === 0 && <p className="text-gray-400 text-sm">No categories yet.</p>}
            </div>
        </div>
    );
}

export default function PbmIndex() {
    const { items, categories, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [showCategories, setShowCategories] = useState(false);

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

                <button
                    type="button"
                    onClick={() => setShowCategories((v) => !v)}
                    className="mb-4 px-4 py-2 border rounded text-sm hover:bg-gray-50"
                >
                    {showCategories ? 'Hide' : 'Manage'} categories
                </button>

                {showCategories && <CategoryManager categories={categories} />}

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
