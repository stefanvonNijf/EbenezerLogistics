import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function ToolbagIndex() {
    const { toolbags, employees, auth } = usePage().props;
    const canDelete = auth.user?.role === 'admin';
    const [selectedToolbag, setSelectedToolbag] = useState(null);
    const [assignEmployee, setAssignEmployee] = useState("");
    const [deleting, setDeleting] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const getStatusKey = (toolbag) => {
        if (toolbag.employee) return "in_use";
        return toolbag.complete ? "complete" : "incomplete";
    };

    const getStatus = (toolbag) => {
        if (toolbag.employee) return toolbag.employee.name;
        return toolbag.complete ? "Complete" : "Incomplete";
    };

    const counts = {
        complete: toolbags.filter(t => !t.employee && t.complete).length,
        incomplete: toolbags.filter(t => !t.employee && !t.complete).length,
        in_use: toolbags.filter(t => t.employee).length,
    };

    const filteredData = toolbags.filter((toolbag) => {
        if (statusFilter !== "all" && getStatusKey(toolbag) !== statusFilter) return false;
        return (
            normalize(toolbag.name).includes(normalizedSearch) ||
            normalize(toolbag.type).includes(normalizedSearch) ||
            normalize(getStatus(toolbag)).includes(normalizedSearch)
        );
    });

    const handleDelete = () => {
        router.delete(route('toolbags.destroy', deleting.id), {
            onSuccess: () => setDeleting(null),
        });
    };

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
            render: (row) => {
                const status = getStatus(row);
                if (row.employee) return status;
                return (
                    <span className={row.complete ? "text-green-600" : "text-red-600"}>
                        {status}
                    </span>
                );
            }
        },
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
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Toolbags ({toolbags.length})</h1>
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

                    {/* SEARCH & FILTERS */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border rounded px-3 py-2 pr-8"
                        >
                            <option value="all">All ({toolbags.length})</option>
                            <option value="complete">Complete ({counts.complete})</option>
                            <option value="incomplete">Incomplete ({counts.incomplete})</option>
                            <option value="in_use">In use ({counts.in_use})</option>
                        </select>
                    </div>

                    {/* TABLE */}
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
