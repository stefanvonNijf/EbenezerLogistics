import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad.jsx";

export default function Checkout({ checkin }) {
    const isCar    = !!checkin.car;
    const isCustom = !isCar && !checkin.toolbag && Array.isArray(checkin.custom_items) && checkin.custom_items.length > 0;
    const tools    = checkin.toolbag?.tools ?? [];

    const [step, setStep] = useState('review');
    const [presentIds, setPresentIds] = useState(tools.map((t) => t.id));
    const [returnedItems, setReturnedItems] = useState(
        isCustom ? checkin.custom_items.map((_, i) => i) : []
    );
    const [checkoutMileage, setCheckoutMileage] = useState("");
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig] = useState(null);

    const toggle = (toolId) =>
        setPresentIds((prev) => prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]);

    const toggleItem = (index) =>
        setReturnedItems((prev) => prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]);

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
                        : isCustom ? "Custom check-in" : `Toolbag: ${checkin.toolbag?.name}`}
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
