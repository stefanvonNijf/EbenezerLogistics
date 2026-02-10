import React, { useState } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

export default function ToolbagIndex() {
    const { toolbags, employees } = usePage().props;
    const [selectedToolbag, setSelectedToolbag] = useState(null);
    const [assignEmployee, setAssignEmployee] = useState("");

    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [completeFilter, setCompleteFilter] = useState("all");
    const [search, setSearch] = useState("");


    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = toolbags.filter((toolbag) => {
        const status = toolbag.employee_id ? "in use" : "available";
        const completeness = toolbag.complete ? "complete" : "incomplete";

        const matchRole =
            roleFilter === "all" || toolbag.type === roleFilter;

        const matchStatus =
            statusFilter === "all" || status === statusFilter;

        const matchComplete =
            completeFilter === "all" || completeness === completeFilter;

        const matchSearch = normalize(toolbag.name).includes(normalizedSearch);

        return matchRole && matchStatus && matchComplete && matchSearch;
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

                    {/* FILTERS SECTION */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">

                        {/* ROLE FILTER */}
                        <div className="flex gap-2 border-4">
                            {["all", "electrician", "ironworker"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                                        roleFilter === role
                                            ? "bg-gray-300 border-[#014489]"
                                            : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-200"
                                    }`}
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* STATUS FILTER */}
                        <div className="flex gap-2 border-4">
                            {["all", "available", "in use"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                                        statusFilter === status
                                            ? "bg-gray-300 border-[#014489]"
                                            : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-200"
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* COMPLETENESS FILTER */}
                        <div className="flex gap-2 border-4">
                            {["all", "complete", "incomplete"].map((comp) => (
                                <button
                                    key={comp}
                                    onClick={() => setCompleteFilter(comp)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                                        completeFilter === comp
                                            ? "bg-gray-300 border-[#014489]"
                                            : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-200"
                                    }`}
                                >
                                    {comp.charAt(0).toUpperCase() + comp.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* SEARCH */}
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
