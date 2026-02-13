import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create() {
    const { employees, toolbags } = usePage().props;

    // Pre-select employee from query param
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEmployee = urlParams.get('employee_id') || "";

    const { data, setData, post, processing, errors } = useForm({
        employee_id: preselectedEmployee,
        toolbag_id: "",
        checkin_date: "",
        notes: ""
    });

    const filteredToolbags = useMemo(() => {
        if (!data.employee_id) return [];

        const employee = employees.find(e => e.id == data.employee_id);
        if (!employee) return [];

        return toolbags.filter(tb => tb.type === employee.role);
    }, [data.employee_id, employees, toolbags]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("checkins.store"));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">New Check-in</h1>
                    </div>
                </div>
            }
        >
            <Head title="New Check-in" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
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
                        {errors.employee_id && (
                            <div className="text-red-600 text-sm">{errors.employee_id}</div>
                        )}
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

                        {errors.toolbag_id && (
                            <div className="text-red-600 text-sm">{errors.toolbag_id}</div>
                        )}
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
                        {errors.checkin_date && (
                            <div className="text-red-600 text-sm">{errors.checkin_date}</div>
                        )}
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="block font-medium">Notes</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                        />
                        {errors.notes && (
                            <div className="text-red-600 text-sm">{errors.notes}</div>
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
