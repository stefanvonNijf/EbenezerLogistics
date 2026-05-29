import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad.jsx";

export default function Checkout({ checkin }) {
    const isCar    = !!checkin.car;
    const isCustom = !isCar && !checkin.toolbag && Array.isArray(checkin.custom_items) && checkin.custom_items.length > 0;
    const isPdf    = !isCar && !checkin.toolbag && !!checkin.signed_checkin_pdf_path;
    const tools    = checkin.toolbag?.tools ?? [];

    const [step, setStep] = useState('review');
    const [presentIds, setPresentIds] = useState(tools.map((t) => t.id));
    const [returnedItems, setReturnedItems] = useState(
        isCustom ? checkin.custom_items.map((_, i) => i) : []
    );
    const [checkoutMileage, setCheckoutMileage] = useState("");
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig] = useState(null);

    // Missing items for PDF checkins
    const [hasMissingItems, setHasMissingItems] = useState(false);
    const [missingItems, setMissingItems] = useState([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemCost, setNewItemCost] = useState("");

    const toggle = (toolId) =>
        setPresentIds((prev) => prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]);

    const toggleItem = (index) =>
        setReturnedItems((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]);

    const addMissingItem = () => {
        const name = newItemName.trim();
        if (!name) return;
        setMissingItems((prev) => [...prev, { name, replacement_cost: newItemCost !== "" ? newItemCost : null }]);
        setNewItemName("");
        setNewItemCost("");
    };

    const removeMissingItem = (index) =>
        setMissingItems((prev) => prev.filter((_, i) => i !== index));

    const missingItemsTotalCost = missingItems.reduce((sum, i) => sum + (parseFloat(i.replacement_cost) || 0), 0);

    const missingTools = tools.filter((t) => !presentIds.includes(t.id));
    const totalCost    = missingTools.reduce((sum, t) => sum + (parseFloat(t.replacement_cost) || 0), 0);
    const missingItemCount = isCustom ? checkin.custom_items.length - returnedItems.length : 0;
    const missingItemTotalCost = isCustom
        ? checkin.custom_items.filter((_, i) => !returnedItems.includes(i)).reduce((sum, item) => sum + (parseFloat(item.replacement_cost) || 0), 0)
        : 0;

    const submit = () => {
        const payload = {
            employee_signature: employeeSig,
            manager_signature: managerSig,
        };
        if (isCar) {
            payload.checkout_mileage = checkoutMileage || null;
        } else {
            payload.missing_tool_ids = missingTools.map((t) => t.id);
            if (isPdf && hasMissingItems && missingItems.length > 0) {
                payload.checkout_missing_items = missingItems;
            }
        }
        router.post(route("checkins.checkout.process", checkin.id), payload, {
            onSuccess: (page) => {
                const url = page.props.flash?.signed_checkout_url;
                if (url) window.open(url, "_blank");
            },
        });
    };

    if (step === 'sign') {
        return (
            <AuthenticatedLayout>
                <Head title="Checkout — Sign" />
                <div className="lg:max-w-4xl mx-auto px-6">
                    <h1 className="text-xl font-bold mb-1">Checkout — {checkin.employee?.name}</h1>
                    <p className="text-gray-500 mb-6">Please have both parties sign below to complete the checkout.</p>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        {isCar && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mileage at return (optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={checkoutMileage}
                                    onChange={(e) => setCheckoutMileage(e.target.value)}
                                    placeholder="e.g. 46500"
                                    className="border rounded px-3 py-2 w-48"
                                />
                            </div>
                        )}
                        <SignaturePad label={`Signature ${checkin.employee?.name}`} onChange={setEmployeeSig} />
                        <SignaturePad label="Signature person in charge" onChange={setManagerSig} />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!employeeSig || !managerSig}
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Complete checkout &amp; download report
                        </button>
                        <button type="button" onClick={() => setStep('review')} className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50">
                            Back
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Checkout" />
            <div className="lg:max-w-4xl mx-auto px-6">
                <h1 className="text-xl font-bold mb-1">Checkout — {checkin.employee?.name}</h1>
                <p className="text-gray-500 mb-6">
                    {isCar
                        ? `Car: ${checkin.car.brand} — ${checkin.car.license_plate}`
                        : isCustom ? "Custom check-in" : isPdf ? "Document check-in" : `Toolbag: ${checkin.toolbag?.name}`}
                </p>

                <div className="bg-white rounded-lg shadow p-6">
                    {isCar ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Confirm that the vehicle is being returned.</p>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 font-medium text-gray-500 w-40">Car</td>
                                        <td className="py-2">{checkin.car.brand} — {checkin.car.license_plate}</td>
                                    </tr>
                                    {checkin.checkin_mileage != null && (
                                        <tr className="border-b">
                                            <td className="py-2 font-medium text-gray-500">Mileage at check-in</td>
                                            <td className="py-2">{checkin.checkin_mileage.toLocaleString()} km</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : isPdf ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-600 mb-3">This check-in has an uploaded document.</p>
                                <a
                                    href={route("checkins.signed-pdf", checkin.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    View check-in PDF
                                </a>
                            </div>

                            <div className="border-t pt-5">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={hasMissingItems}
                                        onChange={(e) => setHasMissingItems(e.target.checked)}
                                        className="w-4 h-4 accent-blue-600"
                                    />
                                    <span className="font-medium text-gray-800">Missing items</span>
                                </label>

                                {hasMissingItems && (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Item name"
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addMissingItem()}
                                                className="flex-1 border rounded px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Cost (€)"
                                                value={newItemCost}
                                                onChange={(e) => setNewItemCost(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addMissingItem()}
                                                className="w-28 border rounded px-3 py-2 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={addMissingItem}
                                                disabled={!newItemName.trim()}
                                                className="px-4 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {missingItems.length > 0 && (
                                            <div className="space-y-2">
                                                {missingItems.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between border border-red-200 bg-red-50 rounded px-4 py-3">
                                                        <span className="font-medium text-red-800">{item.name}</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm font-semibold text-red-600">
                                                                {item.replacement_cost != null ? `€ ${parseFloat(item.replacement_cost).toFixed(2)}` : "—"}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMissingItem(i)}
                                                                className="text-red-400 hover:text-red-600"
                                                                aria-label="Remove"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex justify-end pt-1">
                                                    <span className="text-sm font-bold text-red-600">
                                                        Total: € {missingItemsTotalCost.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {missingItems.length === 0 && (
                                            <p className="text-sm text-gray-400 italic">No missing items added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isCustom ? (
                        <>
                            <p className="text-sm text-gray-600 mb-4">Mark each item as returned. Uncheck any item that is <strong>not</strong> being returned.</p>
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                                <span>Item</span><span>Replacement cost</span>
                            </div>
                            <div className="space-y-2">
                                {checkin.custom_items.map((item, i) => {
                                    const isReturned = returnedItems.includes(i);
                                    return (
                                        <div key={i} onClick={() => toggleItem(i)} className={`flex items-center justify-between border rounded px-4 py-3 cursor-pointer transition-colors ${isReturned ? "bg-white border-gray-200 hover:bg-gray-50" : "bg-red-50 border-red-300"}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={isReturned} onChange={() => toggleItem(i)} onClick={(e) => e.stopPropagation()} className="w-5 h-5 accent-blue-600" />
                                                <p className={`font-medium ${!isReturned ? "line-through text-red-700" : "text-gray-800"}`}>{item.name}</p>
                                            </div>
                                            <span className={`text-sm font-semibold ${!isReturned ? "text-red-600" : "text-gray-500"}`}>
                                                {item.replacement_cost != null ? `€ ${parseFloat(item.replacement_cost).toFixed(2)}` : "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 pt-4 border-t flex items-center justify-between">
                                <span className="text-gray-600">{missingItemCount === 0 ? "All items accounted for" : `${missingItemCount} item${missingItemCount > 1 ? "s" : ""} not returned`}</span>
                                <span className={`text-lg font-bold ${missingItemTotalCost > 0 ? "text-red-600" : "text-gray-400"}`}>Total: € {missingItemTotalCost.toFixed(2)}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 mb-4">All tools are marked as returned by default. Uncheck any tool that is <strong>not</strong> being returned.</p>
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                                <span>Tool</span><span>Replacement cost</span>
                            </div>
                            <div className="space-y-2">
                                {tools.map((tool) => {
                                    const isPresent = presentIds.includes(tool.id);
                                    return (
                                        <div key={tool.id} onClick={() => toggle(tool.id)} className={`flex items-center justify-between border rounded px-4 py-3 cursor-pointer transition-colors ${isPresent ? "bg-white border-gray-200 hover:bg-gray-50" : "bg-red-50 border-red-300"}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={isPresent} onChange={() => toggle(tool.id)} onClick={(e) => e.stopPropagation()} className="w-5 h-5 accent-blue-600" />
                                                <div>
                                                    <p className={`font-medium ${!isPresent ? "line-through text-red-700" : "text-gray-800"}`}>{tool.name}</p>
                                                    <p className="text-xs text-gray-500">{[tool.brand, tool.type].filter(Boolean).join(" • ")}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold ${!isPresent ? "text-red-600" : "text-gray-500"}`}>
                                                {tool.replacement_cost ? `€ ${parseFloat(tool.replacement_cost).toFixed(2)}` : "—"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 pt-4 border-t flex items-center justify-between">
                                <span className="text-gray-600">{missingTools.length === 0 ? "All tools accounted for" : `${missingTools.length} missing tool${missingTools.length > 1 ? "s" : ""}`}</span>
                                <span className={`text-lg font-bold ${totalCost > 0 ? "text-red-600" : "text-gray-400"}`}>Total: € {totalCost.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep('sign')} className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">
                        Continue to signing
                    </button>
                    <Link href={route("checkins.index")} className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
