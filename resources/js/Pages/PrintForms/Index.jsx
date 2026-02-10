import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PrintFormsIndex() {
    const { employees } = usePage().props;

    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [notes, setNotes] = useState("");

    const ppeUrl = selectedEmployee
        ? route("print-forms.ppe", selectedEmployee) + (notes ? `?notes=${encodeURIComponent(notes)}` : "")
        : "#";

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Print Forms</h1>
                    </div>
                </div>
            }
        >
            <Head title="Print Forms" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* PPE ISSUE FORM */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-2">PPE Issue Form</h2>
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
                                onClick={(e) => {
                                    if (!selectedEmployee) e.preventDefault();
                                }}
                            >
                                Print PPE Issue Form
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
