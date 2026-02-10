import React, { useState } from "react";
import { useForm, Link, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit({ toolbag, tools }) {

    const { data, setData, put, errors } = useForm({
        name: toolbag.name,
        notes: toolbag.notes ?? "",
        type: toolbag.type,
        complete: toolbag.complete,
        employee_id: toolbag.employee_id,
        tools: (toolbag.tools ?? []).map(t => t.id)
    });

    const [confirmTool, setConfirmTool] = useState(null);

    const toggleTool = (toolId) => {
        if (data.tools.includes(toolId)) {
            setData("tools", data.tools.filter(id => id !== toolId));
        } else {
            setData("tools", [...data.tools, toolId]);
        }
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
        put(route("toolbags.update", toolbag.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Edit Toolbag</h1>
                    </div>
                </div>
            }
        >
            <Head title="Edit Toolbag" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto mb-10">
                    <form onSubmit={submit} className="space-y-6">

                        {/* NAME */}
                        <div>
                            <label className="font-medium">Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData("name", e.target.value)}
                                className="border rounded px-3 py-2 w-full mt-1"
                            />
                        </div>

                        {/* TOOL SELECTOR */}
                        <div className="border rounded p-6 bg-white shadow-sm">
                            <h2 className="font-semibold text-lg mb-4">Tools in this bag</h2>

                            <div className="space-y-3">
                                {tools.map(tool => {

                                    return (
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
                                    );
                                })}
                            </div>
                        </div>

                        {/* SAVE BUTTON */}
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        >
                            Save changes
                        </button>
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
