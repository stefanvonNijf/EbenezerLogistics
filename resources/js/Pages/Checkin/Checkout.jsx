import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Checkout({ checkin }) {
    const tools = checkin.toolbag?.tools ?? [];

    const [presentIds, setPresentIds] = useState(tools.map((t) => t.id));

    const toggle = (toolId) => {
        setPresentIds((prev) =>
            prev.includes(toolId)
                ? prev.filter((id) => id !== toolId)
                : [...prev, toolId]
        );
    };

    const missingTools = tools.filter((t) => !presentIds.includes(t.id));
    const totalCost = missingTools.reduce(
        (sum, t) => sum + (parseFloat(t.replacement_cost) || 0),
        0
    );

    const submit = () => {
        router.post(
            route("checkins.checkout.process", checkin.id),
            { missing_tool_ids: missingTools.map((t) => t.id) },
            {
                onSuccess: () => {
                    window.open(route("checkins.checkout.pdf", checkin.id), "_blank");
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Checkout" />

            <div className="lg:max-w-4xl mx-auto px-6">
                <h1 className="text-xl font-bold mb-1">
                    Checkout — {checkin.employee?.name}
                </h1>
                <p className="text-gray-500 mb-6">
                    Toolbag: {checkin.toolbag?.name}
                </p>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        All tools are marked as returned by default. Uncheck any tool that is <strong>not</strong> being returned.
                    </p>

                    {/* Header row */}
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
                        <span>Tool</span>
                        <span>Replacement cost</span>
                    </div>

                    <div className="space-y-2">
                        {tools.map((tool) => {
                            const isPresent = presentIds.includes(tool.id);
                            return (
                                <div
                                    key={tool.id}
                                    onClick={() => toggle(tool.id)}
                                    className={`flex items-center justify-between border rounded px-4 py-3 cursor-pointer transition-colors ${
                                        isPresent
                                            ? "bg-white border-gray-200 hover:bg-gray-50"
                                            : "bg-red-50 border-red-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isPresent}
                                            onChange={() => toggle(tool.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-5 h-5 accent-blue-600"
                                        />
                                        <div>
                                            <p
                                                className={`font-medium ${
                                                    !isPresent
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

                                    <span
                                        className={`text-sm font-semibold ${
                                            !isPresent
                                                ? "text-red-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {tool.replacement_cost
                                            ? `€ ${parseFloat(tool.replacement_cost).toFixed(2)}`
                                            : "—"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <span className="text-gray-600">
                            {missingTools.length === 0
                                ? "All tools accounted for"
                                : `${missingTools.length} missing tool${missingTools.length > 1 ? "s" : ""}`}
                        </span>
                        <span
                            className={`text-lg font-bold ${
                                totalCost > 0
                                    ? "text-red-600"
                                    : "text-gray-400"
                            }`}
                        >
                            Total: € {totalCost.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={submit}
                        className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        Complete checkout &amp; download report
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
