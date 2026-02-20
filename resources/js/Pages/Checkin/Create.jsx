import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create() {
    const { employees, toolbags } = usePage().props;

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEmployee = urlParams.get('employee_id') || "";

    const { data, setData, post, processing, errors } = useForm({
        employee_id:          preselectedEmployee,
        toolbag_id:           "",
        checkin_date:         "",
        notes:                "",
        notification_emails:  [],
    });

    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");

    const filteredToolbags = useMemo(() => {
        if (!data.employee_id) return [];
        const employee = employees.find(e => e.id == data.employee_id);
        if (!employee) return [];
        return toolbags.filter(tb => tb.type === employee.role);
    }, [data.employee_id, employees, toolbags]);

    const addEmail = () => {
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed) return;
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        if (!valid) { setEmailError("Enter a valid email address."); return; }
        if (data.notification_emails.includes(trimmed)) { setEmailError("Already added."); return; }
        setData("notification_emails", [...data.notification_emails, trimmed]);
        setEmailInput("");
        setEmailError("");
    };

    const removeEmail = (email) => {
        setData("notification_emails", data.notification_emails.filter(e => e !== email));
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); addEmail(); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("checkins.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New Check-in" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
                <h1 className="text-xl font-bold mb-6">New Check-in</h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* EMPLOYEE */}
                    <div>
                        <label className="block font-medium">Employee</label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData("employee_id", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">-- Select employee --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.role})
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <div className="text-red-600 text-sm">{errors.employee_id}</div>}
                    </div>

                    {/* TOOLBAG */}
                    <div>
                        <label className="block font-medium">Assign toolbag</label>
                        <select
                            value={data.toolbag_id}
                            onChange={(e) => setData("toolbag_id", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            disabled={!data.employee_id}
                        >
                            <option value="">-- Select toolbag --</option>
                            {filteredToolbags.length === 0 && data.employee_id && (
                                <option disabled>No toolbags available for this role</option>
                            )}
                            {filteredToolbags.map(tb => (
                                <option key={tb.id} value={tb.id}>
                                    {tb.name} ({tb.type})
                                </option>
                            ))}
                        </select>
                        {errors.toolbag_id && <div className="text-red-600 text-sm">{errors.toolbag_id}</div>}
                    </div>

                    {/* CHECK-IN DATE */}
                    <div>
                        <label className="block font-medium">Check-in date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-3 py-2"
                            value={data.checkin_date}
                            onChange={(e) => setData("checkin_date", e.target.value)}
                        />
                        {errors.checkin_date && <div className="text-red-600 text-sm">{errors.checkin_date}</div>}
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="block font-medium">Notes</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                        />
                        {errors.notes && <div className="text-red-600 text-sm">{errors.notes}</div>}
                    </div>

                    {/* NOTIFICATION EMAILS */}
                    <div>
                        <label className="block font-medium mb-1">Notify by email</label>
                        <p className="text-sm text-gray-500 mb-2">
                            Add email addresses that will receive a notification when this check-in is saved.
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={emailInput}
                                onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                                onKeyDown={handleEmailKeyDown}
                                placeholder="name@example.com"
                                className="flex-1 border rounded px-3 py-2 text-sm"
                            />
                            <button
                                type="button"
                                onClick={addEmail}
                                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
                            >
                                Add
                            </button>
                        </div>

                        {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                        {errors.notification_emails && <p className="text-red-600 text-sm mt-1">{errors.notification_emails}</p>}

                        {data.notification_emails.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.notification_emails.map(email => (
                                    <span
                                        key={email}
                                        className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-full px-3 py-1"
                                    >
                                        {email}
                                        <button
                                            type="button"
                                            onClick={() => removeEmail(email)}
                                            className="text-blue-400 hover:text-red-500 font-bold ml-1"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-between">
                        <Link
                            href={route("checkins.index")}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            Save Check-in
                        </button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
