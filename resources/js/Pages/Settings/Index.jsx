import React, { useState } from 'react';
import { usePage, Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

function InlineList({ title, items, onAdd, onUpdate, onDelete }) {
    const [newName, setNewName] = useState('');
    const [editing, setEditing] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleting, setDeleting] = useState(null);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        onAdd(newName.trim());
        setNewName('');
    };

    const startEdit = (item) => {
        setEditing(item.id);
        setEditName(item.name);
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        if (!editName.trim()) return;
        onUpdate(id, editName.trim());
        setEditing(null);
    };

    const handleDelete = (id) => {
        onDelete(id);
        setDeleting(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>

            {/* Add form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New name..."
                    className="border rounded px-3 py-2 flex-1"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                >
                    Add
                </button>
            </form>

            {/* List */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 border-b pb-2">
                        {editing === item.id ? (
                            <form onSubmit={(e) => handleUpdate(e, item.id)} className="flex gap-2 flex-1">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border rounded px-3 py-1 flex-1"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(null)}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <>
                                <span className="flex-1">{item.name}</span>
                                <button
                                    onClick={() => startEdit(item)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                                >
                                    Edit
                                </button>
                                {deleting === item.id ? (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setDeleting(null)}
                                            className="px-3 py-1 border rounded hover:bg-gray-50 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleting(item.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-gray-400 text-sm">No items yet.</p>
                )}
            </div>
        </div>
    );
}

export default function SettingsIndex() {
    const { categories, roles } = usePage().props;

    const handleAddCategory = (name) => {
        router.post(route('settings.categories.store'), { name });
    };
    const handleUpdateCategory = (id, name) => {
        router.put(route('settings.categories.update', id), { name });
    };
    const handleDeleteCategory = (id) => {
        router.delete(route('settings.categories.destroy', id));
    };

    const handleAddRole = (name) => {
        router.post(route('settings.roles.store'), { name });
    };
    const handleUpdateRole = (id, name) => {
        router.put(route('settings.roles.update', id), { name });
    };
    const handleDeleteRole = (id) => {
        router.delete(route('settings.roles.destroy', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settings" />

            <div className="lg:max-w-4xl mx-auto px-6 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold mb-4">Settings</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    <InlineList
                        title="Tool Categories"
                        items={categories}
                        onAdd={handleAddCategory}
                        onUpdate={handleUpdateCategory}
                        onDelete={handleDeleteCategory}
                    />
                    <InlineList
                        title="Employee Functions"
                        items={roles}
                        onAdd={handleAddRole}
                        onUpdate={handleUpdateRole}
                        onDelete={handleDeleteRole}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
