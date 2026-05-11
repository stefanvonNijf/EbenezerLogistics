import React, { useState } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Table from "@/Components/Table.jsx";
import SignatureModal from "@/Components/SignatureModal.jsx";

const statusConfig = {
    planned_checkin:  { label: 'Planned checkin',  bg: 'bg-yellow-100 text-yellow-800' },
    planned_checkout: { label: 'Checked in',       bg: 'bg-blue-100 text-blue-800' },
    checked_out:      { label: 'Checked out',      bg: 'bg-green-100 text-green-800' },
};

export default function CheckinIndex() {
    const { checkins } = usePage().props;

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCheckin, setSelectedCheckin] = useState(null);
    const [exporting, setExporting] = useState(false);

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

    const openSignModal = (row) => {
        setSelectedCheckin(row);
        setModalOpen(true);
    };

    const handleSignConfirm = ({ employeeSignature, managerSignature }) => {
        setExporting(true);
        axios.post(route('checkins.sign-and-export', selectedCheckin.id), {
            employee_signature: employeeSignature,
            manager_signature: managerSignature,
        })
        .then((res) => {
            setModalOpen(false);
            setSelectedCheckin(null);
            window.open(res.data.url, '_blank');
            router.reload();
        })
        .catch(() => {
            alert('Something went wrong while exporting the contract.');
        })
        .finally(() => setExporting(false));
    };

    const columns = [
        {
            header: "Employee",
            render: (row) => row.employee?.name || "-"
        },
        {
            header: "Toolbag / Car / Items",
            render: (row) => {
                if (row.car) return (
                    <span className="text-indigo-700 font-medium">
                        {row.car.brand} — {row.car.license_plate}
                    </span>
                );
                if (row.toolbag?.name) return row.toolbag.name;
                if (row.custom_items?.length) {
                    return (
                        <span className="text-gray-600 text-xs italic" title={row.custom_items.join(', ')}>
                            Custom ({row.custom_items.length} items)
                        </span>
                    );
                }
                return "-";
            }
        },
        {
            header: "Check-in date",
            render: (row) => row.checkin_date
        },
        {
            header: "Check-out date",
            render: (row) => {
                if (row.checkout_date) return row.checkout_date;
                if (row.planned_checkout_date) return <span className="text-orange-600">{row.planned_checkout_date} (planned)</span>;
                return "-";
            }
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
            header: "PPE",
            render: (row) => row.ppe_forms_count > 0
                ? <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">{row.ppe_forms_count}x issued</span>
                : <span className="text-gray-400 text-xs">—</span>
        },
        {
            header: "",
            render: (row) => {
                if (row.contract_exported_at) return null;
                return (
                    <Link href={route("checkins.edit", row.id)} className="text-blue-600 hover:underline">
                        Edit
                    </Link>
                );
            }
        },
        {
            header: "Contract",
            render: (row) => {
                if (row.contract_exported_at) {
                    return (
                        <div className="flex flex-col gap-1 items-start">
                            <span className="inline-block w-28 py-1 bg-gray-100 text-gray-500 rounded text-xs text-center border border-gray-300">
                                Exported
                            </span>
                            {row.signed_checkin_pdf_path && (
                                <a
                                    href={`/storage/${row.signed_checkin_pdf_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    View signed
                                </a>
                            )}
                        </div>
                    );
                }
                return (
                    <button
                        type="button"
                        onClick={() => openSignModal(row)}
                        className="inline-block w-28 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm text-center"
                    >
                        Export PDF
                    </button>
                );
            }
        },
        {
            header: "Action",
            render: (row) => {
                if (row.status === 'planned_checkin') {
                    return (
                        <Link
                            href={route("checkins.create") + `?employee_id=${row.employee_id}`}
                            className="inline-block w-28 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm text-center"
                        >
                            Check in
                        </Link>
                    );
                }
                if (row.checkout_date) {
                    return (
                        <div className="flex flex-col gap-1 items-start">
                            <span className="inline-block w-28 py-1 text-gray-400 text-sm text-center">Done</span>
                            {row.signed_checkout_pdf_path && (
                                <a
                                    href={`/storage/${row.signed_checkout_pdf_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    View checkout
                                </a>
                            )}
                        </div>
                    );
                }
                const hasPlannedDate = !!row.planned_checkout_date;
                return (
                    <Link
                        href={route("checkins.checkout", row.id)}
                        className={`inline-block w-28 py-1 text-white rounded text-sm text-center ${
                            hasPlannedDate
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-400 hover:bg-blue-500'
                        }`}
                    >
                        Checkout
                    </Link>
                );
            }
        },
        {
            header: "Details",
            render: (row) => (
                <Link
                    href={route("checkins.show", row.id)}
                    className="text-blue-600 hover:underline text-sm"
                >
                    Details
                </Link>
            )
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Check-ins" />

            {modalOpen && selectedCheckin && (
                <SignatureModal
                    open={modalOpen}
                    employeeName={selectedCheckin.employee?.name ?? ''}
                    onConfirm={handleSignConfirm}
                    onClose={() => { setModalOpen(false); setSelectedCheckin(null); }}
                />
            )}

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-11/12 mx-auto">

                    <h1 className="text-xl font-bold mb-4">Check-ins</h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Link
                            href={route("checkins.create")}
                            className="w-44 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-center whitespace-nowrap"
                        >
                            Add new check-in
                        </Link>
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>

                    <Table columns={columns} data={filteredData} />

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
