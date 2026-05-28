import React, { useState, useRef } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Table from "@/Components/Table.jsx";
import SignatureModal from "@/Components/SignatureModal.jsx";
import ConfirmDeleteModal from "@/Components/ConfirmDeleteModal.jsx";

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
    const [uploadTarget, setUploadTarget] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('checkins.destroy', deleteTarget.id), {
            onFinish: () => setDeleteTarget(null),
        });
    };

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
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

    const triggerUpload = (checkin, type) => {
        setUploadTarget({ id: checkin.id, type });
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !uploadTarget) return;

        const routeName = uploadTarget.type === 'checkin'
            ? 'checkins.upload-pdf'
            : 'checkins.upload-checkout-pdf';

        setUploading(true);
        router.post(
            route(routeName, uploadTarget.id),
            { pdf: file },
            {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    setUploadTarget(null);
                },
            }
        );
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
            header: "",
            render: (row) => (
                <div className="flex flex-col gap-1 items-start">
                    {!row.contract_exported_at && (
                        <Link href={route("checkins.edit", row.id)} className="text-blue-600 hover:underline text-sm">
                            Edit
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="text-red-600 hover:underline text-sm text-left"
                    >
                        Delete
                    </button>
                </div>
            )
        },
        {
            header: "Contract",
            render: (row) => {
                if (row.signed_checkin_pdf_path) {
                    return (
                        <div className="flex flex-col gap-1 items-start">
                            <span className="inline-block w-28 py-1 bg-gray-100 text-gray-500 rounded text-xs text-center border border-gray-300">
                                Exported
                            </span>
                            <a
                                href={route('checkins.signed-pdf', row.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                View signed
                            </a>
                        </div>
                    );
                }

                return (
                    <div className="flex flex-col gap-1 items-start">
                        {!row.contract_exported_at && !row.is_template && (
                            <button
                                type="button"
                                onClick={() => openSignModal(row)}
                                className="inline-block w-28 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm text-center"
                            >
                                Export PDF
                            </button>
                        )}
                        <button
                            type="button"
                            disabled={uploading && uploadTarget?.id === row.id}
                            onClick={() => triggerUpload(row, 'checkin')}
                            className="inline-block w-28 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm text-center disabled:opacity-50"
                        >
                            {uploading && uploadTarget?.id === row.id && uploadTarget?.type === 'checkin'
                                ? 'Uploading…'
                                : 'Upload PDF'}
                        </button>
                    </div>
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
                            {row.signed_checkout_pdf_path ? (
                                <a
                                    href={route('checkins.checkout.pdf', row.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    View checkout
                                </a>
                            ) : (
                                <>
                                    <span className="inline-block w-28 py-1 text-gray-400 text-sm text-center">Done</span>
                                    <button
                                        type="button"
                                        disabled={uploading && uploadTarget?.id === row.id}
                                        onClick={() => triggerUpload(row, 'checkout')}
                                        className="inline-block w-28 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm text-center disabled:opacity-50"
                                    >
                                        {uploading && uploadTarget?.id === row.id && uploadTarget?.type === 'checkout'
                                            ? 'Uploading…'
                                            : 'Upload PDF'}
                                    </button>
                                </>
                            )}
                        </div>
                    );
                }
                const hasPlannedDate = !!row.planned_checkout_date;
                return (
                    <div className="flex flex-col gap-1 items-start">
                        <Link
                            href={route("checkins.checkout", row.id)}
                            className={`inline-block w-36 py-1 text-white rounded text-sm text-center ${
                                hasPlannedDate
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-400 hover:bg-blue-500'
                            }`}
                        >
                            Checkout
                        </Link>
                        <Link
                            href={route("checkins.lost-items", row.id)}
                            className="inline-block w-36 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm text-center"
                        >
                            Lost/Broken/Extras
                        </Link>
                    </div>
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

            <ConfirmDeleteModal
                show={!!deleteTarget}
                name={deleteTarget ? `check-in for ${deleteTarget.employee?.name ?? ''}` : ''}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            {/* Hidden file input for PDF uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="lg:max-w-8xl mx-auto px-3 sm:px-3 lg:px-4">
                <div className="max-w-11/12 mx-auto">

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
                        <h1 className="text-xl font-bold ml-auto">Check-ins</h1>
                    </div>

                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredData} />
                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
