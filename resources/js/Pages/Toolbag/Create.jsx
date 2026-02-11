import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create({ tools }) {

    const { data, setData, post, errors } = useForm({
        name: "",
        notes: "",
        type: "electrician",
        tools: [],
    });

    const [confirmTool, setConfirmTool] = useState(null);

    const filteredTools = tools.filter(
        (tool) => tool.roletype === "shared" || tool.roletype === data.type
    );

    const toggleTool = (toolId) => {
        if (data.tools.includes(toolId)) {
            setData("tools", data.tools.filter((id) => id !== toolId));
        } else {
            setData("tools", [...data.tools, toolId]);
        }
    };

    const markComplete = () => {
        setData("tools", filteredTools.map((t) => t.id));
    };

    const addFromStock = (tool) => {
        setConfirmTool(tool);
    };

    const confirmAddFromStock = () => {
        if (confirmTool && !data.tools.includes(confirmTool.id)) {
            setData("tools", [...data.tools, confirmTool.id]);
        }
        setConfirmTool(null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("toolbags.store"));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Create Toolbag</h1>
                    </div>
                </div>
            }
        >
            <Head title="Create Toolbag" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto mb-10">
                    <form onSubmit={submit} className="space-y-6">

                        {/* NAME */}
                        <div>
                            <label className="font-medium">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="border rounded px-3 py-2 w-full mt-1"
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* TYPE */}
                        <div>
                            <label className="font-medium">Type</label>
                            <select
                                value={data.type}
                                onChange={(e) => {
                                    setData("type", e.target.value);
                                }}
                                className="border rounded px-3 py-2 w-full mt-1"
                            >
                                <option value="electrician">Electrician</option>
                                <option value="ironworker">Ironworker</option>
                            </select>
                            {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
                        </div>

                        {/* NOTES */}
                        <div>
                            <label className="font-medium">Notes</label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData("notes", e.target.value)}
                                className="border rounded px-3 py-2 w-full mt-1"
                                rows={3}
                            />
                        </div>

                        {/* TOOL SELECTOR */}
                        <div className="border rounded p-6 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-lg">Tools in this bag</h2>
                                <button
                                    type="button"
                                    onClick={markComplete}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                >
                                    Mark as complete
                                </button>
                            </div>

                            <div className="space-y-3">
                                {filteredTools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        className="flex items-center justify-between border-b pb-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={data.tools.includes(tool.id)}
                                                onChange={() => toggleTool(tool.id)}
                                                className="w-5 h-5"
                                            />

                                            <div>
                                                <p className="font-medium">{tool.name}</p>
                                                <p className="text-xs text-gray-500">{tool.brand} • {tool.type}</p>
                                            </div>
                                        </div>

                                        {!data.tools.includes(tool.id) && (
                                            <button
                                                type="button"
                                                disabled={tool.amount_in_stock < 1}
                                                onClick={() => addFromStock(tool)}
                                                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                                            >
                                                Add from stock ({tool.amount_in_stock})
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                            >
                                Create toolbag
                            </button>
                            <Link
                                href={route("toolbags.index")}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

            </div>

            {confirmTool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Add from stock?</h3>
                        <p className="text-gray-700 mb-1">
                            <span className="font-medium">{confirmTool.name}</span>
                            {confirmTool.brand && (
                                <span className="text-gray-500"> — {confirmTool.brand}</span>
                            )}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Current stock: {confirmTool.amount_in_stock}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmTool(null)}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAddFromStock}
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
