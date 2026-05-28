import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad.jsx";

const PPE_ITEMS = [
    { key: 'goggles',      label: 'Goggles' },
    { key: 'gloves',       label: 'Gloves' },
    { key: 'rain_jacket',  label: 'Rain Jacket' },
    { key: 'inner_jacket', label: 'Inner Jacket (Lining)' },
    { key: 'rain_pants',   label: 'Rain Pants' },
    { key: 'overalls',     label: 'Overalls' },
    { key: 'boots',        label: 'Boots' },
    { key: 'helmet',       label: 'Helmet' },
];

export default function LostItems({ checkin }) {
    const tools = checkin.toolbag?.tools ?? [];

    const [tab, setTab] = useState('extra-items');

    // ── Extra Items ──
    const [extraItems, setExtraItems]       = useState([]);
    const [extraStep, setExtraStep]         = useState('add');
    const [extraEmpSig, setExtraEmpSig]     = useState(null);
    const [extraMgrSig, setExtraMgrSig]     = useState(null);
    const [extraSubmitting, setExtraSubmitting] = useState(false);

    const addExtraItem    = () => setExtraItems(p => [...p, { name: '', price: '' }]);
    const updateExtraItem = (i, f, v) => setExtraItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
    const removeExtraItem = (i) => setExtraItems(p => p.filter((_, idx) => idx !== i));
    const validExtraItems = extraItems.filter(i => i.name.trim() !== '');

    const submitExtras = () => {
        setExtraSubmitting(true);
        router.post(
            route('checkins.lost-items.process', checkin.id),
            { custom_items: validExtraItems, employee_signature: extraEmpSig, manager_signature: extraMgrSig },
            { onFinish: () => setExtraSubmitting(false) }
        );
    };

    // ── Extra PPE ──
    const [selectedPpe, setSelectedPpe]     = useState({});
    const [generatingPpe, setGeneratingPpe] = useState(false);

    const togglePpe = (key) =>
        setSelectedPpe(prev => {
            if (prev[key]) { const { [key]: _, ...rest } = prev; return rest; }
            return { ...prev, [key]: { quantity: checkin.ppe_items?.[key]?.quantity ?? 1, size: checkin.ppe_items?.[key]?.size ?? '' } };
        });

    const setPpeField = (key, field, value) =>
        setSelectedPpe(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

    const generatePpeForm = async () => {
        if (Object.keys(selectedPpe).length === 0) return;
        setGeneratingPpe(true);
        try {
            const res = await axios.post(route('print-forms.ppe-extras', checkin.id), { ppe_items: selectedPpe }, { responseType: 'blob' });
            window.open(URL.createObjectURL(res.data), '_blank');
        } catch { alert('Failed to generate PPE form.'); }
        finally { setGeneratingPpe(false); }
    };

    // ── Lost / Broken ──
    const [lostStep, setLostStep]           = useState('mark');
    const [lostIds, setLostIds]             = useState([]);
    const [lostCustomItems, setLostCustomItems] = useState([]);
    const [lostEmpSig, setLostEmpSig]       = useState(null);
    const [lostMgrSig, setLostMgrSig]       = useState(null);
    const [lostSubmitting, setLostSubmitting] = useState(false);

    const toggleTool    = (id) => setLostIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const addLostItem   = () => setLostCustomItems(p => [...p, { name: '', price: '' }]);
    const updateLostItem = (i, f, v) => setLostCustomItems(p => p.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
    const removeLostItem = (i) => setLostCustomItems(p => p.filter((_, idx) => idx !== i));
    const validLostItems = lostCustomItems.filter(i => i.name.trim() !== '');
    const lostTools      = tools.filter(t => lostIds.includes(t.id));
    const canContinueLost = lostIds.length > 0 || validLostItems.length > 0;

    const submitLost = () => {
        setLostSubmitting(true);
        router.post(
            route('checkins.lost-items.process', checkin.id),
            { tool_ids: lostIds, custom_items: validLostItems, employee_signature: lostEmpSig, manager_signature: lostMgrSig },
            { onFinish: () => setLostSubmitting(false) }
        );
    };

    // ── Tab button helper ──
    const tabBtn = (label, value) => (
        <button
            type="button"
            onClick={() => setTab(value)}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === value
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    // ── Sign step: Extra Items ──
    if (tab === 'extra-items' && extraStep === 'sign') {
        return (
            <AuthenticatedLayout>
                <Head title="Extra Items — Sign" />
                <div className="lg:max-w-4xl mx-auto px-6">
                    <h1 className="text-xl font-bold mb-1">Extra Items — {checkin.employee?.name}</h1>
                    <p className="text-gray-500 mb-6">Please have both parties sign below to confirm the extra items.</p>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Items</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase border-b">
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-right py-2">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {validExtraItems.map((item, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="py-2 font-medium text-gray-800">{item.name}</td>
                                        <td className="py-2 text-right text-gray-600">
                                            {item.price !== '' && item.price != null ? `€ ${parseFloat(item.price).toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        <SignaturePad label={`Signature ${checkin.employee?.name}`} onChange={setExtraEmpSig} />
                        <SignaturePad label="Signature person in charge" onChange={setExtraMgrSig} />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={submitExtras}
                            disabled={!extraEmpSig || !extraMgrSig || extraSubmitting}
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {extraSubmitting ? 'Processing…' : 'Confirm & send email'}
                        </button>
                        <button type="button" onClick={() => setExtraStep('add')}
                            className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // ── Sign step: Lost / Broken ──
    if (tab === 'lost-broken' && lostStep === 'sign') {
        return (
            <AuthenticatedLayout>
                <Head title="Lost/Broken — Sign" />
                <div className="lg:max-w-4xl mx-auto px-6">
                    <h1 className="text-xl font-bold mb-1">Lost/Broken — {checkin.employee?.name}</h1>
                    <p className="text-gray-500 mb-6">Please have both parties sign below to confirm the replacements.</p>

                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Items to be replaced</h2>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold text-gray-500 uppercase border-b">
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-left py-2">Brand</th>
                                    <th className="text-right py-2">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lostTools.map(tool => (
                                    <tr key={tool.id} className="border-b">
                                        <td className="py-2 font-medium text-gray-800">{tool.name}</td>
                                        <td className="py-2 text-gray-500">{tool.brand ?? '—'}</td>
                                        <td className="py-2 text-right text-gray-600">
                                            {tool.replacement_cost ? `€ ${parseFloat(tool.replacement_cost).toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {validLostItems.map((item, i) => (
                                    <tr key={`c-${i}`} className="border-b">
                                        <td className="py-2 font-medium text-gray-800">{item.name}</td>
                                        <td className="py-2 text-gray-400 italic">Custom</td>
                                        <td className="py-2 text-right text-gray-600">
                                            {item.price !== '' && item.price != null ? `€ ${parseFloat(item.price).toFixed(2)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 space-y-6">
                        <SignaturePad label={`Signature ${checkin.employee?.name}`} onChange={setLostEmpSig} />
                        <SignaturePad label="Signature person in charge" onChange={setLostMgrSig} />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={submitLost}
                            disabled={!lostEmpSig || !lostMgrSig || lostSubmitting}
                            className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {lostSubmitting ? 'Processing…' : 'Confirm & send email'}
                        </button>
                        <button type="button" onClick={() => setLostStep('mark')}
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
            <Head title="Lost/Broken/Extras" />
            <div className="lg:max-w-4xl mx-auto px-6">
                <h1 className="text-xl font-bold mb-1">Lost/Broken/Extras — {checkin.employee?.name}</h1>
                {checkin.toolbag?.name && <p className="text-gray-500 mb-4">Toolbag: {checkin.toolbag.name}</p>}

                {/* TAB NAV */}
                <div className="flex border-b mb-6">
                    {tabBtn('Extra items', 'extra-items')}
                    {tabBtn('Extra PPE', 'extra-ppe')}
                    {tabBtn('Lost / Broken', 'lost-broken')}
                </div>

                {/* ── EXTRA ITEMS TAB ── */}
                {tab === 'extra-items' && (
                    <>
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Extra items</h2>
                            <p className="text-sm text-gray-500 mb-4">Add any extra items being issued to the employee.</p>
                            {extraItems.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {extraItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input type="text" placeholder="Item name" value={item.name}
                                                onChange={e => updateExtraItem(i, 'name', e.target.value)}
                                                className="border rounded px-3 py-2 flex-1" />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                                                <input type="number" placeholder="Price" min="0" step="0.01" value={item.price}
                                                    onChange={e => updateExtraItem(i, 'price', e.target.value)}
                                                    className="border rounded pl-7 pr-3 py-2 w-28" />
                                            </div>
                                            <button type="button" onClick={() => removeExtraItem(i)}
                                                className="text-red-500 hover:text-red-700 px-2 py-1 text-lg leading-none">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button type="button" onClick={addExtraItem}
                                className="px-4 py-2 text-sm border border-dashed border-gray-300 text-gray-600 rounded hover:bg-gray-50 w-full">
                                + Add item
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setExtraStep('sign')}
                                disabled={validExtraItems.length === 0}
                                className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed">
                                Continue to signing
                            </button>
                            <Link href={route('checkins.index')} className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50">
                                Cancel
                            </Link>
                        </div>
                    </>
                )}

                {/* ── EXTRA PPE TAB ── */}
                {tab === 'extra-ppe' && (
                    <>
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <p className="text-sm text-gray-600 mb-5">
                                Select the PPE items to issue. Quantities and sizes are pre-filled from the checkin where available.
                            </p>
                            <div className="space-y-3">
                                {PPE_ITEMS.map(({ key, label }) => {
                                    const checked = !!selectedPpe[key];
                                    return (
                                        <div key={key} className={`border rounded px-4 py-3 transition-colors ${checked ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={checked} onChange={() => togglePpe(key)}
                                                    className="w-5 h-5 accent-blue-600 shrink-0" />
                                                <span className={`font-medium w-44 shrink-0 ${checked ? 'text-blue-800' : 'text-gray-700'}`}>{label}</span>
                                                {checked && (
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-xs text-gray-500 whitespace-nowrap">Qty</label>
                                                            <input type="number" min="1" value={selectedPpe[key].quantity}
                                                                onChange={e => setPpeField(key, 'quantity', parseInt(e.target.value) || 1)}
                                                                className="border rounded px-2 py-1 w-16 text-sm" />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <label className="text-xs text-gray-500 whitespace-nowrap">Size</label>
                                                            <input type="text" value={selectedPpe[key].size}
                                                                onChange={e => setPpeField(key, 'size', e.target.value)}
                                                                className="border rounded px-2 py-1 w-20 text-sm" placeholder="e.g. M" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={generatePpeForm}
                                disabled={Object.keys(selectedPpe).length === 0 || generatingPpe}
                                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                {generatingPpe ? 'Generating…' : 'Generate PPE Form'}
                            </button>
                            <Link href={route('checkins.index')} className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50">
                                Cancel
                            </Link>
                        </div>
                    </>
                )}

                {/* ── LOST / BROKEN TAB ── */}
                {tab === 'lost-broken' && (
                    <>
                        {tools.length > 0 ? (
                            <div className="bg-white rounded-lg shadow p-6 mb-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Check the tools that are <strong>lost or broken</strong>. The employee will receive a new unit from inventory.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {tools.map(tool => {
                                        const isLost  = lostIds.includes(tool.id);
                                        const noStock = tool.amount_in_stock <= 0;
                                        return (
                                            <div key={tool.id} onClick={() => toggleTool(tool.id)}
                                                className={`border rounded px-4 py-3 cursor-pointer transition-colors select-none ${isLost ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                                <div className="flex items-start gap-3">
                                                    <input type="checkbox" checked={isLost} onChange={() => toggleTool(tool.id)}
                                                        onClick={e => e.stopPropagation()}
                                                        className="w-5 h-5 accent-red-600 mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium truncate ${isLost ? 'line-through text-red-700' : 'text-gray-800'}`}>{tool.name}</p>
                                                        <p className="text-xs text-gray-500">{[tool.brand, tool.type].filter(Boolean).join(' • ')}</p>
                                                        <p className={`text-xs mt-1 ${noStock ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                                            {noStock ? 'No stock available' : `In stock: ${tool.amount_in_stock}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 pt-3 border-t text-sm text-gray-500">
                                    {lostIds.length === 0
                                        ? 'No tools marked as lost or broken.'
                                        : `${lostIds.length} tool${lostIds.length > 1 ? 's' : ''} marked as lost/broken.`}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 mb-4 text-sm text-gray-400 text-center py-8">
                                No toolbag linked to this checkin.
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Custom items</h2>
                            <p className="text-sm text-gray-500 mb-4">Add any additional lost or broken items not in the toolbag.</p>
                            {lostCustomItems.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {lostCustomItems.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input type="text" placeholder="Item name" value={item.name}
                                                onChange={e => updateLostItem(i, 'name', e.target.value)}
                                                className="border rounded px-3 py-2 flex-1" />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                                                <input type="number" placeholder="Price" min="0" step="0.01" value={item.price}
                                                    onChange={e => updateLostItem(i, 'price', e.target.value)}
                                                    className="border rounded pl-7 pr-3 py-2 w-28" />
                                            </div>
                                            <button type="button" onClick={() => removeLostItem(i)}
                                                className="text-red-500 hover:text-red-700 px-2 py-1 text-lg leading-none">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button type="button" onClick={addLostItem}
                                className="px-4 py-2 text-sm border border-dashed border-gray-300 text-gray-600 rounded hover:bg-gray-50 w-full">
                                + Add custom item
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setLostStep('sign')}
                                disabled={!canContinueLost}
                                className="px-6 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed">
                                Continue to signing
                            </button>
                            <Link href={route('checkins.index')} className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50">
                                Cancel
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
