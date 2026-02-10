import React, { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Table from "@/Components/Table.jsx";

export default function CheckinIndex() {
    const { checkins } = usePage().props;

    const [search, setSearch] = useState("");

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = checkins.filter((row) => {
        const employeeName = normalize(row.employee?.name);
        const toolbagName = normalize(row.toolbag?.name);
        const notes = normalize(row.notes);

        return (
            employeeName.includes(normalizedSearch) ||
            toolbagName.includes(normalizedSearch) ||
            notes.includes(normalizedSearch)
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
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Export Pdf
                </a>

            )
        },
        {
            header: "Checkout",
            render: (row) => (
                <a
                    href={route('checkins.checkout', row.id)}
                    className="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                >
                    CHECKOUT
                </a>

            )
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
        </AuthenticatedLayout>
    );
}
