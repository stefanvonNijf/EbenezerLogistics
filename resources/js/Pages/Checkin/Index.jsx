import React, { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Table from "@/Components/Table.jsx";

const statusConfig = {
    planned_checkin:  { label: 'Planned checkin',  bg: 'bg-yellow-100 text-yellow-800' },
    planned_checkout: { label: 'Checked in',       bg: 'bg-blue-100 text-blue-800' },
    checked_out:      { label: 'Checked out',      bg: 'bg-green-100 text-green-800' },
};

export default function CheckinIndex() {
    const { checkins } = usePage().props;

    const [search, setSearch] = useState("");
    const [checkoutTarget, setCheckoutTarget] = useState(null);

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = checkins.filter((row) => {
        const statusLabel = statusConfig[row.status]?.label ?? '';
        return (
            normalize(row.employee?.name).includes(normalizedSearch) ||
            normalize(row.toolbag?.name).includes(normalizedSearch) ||
            normalize(row.notes).includes(normalizedSearch) ||
            normalize(row.checkin_date).includes(normalizedSearch) ||
            normalize(row.checkout_date).includes(normalizedSearch) ||
            normalize(statusLabel).includes(normalizedSearch)
        );
    });

    const columns = [
        {
            header: "Employee",
            render: (row) => row.employee?.name || "-"
        },
        {
            header: "Toolbag",
            render: (row) => row.toolbag?.name || "-"
        },
        {
            header: "Check-in date",
            render: (row) => row.checkin_date
        },
        {
            header: "Check-out date",
            render: (row) => row.checkout_date ?? "-"
        },
        {
            header: "Status",
            render: (row) => {
                const config = statusConfig[row.status];
                if (!config) return <span className="text-gray-400">-</span>;
                return <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg}`}>{config.label}</span>;
            }
        },
        {
            header: "Notes",
            render: (row) => (
                <div className="max-w-xs truncate" title={row.notes}>
                    {row.notes || "-"}
                </div>
            )
        },
        {
            header: "",
            render: (row) => (
                <Link href={route("checkins.edit", row.id)} className="text-blue-600 hover:underline">
                    Edit
                </Link>
            )
        },
        {
            header: "To print out",
            render: (row) => (
                <a
                    href={route('checkins.pdf', row.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Export Pdf
                </a>

            )
        },
        {
            header: "Action",
            render: (row) => {
                if (row.status === 'planned_checkin') {
                    return (
                        <Link
                            href={route("checkins.create") + `?employee_id=${row.employee_id}`}
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Check in
                        </Link>
                    );
                }
                if (row.checkout_date) {
                    return <span className="text-gray-400">Done</span>;
                }
                return (
                    <button
                        type="button"
                        onClick={() => setCheckoutTarget(row)}
                        className="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                    >
                        CHECKOUT
                    </button>
                );
            }
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-xl font-bold">Check-ins</h1>
                    </div>
                </div>
            }
        >
            <Head title="Check-ins" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-11/12 mx-auto">

                    {/* BUTTON */}
                    <div className="mb-6">
                        <Link
                            href={route("checkins.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new check-in
                        </Link>
                    </div>

                    {/* SEARCH */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2 w-full sm:w-64"
                        />
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredData} />
                    </div>

                </div>
            </div>

            {checkoutTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Confirm checkout?</h3>
                        <p className="text-gray-700 mb-1">
                            <span className="font-medium">{checkoutTarget.employee?.name}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Toolbag: {checkoutTarget.toolbag?.name}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCheckoutTarget(null)}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <a
                                href={route('checkins.checkout', checkoutTarget.id)}
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                            >
                                Confirm
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
