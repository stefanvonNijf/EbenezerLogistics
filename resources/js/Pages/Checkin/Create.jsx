import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, usePage, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SignaturePad from "@/Components/SignaturePad";

const TYPE_TOOLBAG  = 'toolbag';
const TYPE_CAR      = 'car';
const TYPE_CUSTOM   = 'custom';
const TYPE_PPE      = 'ppe';
const TYPE_TEMPLATE = 'template';

// Maps employee roles that don't directly match a toolbag type.
// null means "show all toolbags".
const ROLE_TO_TOOLBAG_TYPE = {
    electrician_foreman: 'electrician',
    ironworker_foreman:  'ironworker',
    technician:          null,
    supervisor:          null,
};

export default function Create() {
    const { employees, toolbags, cars, documents, toolboxTemplates, takenCheckinTypes } = usePage().props;

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEmployee = urlParams.get('employee_id') || "";

    const PPE_ITEMS = [
        { key: 'goggles',      label: 'GOGGLES' },
        { key: 'gloves',       label: 'GLOVES' },
        { key: 'rain_jacket',  label: 'RAIN JACKET' },
        { key: 'inner_jacket', label: 'INNER JACKET (Lining)' },
        { key: 'rain_pants',   label: 'RAIN PANTS' },
        { key: 'overalls',     label: 'COVERALLS' },
        { key: 'boots',        label: 'BOOTS' },
        { key: 'helmet',       label: 'HELMET' },
    ];

    const PPE_SIZE_MAP = {
        rain_jacket:  'jacket_size',
        inner_jacket: 'jacket_size',
        rain_pants:   'pants_size',
        overalls:     'coverall_size',
        boots:        'shoe_size',
    };

    const employeeSizeForPpe = (employee, key) => employee?.[PPE_SIZE_MAP[key]] || '';

    const defaultPpeItems = (employee = null) => Object.fromEntries(
        PPE_ITEMS.map(({ key }) => [key, { quantity: 1, size: employeeSizeForPpe(employee, key), notes: '' }])
    );

    const form = useForm({
        employee_id:          preselectedEmployee,
        toolbag_id:           "",
        car_id:               "",
        checkin_mileage:      "",
        checkin_date:         "",
        notes:                "",
        notification_emails:  [],
        is_custom:            false,
        is_car:               false,
        is_ppe:               false,
        is_template:          false,
        toolbox_template_id:  "",
        custom_items:         [],
        document_ids:         [],
        ppe_items:            defaultPpeItems(),
        pdf:                  null,
    });
    const { data, setData, processing, errors } = form;

    // Multi-step state
    const [step, setStep] = useState(1);
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig]   = useState(null);
    const [signing, setSigning]         = useState(false);
    const [serverErrors, setServerErrors] = useState({});

    const pdfInputRef = useRef(null);

    const selectedEmployee = useMemo(
        () => employees.find(e => e.id === Number(data.employee_id)),
        [data.employee_id, employees]
    );

    const setPpe = (key, field, value) =>
        setData('ppe_items', { ...data.ppe_items, [key]: { ...data.ppe_items[key], [field]: value } });

    const [ppeSectionEnabled, setPpeSectionEnabled] = useState(false);
    const [ppeChecked, setPpeChecked] = useState(
        Object.fromEntries(PPE_ITEMS.map(({ key }) => [key, false]))
    );

    const getFilteredPpeItems = () => {
        if (!ppeSectionEnabled) return {};
        return Object.fromEntries(
            PPE_ITEMS.filter(({ key }) => ppeChecked[key]).map(({ key }) => [key, data.ppe_items[key]])
        );
    };

    const [type, setType] = useState(TYPE_TOOLBAG);

    useEffect(() => {
        const employee = employees.find(e => e.id === Number(data.employee_id));
        const taken = (takenCheckinTypes ?? {})[data.employee_id] ?? [];

        setData(prev => {
            const newType = taken.includes(type)
                ? ([TYPE_TOOLBAG, TYPE_CAR, TYPE_CUSTOM, TYPE_PPE, TYPE_TEMPLATE].find(t => !taken.includes(t)) ?? type)
                : type;

            return {
                ...prev,
                is_custom:    newType === TYPE_CUSTOM,
                is_car:       newType === TYPE_CAR,
                is_ppe:       newType === TYPE_PPE,
                is_template:  newType === TYPE_TEMPLATE,
                ppe_items: Object.fromEntries(
                    PPE_ITEMS.map(({ key }) => [
                        key,
                        { ...prev.ppe_items[key], size: employeeSizeForPpe(employee, key) },
                    ])
                ),
            };
        });
    }, [data.employee_id]);

    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");
    const [itemName, setItemName]     = useState("");
    const [itemCost, setItemCost]     = useState("");
    const [docSearch, setDocSearch]   = useState("");

    const switchType = (newType) => {
        setType(newType);
        setData(prev => ({
            ...prev,
            is_custom:           newType === TYPE_CUSTOM,
            is_car:              newType === TYPE_CAR,
            is_ppe:              newType === TYPE_PPE,
            is_template:         newType === TYPE_TEMPLATE,
            toolbag_id:          "",
            car_id:              "",
            checkin_mileage:     "",
            toolbox_template_id: "",
            custom_items:        [],
            pdf:                 null,
        }));
        if (newType !== TYPE_PPE && pdfInputRef.current) {
            pdfInputRef.current.value = '';
        }
    };

    const filteredToolbags = useMemo(() => {
        if (!data.employee_id) return [];
        const employee = employees.find(e => e.id === Number(data.employee_id));
        if (!employee) return [];
        const role = employee.role;
        const toolbagType = Object.hasOwn(ROLE_TO_TOOLBAG_TYPE, role)
            ? ROLE_TO_TOOLBAG_TYPE[role]
            : role;
        if (toolbagType === null) return toolbags;
        return toolbags.filter(tb => tb.type === toolbagType);
    }, [data.employee_id, employees, toolbags]);

    const addEmail = () => {
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed) return;
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        if (!valid) { setEmailError("Enter a valid email address."); return; }
        if (data.notification_emails.includes(trimmed)) { setEmailError("Already added."); return; }
        setData("notification_emails", [...data.notification_emails, trimmed]);
        setEmailInput(""); setEmailError("");
    };

    const removeEmail = (email) =>
        setData("notification_emails", data.notification_emails.filter(e => e !== email));

    const handleEmailKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } };

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
        documents.filter(d => d.name.toLowerCase().includes(docSearch.toLowerCase())),
        [documents, docSearch]
    );

    // PPE type: single step submit via Inertia (has file upload)
    const handlePpeSubmit = (e) => {
        e.preventDefault();
        form.transform(d => ({ ...d, ppe_items: getFilteredPpeItems() })).post(route("checkins.store"));
    };

    // Non-PPE step 1 → step 2
    const handleNextStep = (e) => {
        e.preventDefault();
        setServerErrors({});
        setStep(2);
    };

    // Step 2: submit everything + signatures via axios, open signed PDF
    const handleSignAndSubmit = async () => {
        if (!employeeSig || !managerSig || signing) return;
        setSigning(true);
        setServerErrors({});

        try {
            const res = await axios.post(route('checkins.store'), {
                employee_id:          data.employee_id,
                checkin_date:         data.checkin_date,
                notes:                data.notes,
                is_car:               data.is_car,
                is_custom:            data.is_custom,
                is_ppe:               false,
                is_template:          data.is_template,
                toolbag_id:           data.toolbag_id || null,
                car_id:               data.car_id || null,
                checkin_mileage:      data.checkin_mileage || null,
                toolbox_template_id:  data.toolbox_template_id || null,
                custom_items:         data.custom_items,
                ppe_items:            getFilteredPpeItems(),
                notification_emails:  data.notification_emails,
                document_ids:         data.document_ids,
                employee_signature:   employeeSig,
                manager_signature:    managerSig,
            });

            if (res.data.url) {
                window.open(res.data.url, '_blank');
            }
            router.visit(route('checkins.index'));
        } catch (err) {
            if (err.response?.status === 422) {
                setServerErrors(err.response.data.errors || {});
                setStep(1);
            } else {
                alert('Something went wrong. Please try again.');
            }
        } finally {
            setSigning(false);
        }
    };

    const takenTypes = (takenCheckinTypes ?? {})[data.employee_id] ?? [];

    const typeBtn = (label, value) => {
        const taken = takenTypes.includes(value);
        return (
            <button
                type="button"
                onClick={() => !taken && switchType(value)}
                disabled={taken}
                title={taken ? `Already checked in with ${value}` : undefined}
                className={`px-4 py-2 text-sm rounded border transition-colors ${
                    taken
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : type === value
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                {label}
            </button>
        );
    };

    const showPpe = type !== TYPE_CAR;

    // Merge Inertia form errors with axios server errors
    const getError = (field) => errors[field] || serverErrors[field]?.[0] || null;

    return (
        <AuthenticatedLayout>
            <Head title="New Check-in" />

            <div className="max-w-3xl mx-auto mt-4 p-6 bg-white shadow rounded-lg">
                <h1 className="text-xl font-bold mb-4">New Check-in</h1>

                {/* Step indicator — not shown for PPE (single step) */}
                {type !== TYPE_PPE && (
                    <div className="flex items-center gap-2 mb-6 text-sm">
                        <span className={step === 1 ? 'font-semibold text-blue-700' : 'text-gray-400'}>
                            1  Details
                        </span>
                        <span className="text-gray-300">→</span>
                        <span className={step === 2 ? 'font-semibold text-blue-700' : 'text-gray-400'}>
                            2  Signing
                        </span>
                    </div>
                )}

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <form onSubmit={type === TYPE_PPE ? handlePpeSubmit : handleNextStep} className="space-y-6">

                        {/* Server-side errors from a failed step-2 submission */}
                        {Object.keys(serverErrors).length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                                <p className="font-medium mb-1">Please fix the following and try again:</p>
                                <ul className="list-disc ml-4 space-y-0.5">
                                    {Object.entries(serverErrors).flatMap(([, msgs]) =>
                                        msgs.map((m, i) => <li key={i}>{m}</li>)
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* EMPLOYEE */}
                        <div>
                            <label className="block font-medium">Employee</label>
                            <select
                                value={data.employee_id}
                                onChange={(e) => setData("employee_id", e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">-- Select employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.role})
                                    </option>
                                ))}
                            </select>
                            {getError('employee_id') && <div className="text-red-600 text-sm">{getError('employee_id')}</div>}
                        </div>

                        {/* TYPE SELECTOR */}
                        <div>
                            <label className="block font-medium mb-2">Type</label>
                            <div className="flex gap-2 flex-wrap">
                                {typeBtn('Toolbag', TYPE_TOOLBAG)}
                                {typeBtn('Car', TYPE_CAR)}
                                {typeBtn('Custom items', TYPE_CUSTOM)}
                                {typeBtn('PDF Upload', TYPE_PPE)}
                                {typeBtn('Template', TYPE_TEMPLATE)}
                            </div>
                        </div>

                        {/* TOOLBAG */}
                        {type === TYPE_TOOLBAG && (
                            <div>
                                <label className="block font-medium">Assign toolbag</label>
                                <select
                                    value={data.toolbag_id}
                                    onChange={(e) => setData("toolbag_id", e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    disabled={!data.employee_id}
                                >
                                    <option value="">-- Select toolbag --</option>
                                    {filteredToolbags.length === 0 && data.employee_id && (
                                        <option disabled>No toolbags available for this role</option>
                                    )}
                                    {filteredToolbags.map(tb => (
                                        <option key={tb.id} value={tb.id}>{tb.name} ({tb.type})</option>
                                    ))}
                                </select>
                                {getError('toolbag_id') && <div className="text-red-600 text-sm">{getError('toolbag_id')}</div>}
                            </div>
                        )}

                        {/* CAR */}
                        {type === TYPE_CAR && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium">Assign car</label>
                                    <select
                                        value={data.car_id}
                                        onChange={(e) => setData("car_id", e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="">-- Select car --</option>
                                        {cars.length === 0 && <option disabled>No cars available</option>}
                                        {cars.map(car => (
                                            <option key={car.id} value={car.id}>
                                                {car.brand} — {car.license_plate}
                                            </option>
                                        ))}
                                    </select>
                                    {getError('car_id') && <div className="text-red-600 text-sm">{getError('car_id')}</div>}
                                </div>
                                <div>
                                    <label className="block font-medium">Mileage at check-in (optional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.checkin_mileage}
                                        onChange={(e) => setData("checkin_mileage", e.target.value)}
                                        placeholder="e.g. 45000"
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    {getError('checkin_mileage') && <div className="text-red-600 text-sm">{getError('checkin_mileage')}</div>}
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
                                {getError('custom_items') && <p className="text-red-600 text-sm mt-1">{getError('custom_items')}</p>}
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

                        {/* PPE / DOCUMENT — PDF upload (single-step type) */}
                        {type === TYPE_PPE && (
                            <div>
                                <label className="block font-medium mb-1">Upload signed document (PDF)</label>
                                <p className="text-sm text-gray-500 mb-2">Upload the signed PPE / document PDF for this check-in.</p>
                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setData('pdf', e.target.files[0] || null)}
                                    className="block w-full text-sm text-gray-600
                                        file:mr-4 file:py-2 file:px-4 file:rounded file:border-0
                                        file:text-sm file:bg-gray-100 file:text-gray-700
                                        hover:file:bg-gray-200"
                                />
                                {getError('pdf') && <p className="text-red-600 text-sm mt-1">{getError('pdf')}</p>}
                            </div>
                        )}

                        {/* TEMPLATE */}
                        {type === TYPE_TEMPLATE && (
                            <div>
                                <label className="block font-medium">Toolbox template</label>
                                <select
                                    value={data.toolbox_template_id}
                                    onChange={(e) => setData("toolbox_template_id", e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">-- Select a template --</option>
                                    {(toolboxTemplates ?? []).length === 0 && (
                                        <option disabled>No templates available — upload one on the Documents page</option>
                                    )}
                                    {(toolboxTemplates ?? []).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                {getError('toolbox_template_id') && <div className="text-red-600 text-sm">{getError('toolbox_template_id')}</div>}
                            </div>
                        )}

                        {/* CHECK-IN DATE */}
                        <div>
                            <label className="block font-medium">Check-in date</label>
                            <input type="date" className="w-full border rounded px-3 py-2" value={data.checkin_date} onChange={(e) => setData("checkin_date", e.target.value)} />
                            {getError('checkin_date') && <div className="text-red-600 text-sm">{getError('checkin_date')}</div>}
                        </div>

                        {/* PPE ITEMS */}
                        {showPpe && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="ppe-section-toggle"
                                        checked={ppeSectionEnabled}
                                        onChange={() => setPpeSectionEnabled(v => !v)}
                                        className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                                    />
                                    <label htmlFor="ppe-section-toggle" className="font-medium cursor-pointer">PPE</label>
                                </div>
                                {ppeSectionEnabled && <div className="border rounded overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 w-8"></th>
                                                <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                                                <th className="text-left px-3 py-2 font-medium text-gray-600 w-16">Qty</th>
                                                <th className="text-left px-3 py-2 font-medium text-gray-600 w-24">Size</th>
                                                <th className="text-left px-3 py-2 font-medium text-gray-600">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {PPE_ITEMS.map(({ key, label }) => {
                                                const isChecked = ppeChecked[key];
                                                return (
                                                    <tr key={key} className={!isChecked ? 'bg-gray-50' : ''}>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => setPpeChecked(prev => ({ ...prev, [key]: !prev[key] }))}
                                                                className="rounded border-gray-300"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700">{label}</td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                required={isChecked}
                                                                disabled={!isChecked}
                                                                value={data.ppe_items[key].quantity}
                                                                onChange={(e) => setPpe(key, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                                className="w-14 border rounded px-2 py-1 text-center disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                required={isChecked}
                                                                disabled={!isChecked}
                                                                value={data.ppe_items[key].size}
                                                                onChange={(e) => setPpe(key, 'size', e.target.value)}
                                                                placeholder="—"
                                                                className="w-20 border rounded px-2 py-1 disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="text"
                                                                disabled={!isChecked}
                                                                value={data.ppe_items[key].notes}
                                                                onChange={(e) => setPpe(key, 'notes', e.target.value)}
                                                                placeholder="—"
                                                                className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>}
                            </div>
                        )}

                        {/* NOTES */}
                        <div>
                            <label className="block font-medium">Notes</label>
                            <textarea className="w-full border rounded px-3 py-2" value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
                            {getError('notes') && <div className="text-red-600 text-sm">{getError('notes')}</div>}
                        </div>

                        {/* NOTIFICATION EMAILS */}
                        <div>
                            <label className="block font-medium mb-1">Notify by email</label>
                            <p className="text-sm text-gray-500 mb-2">Add email addresses that will receive a notification when this check-in is saved.</p>
                            <div className="flex gap-2">
                                <input type="text" value={emailInput} onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }} onKeyDown={handleEmailKeyDown} placeholder="name@example.com" className="flex-1 border rounded px-3 py-2 text-sm" />
                                <button type="button" onClick={addEmail} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm">Add</button>
                            </div>
                            {emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
                            {getError('notification_emails') && <p className="text-red-600 text-sm mt-1">{getError('notification_emails')}</p>}
                            {data.notification_emails.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {data.notification_emails.map(email => (
                                        <span key={email} className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-full px-3 py-1">
                                            {email}
                                            <button type="button" onClick={() => removeEmail(email)} className="text-blue-400 hover:text-red-500 font-bold ml-1">&times;</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DOCUMENTS — hidden for PPE/document type */}
                        {type !== TYPE_PPE && documents.length > 0 && (
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

                        {/* BUTTONS */}
                        <div className="flex justify-between">
                            <Link href={route("checkins.index")} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                            >
                                {type === TYPE_PPE ? 'Save Check-in' : 'Next: Signing →'}
                            </button>
                        </div>

                    </form>
                )}

                {/* ── STEP 2: SIGNING ── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500">
                            Both parties sign below to confirm the check-in of{' '}
                            <span className="font-medium text-gray-800">{selectedEmployee?.name ?? 'the employee'}</span>.
                        </p>

                        <SignaturePad
                            label={`Signature — ${selectedEmployee?.name ?? 'employee'}`}
                            onChange={setEmployeeSig}
                        />
                        <SignaturePad
                            label="Signature — person in charge"
                            onChange={setManagerSig}
                        />

                        <div className="flex justify-between pt-2">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setEmployeeSig(null); setManagerSig(null); }}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={handleSignAndSubmit}
                                disabled={!employeeSig || !managerSig || signing}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {signing ? 'Saving…' : 'Save & Export PDF'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
