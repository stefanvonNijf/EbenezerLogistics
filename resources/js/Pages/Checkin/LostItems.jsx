import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad.jsx";

export default function LostItems({ checkin }) {
    const tools = checkin.toolbag?.tools ?? [];

    const [step, setStep] = useState("mark");
    const [lostIds, setLostIds] = useState([]);
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const toggle = (toolId) =>
        setLostIds((prev) =>
            prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
        );

    const lostTools = tools.filter((t) => lostIds.includes(t.id));

    const submit = () => {
        setSubmitting(true);
        router.post(
            route("checkins.lost-items.process", checkin.id),
            {
                tool_ids: lostIds,
                employee_signature: employeeSig,
                manager_signature: managerSig,
            },
            { onFinish: () => setSubmitting(false) }
        );
    };

    if (step === "sign") {
        return (
            <AuthenticatedLayout>
                <Head title="Lost/broken items — Sign" />
                <div className="lg:max-w-4xl mx-auto px-6">
                    <h1 className="text-xl font-bold mb-1">
                        Lost/broken items — {checkin.employee?.name}
                    </h1>
                    <p className="text-gray-500 mb-6">
                        Please have both parties sign below to confirm the replacements.
                    </p>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                            Tools to be replaced
                        </h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase border-b">
                                    <th className="text-left py-2">Tool</th>
                                    <th className="text-left py-2">Brand</th>
                                    <th className="text-right py-2">Replacement cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lostTools.map((tool) => (
                                    <tr key={tool.id} className="border-b">
                                        <td className="py-2 font-medium text-gray-800">{tool.name}</td>
                                        <td className="py-2 text-gray-500">{tool.brand ?? "—"}</td>
                                        <td className="py-2 text-right text-gray-600">
                                            {tool.replacement_cost
                                                ? `€ ${parseFloat(tool.replacement_cost).toFixed(2)}`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        <SignaturePad
                            label={`Signature ${checkin.employee?.name}`}
                            onChange={setEmployeeSig}
                        />
                        <SignaturePad
                            label="Signature person in charge"
                            onChange={setManagerSig}
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!employeeSig || !managerSig || submitting}
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Processing…" : "Confirm & send email"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("mark")}
                            className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Lost/broken items" />
            <div className="lg:max-w-4xl mx-auto px-6">
                <h1 className="text-xl font-bold mb-1">
                    Lost/broken items — {checkin.employee?.name}
                </h1>
                <p className="text-gray-500 mb-6">Toolbag: {checkin.toolbag?.name}</p>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Check the tools that are <strong>lost or broken</strong>. The employee will receive a new unit from inventory.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {tools.map((tool) => {
                            const isLost = lostIds.includes(tool.id);
                            const noStock = tool.amount_in_stock <= 0;
                            return (
                                <div
                                    key={tool.id}
                                    onClick={() => toggle(tool.id)}
                                    className={`border rounded px-4 py-3 cursor-pointer transition-colors select-none ${
                                        isLost
                                            ? "bg-red-50 border-red-300"
                                            : "bg-white border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isLost}
                                            onChange={() => toggle(tool.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-5 h-5 accent-red-600 mt-0.5 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isLost ? "line-through text-red-700" : "text-gray-800"}`}>
                                                {tool.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {[tool.brand, tool.type].filter(Boolean).join(" • ")}
                                            </p>
                                            <p className={`text-xs mt-1 ${noStock ? "text-red-500 font-medium" : "text-gray-400"}`}>
                                                {noStock ? "No stock available" : `In stock: ${tool.amount_in_stock}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {tools.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-8">
                            No tools in this toolbag.
                        </p>
                    )}

                    <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                        {lostIds.length === 0
                            ? "No tools marked as lost or broken."
                            : `${lostIds.length} tool${lostIds.length > 1 ? "s" : ""} marked as lost/broken.`}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setStep("sign")}
                        disabled={lostIds.length === 0}
                        className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Continue to signing
                    </button>
                    <Link
                        href={route("checkins.index")}
                        className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
