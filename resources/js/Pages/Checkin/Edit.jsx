import React, { useState, useMemo } from "react";
import { useForm, Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const TYPE_TOOLBAG = 'toolbag';
const TYPE_CAR     = 'car';
const TYPE_CUSTOM  = 'custom';

export default function Edit() {
    const { checkin, toolbags, cars, documents, selectedDocumentIds } = usePage().props;

    const initType = checkin.car_id
        ? TYPE_CAR
        : (!checkin.toolbag_id && Array.isArray(checkin.custom_items) && checkin.custom_items.length > 0)
            ? TYPE_CUSTOM
            : TYPE_TOOLBAG;

    const { data, setData, put, processing, errors } = useForm({
        checkin_date:    checkin.checkin_date || "",
        notes:           checkin.notes || "",
        employee_id:     checkin.employee_id,
        toolbag_id:      checkin.toolbag_id || "",
        car_id:          checkin.car_id || "",
        checkin_mileage: checkin.checkin_mileage ?? "",
        is_custom:       initType === TYPE_CUSTOM,
        is_car:          initType === TYPE_CAR,
        custom_items:    checkin.custom_items || [],
        document_ids:    selectedDocumentIds || [],
    });

    const [type, setType] = useState(initType);
    const [itemName, setItemName] = useState("");
    const [itemCost, setItemCost] = useState("");
    const [docSearch, setDocSearch] = useState("");

    const switchType = (newType) => {
        setType(newType);
        setData(prev => ({
            ...prev,
            is_custom:       newType === TYPE_CUSTOM,
            is_car:          newType === TYPE_CAR,
            toolbag_id:      "",
            car_id:          "",
            checkin_mileage: "",
            custom_items:    [],
        }));
    };

    const filteredToolbags = toolbags.filter(
        (tb) => tb.type === checkin.employee.role?.toLowerCase()
    );

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

    const toggleDocument = (id) => {
        setData('document_ids', data.document_ids.includes(id)
            ? data.document_ids.filter(d => d !== id)
            : [...data.document_ids, id]
        );
    };

    const filteredDocs = useMemo(() =>
        (documents || []).filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase())),
        [documents, docSearch]
    );

    const handleSubmit = (e) => { e.preventDefault(); put(route("checkins.update", checkin.id)); };

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
                        <input className="w-full border rounded px-3 py-2 bg-gray-100" value={checkin.employee.name} disabled />
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
                            <label className="block font-medium">Toolbag</label>
                            <select className="w-full border rounded px-3 py-2" value={data.toolbag_id} onChange={(e) => setData("toolbag_id", e.target.value)}>
                                <option value="">-- Select toolbag --</option>
                                {filteredToolbags.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
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
                                <select className="w-full border rounded px-3 py-2" value={data.car_id} onChange={(e) => setData("car_id", e.target.value)}>
                                    <option value="">-- Select car --</option>
                                    {cars.map(car => (
                                        <option key={car.id} value={car.id}>{car.brand} — {car.license_plate}</option>
                                    ))}
                                </select>
                                {errors.car_id && <div className="text-red-600 text-sm">{errors.car_id}</div>}
                            </div>
                            <div>
                                <label className="block font-medium">Mileage at check-in (optional)</label>
                                <input type="number" min="0" value={data.checkin_mileage} onChange={(e) => setData("checkin_mileage", e.target.value)} placeholder="e.g. 45000" className="w-full border rounded px-3 py-2" />
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
                        <textarea className="w-full border rounded px-3 py-2" rows="4" value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
                        {errors.notes && <div className="text-red-600 text-sm">{errors.notes}</div>}
                    </div>

                    {/* DOCUMENTS */}
                    {documents && documents.length > 0 && (
                        <div>
                            <label className="block font-medium mb-1">Attach documents</label>
                            <p className="text-sm text-gray-500 mb-2">Select documents from the library to attach to this check-in.</p>
                            <input
                                type="text"
                                value={docSearch}
                                onChange={(e) => setDocSearch(e.target.value)}
                                placeholder="Search documents…"
                                className="w-full border rounded px-3 py-2 text-sm mb-2"
                            />
                            <div className="border rounded max-h-48 overflow-y-auto divide-y">
                                {filteredDocs.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-gray-400">No documents found.</p>
                                ) : filteredDocs.map(doc => (
                                    <label key={doc.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data.document_ids.includes(doc.id)}
                                            onChange={() => toggleDocument(doc.id)}
                                            className="rounded border-gray-300"
                                        />
                                        <span>{doc.name}</span>
                                    </label>
                                ))}
                            </div>
                            {data.document_ids.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {data.document_ids.map(id => {
                                        const doc = documents.find(d => d.id === id);
                                        return doc ? (
                                            <span key={id} className="flex items-center gap-1 bg-gray-100 border text-gray-700 text-sm rounded-full px-3 py-1">
                                                {doc.name}
                                                <button type="button" onClick={() => toggleDocument(id)} className="text-gray-400 hover:text-red-500 font-bold ml-1">&times;</button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Link href={route("checkins.index")} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</Link>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Save changes</button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
