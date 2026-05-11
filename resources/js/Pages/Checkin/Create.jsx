import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const TYPE_TOOLBAG = 'toolbag';
const TYPE_CAR     = 'car';
const TYPE_CUSTOM  = 'custom';

export default function Create() {
    const { employees, toolbags, cars } = usePage().props;

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEmployee = urlParams.get('employee_id') || "";

    const { data, setData, post, processing, errors } = useForm({
        employee_id:         preselectedEmployee,
        toolbag_id:          "",
        car_id:              "",
        checkin_mileage:     "",
        checkin_date:        "",
        notes:               "",
        notification_emails: [],
        is_custom:           false,
        is_car:              false,
        custom_items:        [],
    });

    const [type, setType] = useState(TYPE_TOOLBAG);
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemCost, setItemCost] = useState("");

    const switchType = (newType) => {
        setType(newType);
        setData(prev => ({
            ...prev,
            is_custom:    newType === TYPE_CUSTOM,
            is_car:       newType === TYPE_CAR,
            toolbag_id:   "",
            car_id:       "",
            checkin_mileage: "",
            custom_items: [],
        }));
    };

    const filteredToolbags = useMemo(() => {
        if (!data.employee_id) return [];
        const employee = employees.find(e => e.id === Number(data.employee_id));
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
        setEmailInput(""); setEmailError("");
    };

    const removeEmail = (email) =>
        setData("notification_emails", data.notification_emails.filter(e => e !== email));

    const handleEmailKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } };

    const addItem = () => {
        const name = itemName.trim();
        if (!name) return;
        const cost = itemCost !== "" ? parseFloat(itemCost) : null;
        setData("custom_items", [...data.custom_items, { name, replacement_cost: cost }]);
        setItemName(""); setItemCost("");
    };

    const removeItem = (index) =>
        setData("custom_items", data.custom_items.filter((_, i) => i !== index));

    const handleItemKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } };

    const handleSubmit = (e) => { e.preventDefault(); post(route("checkins.store")); };

    const typeBtn = (label, value) => (
        <button
            type="button"
            onClick={() => switchType(value)}
            className={`px-4 py-2 text-sm rounded border transition-colors ${
                type === value
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
        >
            {label}
        </button>
    );

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

                    {/* TYPE SELECTOR */}
                    <div>
                        <label className="block font-medium mb-2">Type</label>
                        <div className="flex gap-2">
                            {typeBtn('Toolbag', TYPE_TOOLBAG)}
                            {typeBtn('Car', TYPE_CAR)}
                            {typeBtn('Custom items', TYPE_CUSTOM)}
                        </div>
                    </div>

                    {/* TOOLBAG */}
                    {type === TYPE_TOOLBAG && (
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
                                    <option key={tb.id} value={tb.id}>{tb.name} ({tb.type})</option>
                                ))}
                            </select>
                            {errors.toolbag_id && <div className="text-red-600 text-sm">{errors.toolbag_id}</div>}
                        </div>
                    )}

                    {/* CAR */}
                    {type === TYPE_CAR && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium">Assign car</label>
                                <select
                                    value={data.car_id}
                                    onChange={(e) => setData("car_id", e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">-- Select car --</option>
                                    {cars.length === 0 && <option disabled>No cars available</option>}
                                    {cars.map(car => (
                                        <option key={car.id} value={car.id}>
                                            {car.brand} — {car.license_plate}
                                        </option>
                                    ))}
                                </select>
                                {errors.car_id && <div className="text-red-600 text-sm">{errors.car_id}</div>}
                            </div>
                            <div>
                                <label className="block font-medium">Mileage at check-in (optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.checkin_mileage}
                                    onChange={(e) => setData("checkin_mileage", e.target.value)}
                                    placeholder="e.g. 45000"
                                    className="w-full border rounded px-3 py-2"
                                />
                                {errors.checkin_mileage && <div className="text-red-600 text-sm">{errors.checkin_mileage}</div>}
                            </div>
                        </div>
                    )}

                    {/* CUSTOM ITEMS */}
                    {type === TYPE_CUSTOM && (
                        <div>
                            <label className="block font-medium mb-1">Custom items</label>
                            <p className="text-sm text-gray-500 mb-2">Add the items being checked out with an optional replacement cost.</p>
                            <div className="flex gap-2">
                                <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} onKeyDown={handleItemKeyDown} placeholder="Item name" className="flex-1 border rounded px-3 py-2 text-sm" />
                                <input type="number" value={itemCost} onChange={(e) => setItemCost(e.target.value)} onKeyDown={handleItemKeyDown} placeholder="Cost (€)" min="0" step="0.01" className="w-28 border rounded px-3 py-2 text-sm" />
                                <button type="button" onClick={addItem} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm">Add</button>
                            </div>
                            {errors.custom_items && <p className="text-red-600 text-sm mt-1">{errors.custom_items}</p>}
                            {data.custom_items.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {data.custom_items.map((item, i) => (
                                        <li key={i} className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 text-sm">
                                            <span>{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500">{item.replacement_cost != null ? `€ ${parseFloat(item.replacement_cost).toFixed(2)}` : "—"}</span>
                                                <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 font-bold">&times;</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* CHECK-IN DATE */}
                    <div>
                        <label className="block font-medium">Check-in date</label>
                        <input type="date" className="w-full border rounded px-3 py-2" value={data.checkin_date} onChange={(e) => setData("checkin_date", e.target.value)} />
                        {errors.checkin_date && <div className="text-red-600 text-sm">{errors.checkin_date}</div>}
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="block font-medium">Notes</label>
                        <textarea className="w-full border rounded px-3 py-2" value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
                        {errors.notes && <div className="text-red-600 text-sm">{errors.notes}</div>}
                    </div>

                    {/* NOTIFICATION EMAILS */}
                    <div>
                        <label className="block font-medium mb-1">Notify by email</label>
                        <p className="text-sm text-gray-500 mb-2">Add email addresses that will receive a notification when this check-in is saved.</p>
                        <div className="flex gap-2">
                            <input type="text" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }} onKeyDown={handleEmailKeyDown} placeholder="name@example.com" className="flex-1 border rounded px-3 py-2 text-sm" />
                            <button type="button" onClick={addEmail} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm">Add</button>
                        </div>
                        {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                        {errors.notification_emails && <p className="text-red-600 text-sm mt-1">{errors.notification_emails}</p>}
                        {data.notification_emails.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.notification_emails.map(email => (
                                    <span key={email} className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-full px-3 py-1">
                                        {email}
                                        <button type="button" onClick={() => removeEmail(email)} className="text-blue-400 hover:text-red-500 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-between">
                        <Link href={route("checkins.index")} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</Link>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Save Check-in</button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
