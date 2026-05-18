import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad.jsx";

export default function LostItems({ checkin, availableTools }) {
    const tools = checkin.toolbag?.tools ?? [];

    const [step, setStep] = useState("mark");
    const [lostIds, setLostIds] = useState([]);
    const [replacements, setReplacements] = useState({});
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const toggleLost = (toolId) => {
        setLostIds((prev) => {
            if (prev.includes(toolId)) {
                const next = prev.filter((id) => id !== toolId);
                setReplacements((r) => {
                    const copy = { ...r };
                    delete copy[toolId];
                    return copy;
                });
                return next;
            }
            return [...prev, toolId];
        });
    };

    const setReplacement = (oldToolId, newToolId) => {
        setReplacements((prev) => ({ ...prev, [oldToolId]: Number(newToolId) }));
    };

    const allReplacementsSelected =
        lostIds.length > 0 && lostIds.every((id) => replacements[id]);

    const lostTools = tools.filter((t) => lostIds.includes(t.id));

    const submit = () => {
        setSubmitting(true);
        const payload = {
            replacements: lostIds.map((oldId) => ({
                old_tool_id: oldId,
                new_tool_id: replacements[oldId],
            })),
            employee_signature: employeeSig,
            manager_signature: managerSig,
        };
        router.post(route("checkins.lost-items.process", checkin.id), payload, {
            onFinish: () => setSubmitting(false),
        });
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
                            Summary of replacements
                        </h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase border-b">
                                    <th className="text-left py-2">Lost / Broken tool</th>
                                    <th className="text-center py-2 w-8"></th>
                                    <th className="text-left py-2">Replacement tool</th>
                                    <th className="text-right py-2">Replacement cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lostTools.map((oldTool) => {
                                    const newTool = availableTools.find(
                                        (t) => t.id === replacements[oldTool.id]
                                    );
                                    return (
                                        <tr key={oldTool.id} className="border-b">
                                            <td className="py-2">
                                                <p className="font-medium text-red-700 line-through">
                                                    {oldTool.name}
                                                </p>
                                                {oldTool.brand && (
                                                    <p className="text-xs text-gray-500">{oldTool.brand}</p>
                                                )}
                                            </td>
                                            <td className="py-2 text-center text-gray-400">→</td>
                                            <td className="py-2">
                                                <p className="font-medium text-gray-800">
                                                    {newTool?.name ?? "—"}
                                                </p>
                                                {newTool?.brand && (
                                                    <p className="text-xs text-gray-500">{newTool.brand}</p>
                                                )}
                                            </td>
                                            <td className="py-2 text-right text-gray-600">
                                                {newTool?.replacement_cost
                                                    ? `€ ${parseFloat(newTool.replacement_cost).toFixed(2)}`
                                                    : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
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
                <p className="text-gray-500 mb-6">
                    Toolbag: {checkin.toolbag?.name}
                </p>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Check the tools that are <strong>lost or broken</strong> and select a replacement
                        from inventory for each one.
                    </p>

                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                        <span>Tool</span>
                        <span>Replacement from inventory</span>
                    </div>

                    <div className="space-y-3">
                        {tools.map((tool) => {
                            const isLost = lostIds.includes(tool.id);
                            return (
                                <div
                                    key={tool.id}
                                    className={`border rounded px-4 py-3 transition-colors ${
                                        isLost
                                            ? "bg-red-50 border-red-300"
                                            : "bg-white border-gray-200"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                            onClick={() => toggleLost(tool.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isLost}
                                                onChange={() => toggleLost(tool.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-5 h-5 accent-red-600"
                                            />
                                            <div>
                                                <p
                                                    className={`font-medium ${
                                                        isLost
                                                            ? "line-through text-red-700"
                                                            : "text-gray-800"
                                                    }`}
                                                >
                                                    {tool.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {[tool.brand, tool.type]
                                                        .filter(Boolean)
                                                        .join(" • ")}
                                                </p>
                                            </div>
                                        </div>

                                        {isLost && (
                                            <select
                                                value={replacements[tool.id] ?? ""}
                                                onChange={(e) =>
                                                    setReplacement(tool.id, e.target.value)
                                                }
                                                className="border rounded px-2 py-1 text-sm min-w-48"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">— Select replacement —</option>
                                                {availableTools
                                                    .filter((t) => t.id !== tool.id)
                                                    .map((t) => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name}
                                                            {t.brand ? ` (${t.brand})` : ""} — stock:{" "}
                                                            {t.amount_in_stock}
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
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
                        disabled={!allReplacementsSelected}
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
