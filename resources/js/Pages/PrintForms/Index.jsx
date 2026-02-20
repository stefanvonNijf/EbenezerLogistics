import React, { useState } from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PrintFormsIndex() {
    const { employees, documents, auth } = usePage().props;
    const isAdmin = auth.user?.role === "admin";

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [notes, setNotes] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const ppeUrl = selectedEmployee
        ? route("print-forms.ppe", selectedEmployee) +
          (notes ? `?notes=${encodeURIComponent(notes)}` : "")
        : "#";

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        pdf: null,
    });

    const submitUpload = (e) => {
        e.preventDefault();
        post(route("print-forms.upload"), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const confirmDelete = () => {
        router.delete(route("print-forms.destroy", deleteTarget.id), {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Print Forms" />

            <div className="lg:max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 space-y-8">
                <h1 className="text-xl font-bold">Print Forms</h1>

                {/* PPE ISSUE FORM */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-1">PPE Issue Form</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Select an employee and print a PPE issue form.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium text-sm mb-1">Employee</label>
                            <select
                                className="border rounded px-3 py-2 w-64"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                            >
                                <option value="">Select employee...</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium text-sm mb-1">Notes</label>
                            <textarea
                                className="border rounded px-3 py-2 w-full"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes to include on the form..."
                            />
                        </div>

                        <a
                            href={ppeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-block px-4 py-2 rounded text-white ${
                                selectedEmployee
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 pointer-events-none"
                            }`}
                            onClick={(e) => { if (!selectedEmployee) e.preventDefault(); }}
                        >
                            Print PPE Issue Form
                        </a>
                    </div>
                </div>

                {/* UPLOAD DOCUMENT */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-1">Upload Document</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Upload a PDF to make it available for download.
                    </p>

                    <form onSubmit={submitUpload} className="space-y-4">
                        <div>
                            <label className="block font-medium text-sm mb-1">Document name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-sm"
                                placeholder="e.g. Safety Manual 2026"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium text-sm mb-1">PDF file</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setData("pdf", e.target.files[0])}
                                className="block"
                            />
                            {errors.pdf && (
                                <p className="text-red-600 text-sm mt-1">{errors.pdf}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            Upload
                        </button>
                    </form>
                </div>

                {/* DOCUMENT LIST */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Documents</h2>

                    {documents.length === 0 ? (
                        <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between border rounded px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-gray-800">{doc.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {doc.uploaded_by ? `Uploaded by ${doc.uploaded_by} · ` : ""}
                                            {doc.created_at}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <a
                                            href={route("print-forms.download", doc.id)}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                        >
                                            Download
                                        </a>
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(doc)}
                                                className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* DELETE CONFIRM MODAL */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Delete document?</h3>
                        <p className="text-gray-700 mb-4">
                            <span className="font-medium">{deleteTarget.name}</span> will be permanently deleted.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
