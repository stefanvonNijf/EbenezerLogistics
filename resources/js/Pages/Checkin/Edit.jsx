import React, { useState } from "react";
import { useForm, Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit() {

    const { checkin, toolbags } = usePage().props;

    const isCustomInit = !checkin.toolbag_id && Array.isArray(checkin.custom_items) && checkin.custom_items.length > 0;

    const { data, setData, put, processing, errors } = useForm({
        checkin_date:  checkin.checkin_date || "",
        notes:         checkin.notes || "",
        employee_id:   checkin.employee_id,
        toolbag_id:    checkin.toolbag_id || "",
        is_custom:     isCustomInit,
        custom_items:  checkin.custom_items || [],
    });

    const [itemName, setItemName] = useState("");
    const [itemCost, setItemCost] = useState("");

    const filteredToolbags = toolbags.filter(
        (tb) => tb.type === checkin.employee.role.toLowerCase()
    );

    const toggleCustom = () => {
        setData(prev => ({
            ...prev,
            is_custom:    !prev.is_custom,
            toolbag_id:   "",
            custom_items: [],
        }));
    };

    const addItem = () => {
        const name = itemName.trim();
        if (!name) return;
        const cost = itemCost !== "" ? parseFloat(itemCost) : null;
        setData("custom_items", [...data.custom_items, { name, replacement_cost: cost }]);
        setItemName("");
        setItemCost("");
    };

    const removeItem = (index) => {
        setData("custom_items", data.custom_items.filter((_, i) => i !== index));
    };

    const handleItemKeyDown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); addItem(); }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("checkins.update", checkin.id));
    };

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

                    {/* CUSTOM TOGGLE */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleCustom}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                data.is_custom ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                                    data.is_custom ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                        <span className="font-medium text-sm">
                            {data.is_custom ? 'Custom items' : 'Assign toolbag'}
                        </span>
                    </div>

                    {/* TOOLBAG or CUSTOM ITEMS */}
                    {!data.is_custom ? (
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
                    ) : (
                        <div>
                            <label className="block font-medium mb-1">Custom items</label>
                            <p className="text-sm text-gray-500 mb-2">Add the items being checked out with an optional replacement cost.</p>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    onKeyDown={handleItemKeyDown}
                                    placeholder="Item name"
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={itemCost}
                                    onChange={(e) => setItemCost(e.target.value)}
                                    onKeyDown={handleItemKeyDown}
                                    placeholder="Cost (€)"
                                    min="0"
                                    step="0.01"
                                    className="w-28 border rounded px-3 py-2 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
                                >
                                    Add
                                </button>
                            </div>

                            {errors.custom_items && <p className="text-red-600 text-sm mt-1">{errors.custom_items}</p>}

                            {data.custom_items.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {data.custom_items.map((item, i) => (
                                        <li key={i} className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 text-sm">
                                            <span>{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500">
                                                    {item.replacement_cost != null
                                                        ? `€ ${parseFloat(item.replacement_cost).toFixed(2)}`
                                                        : "—"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(i)}
                                                    className="text-gray-400 hover:text-red-500 font-bold"
                                                >
                                                    &times;
                                                </button>
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
