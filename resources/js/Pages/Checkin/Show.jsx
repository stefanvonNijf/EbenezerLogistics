import React, { useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const statusConfig = {
    planned_checkin:  { label: 'Planned checkin',  bg: 'bg-yellow-100 text-yellow-800' },
    planned_checkout: { label: 'Checked in',       bg: 'bg-blue-100 text-blue-800' },
    checked_out:      { label: 'Checked out',      bg: 'bg-green-100 text-green-800' },
};

export default function CheckinShow({ checkin }) {
    const status = statusConfig[checkin.status];

    const [uploadType, setUploadType] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const triggerUpload = (type) => {
        setUploadType(type);
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !uploadType) return;

        const routeName = uploadType === 'checkin'
            ? 'checkins.upload-pdf'
            : 'checkins.upload-checkout-pdf';

        setUploading(true);
        router.post(
            route(routeName, checkin.id),
            { pdf: file },
            {
                forceFormData: true,
                onFinish: () => {
                    setUploading(false);
                    setUploadType(null);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Check-in — ${checkin.employee?.name}`} />

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="lg:max-w-3xl mx-auto px-6">
                <div className="mb-4">
                    <Link href={route("checkins.index")} className="text-blue-600 hover:underline text-sm">
                        &larr; Back to Check-ins
                    </Link>
                </div>

                <h1 className="text-xl font-bold mb-6">Check-in — {checkin.employee?.name}</h1>

                {/* Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="font-semibold text-gray-700 mb-3">Details</h2>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <dt className="font-medium text-gray-500">Employee</dt>
                        <dd>{checkin.employee?.name ?? "—"}</dd>

                        <dt className="font-medium text-gray-500">Status</dt>
                        <dd>
                            {status
                                ? <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg}`}>{status.label}</span>
                                : "—"}
                        </dd>

                        <dt className="font-medium text-gray-500">Check-in date</dt>
                        <dd>{checkin.checkin_date ?? "—"}</dd>

                        <dt className="font-medium text-gray-500">Checkout date</dt>
                        <dd>{checkin.checkout_date ?? "—"}</dd>

                        <dt className="font-medium text-gray-500">
                            {checkin.car ? "Car" : "Toolbag"}
                        </dt>
                        <dd>
                            {checkin.car
                                ? `${checkin.car.brand} — ${checkin.car.license_plate}`
                                : checkin.toolbag?.name ?? (checkin.custom_items?.length ? `Custom (${checkin.custom_items.length} items)` : "—")}
                        </dd>

                        {checkin.car && checkin.checkin_mileage != null && (
                            <>
                                <dt className="font-medium text-gray-500">Mileage at check-in</dt>
                                <dd>{checkin.checkin_mileage.toLocaleString()} km</dd>
                            </>
                        )}
                        {checkin.car && checkin.checkout_mileage != null && (
                            <>
                                <dt className="font-medium text-gray-500">Mileage at checkout</dt>
                                <dd>{checkin.checkout_mileage.toLocaleString()} km</dd>
                            </>
                        )}

                        {checkin.notes && (
                            <>
                                <dt className="font-medium text-gray-500">Notes</dt>
                                <dd>{checkin.notes}</dd>
                            </>
                        )}
                    </dl>
                </div>

                {/* Signed Documents */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="font-semibold text-gray-700 mb-4">Signed Documents</h2>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between border rounded px-4 py-3">
                            <div>
                                <p className="font-medium text-gray-800">Check-in Contract</p>
                                <p className="text-xs text-gray-500">
                                    {checkin.contract_exported_at
                                        ? `Signed on ${new Date(checkin.contract_exported_at).toLocaleDateString()}`
                                        : "Not yet signed"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkin.signed_checkin_pdf_path ? (
                                    <a
                                        href={route('checkins.signed-pdf', checkin.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        View PDF
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">No file</span>
                                )}
                                <button
                                    type="button"
                                    disabled={uploading && uploadType === 'checkin'}
                                    onClick={() => triggerUpload('checkin')}
                                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                                >
                                    {uploading && uploadType === 'checkin' ? 'Uploading…' : 'Upload PDF'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border rounded px-4 py-3">
                            <div>
                                <p className="font-medium text-gray-800">Checkout Report</p>
                                <p className="text-xs text-gray-500">
                                    {checkin.checkout_date
                                        ? `Checkout on ${checkin.checkout_date}`
                                        : "Not yet completed"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {checkin.signed_checkout_pdf_path ? (
                                    <a
                                        href={route('checkins.checkout.pdf', checkin.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        View PDF
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">No file</span>
                                )}
                                <button
                                    type="button"
                                    disabled={uploading && uploadType === 'checkout'}
                                    onClick={() => triggerUpload('checkout')}
                                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                                >
                                    {uploading && uploadType === 'checkout' ? 'Uploading…' : 'Upload PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
