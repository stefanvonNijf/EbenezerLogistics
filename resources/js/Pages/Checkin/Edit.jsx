import React, { useState, useEffect } from "react";
import { useForm, Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit() {

    const { checkin, toolbags } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        checkin_date: checkin.checkin_date || "",
        notes: checkin.notes || "",
        toolbag_id: checkin.toolbag_id || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("checkins.update", checkin.id));
    };

    // filter toolbags op basis van employee rol
    const filteredToolbags = toolbags.filter(
        (tb) => tb.type === checkin.employee.role.toLowerCase()
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit check-in</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit check-in" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* EMPLOYEE (read only) */}
                    <div>
                        <label className="block font-medium">Employee</label>
                        <input
                            className="w-full border rounded px-3 py-2 bg-gray-100"
                            value={checkin.employee.name}
                            disabled
                        />
                    </div>

                    {/* TOOLBAG */}
                    <div>
                        <label className="block font-medium">Toolbag</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={data.toolbag_id}
                            onChange={(e) => setData("toolbag_id", e.target.value)}
                        >
                            <option value="">-- Select toolbag --</option>

                            {filteredToolbags.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
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
                            rows="4"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                        />
                        {errors.notes && (
                            <div className="text-red-600 text-sm">{errors.notes}</div>
                        )}
                    </div>

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
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
