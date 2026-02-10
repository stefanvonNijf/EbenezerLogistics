import React from "react";
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

    const toggleTool = (toolId) => {
        if (data.tools.includes(toolId)) {
            setData("tools", data.tools.filter(id => id !== toolId));
        } else {
            setData("tools", [...data.tools, toolId]);
        }
    };

    const addFromStock = (toolId) => {
        if (!data.tools.includes(toolId)) {
            setData("tools", [...data.tools, toolId]);
        }
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
                                                    onClick={() => addFromStock(tool.id)}
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
        </AuthenticatedLayout>
    );
}
