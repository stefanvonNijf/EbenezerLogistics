import React, { useState } from 'react';
import { usePage, Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

const statusConfig = {
    planned_checkin:  { label: 'Planned checkin',  bg: 'bg-yellow-100 text-yellow-800' },
    planned_checkout: { label: 'Checked in',       bg: 'bg-blue-100 text-blue-800' },
    checked_out:      { label: 'Checked out',      bg: 'bg-green-100 text-green-800' },
};

function StatusBadge({ status }) {
    const config = statusConfig[status];
    if (!config) return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">No plan</span>;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg}`}>{config.label}</span>;
}

export default function EmployeeIndex() {
    const { employees, auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [planModal, setPlanModal] = useState(null);
    const [checkoutTarget, setCheckoutTarget] = useState(null);

    const planForm = useForm({ checkin_date: '', notes: '' });

    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const normalizedSearch = normalize(search);

    const filteredData = employees.filter(employee => {
        const status = employee.latest_checkin?.status;
        const statusLabel = statusConfig[status]?.label ?? 'No plan';
        return (
            normalize(employee.name).includes(normalizedSearch) ||
            normalize(employee.employee_number).includes(normalizedSearch) ||
            normalize(employee.role).includes(normalizedSearch) ||
            normalize(statusLabel).includes(normalizedSearch)
        );
    });

    const handleDelete = () => {
        router.delete(route('employees.destroy', deleting.id), {
            onSuccess: () => setDeleting(null),
        });
    };

    const handlePlanSubmit = (e) => {
        e.preventDefault();
        planForm.post(route('employees.planCheckin', planModal.id), {
            onSuccess: () => {
                setPlanModal(null);
                planForm.reset();
            },
        });
    };

    const handleCheckout = () => {
        router.get(route('checkins.checkout', checkoutTarget.latest_checkin.id), {}, {
            onSuccess: () => setCheckoutTarget(null),
        });
    };

    const columns = [
        {
            header: 'Name',
            render: (row) => (
                <Link
                    href={route("employees.edit", row.id)}
                    className="text-blue-600 hover:underline"
                >
                    {row.name}
                </Link>
            )
        },
        { header: 'Employee Nr', render: (row) => row.employee_number || '-' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.latest_checkin?.status} />
        },
        {
            header: 'Actions',
            render: (row) => {
                const status = row.latest_checkin?.status;
                return (
                    <div className="flex gap-2 items-center">
                        {/* Plan checkin: admin only, when no plan or checked_out */}
                        {isAdmin && (!status || status === 'checked_out') && (
                            <button
                                onClick={() => setPlanModal(row)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            >
                                Plan checkin
                            </button>
                        )}

                        {/* Check in: when planned_checkin */}
                        {status === 'planned_checkin' && (
                            <Link
                                href={route("checkins.create") + `?employee_id=${row.id}`}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                                Check in
                            </Link>
                        )}

                        {/* Check out: when planned_checkout */}
                        {status === 'planned_checkout' && (
                            <button
                                onClick={() => setCheckoutTarget(row)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                                Check out
                            </button>
                        )}

                        {/* Delete: admin only */}
                        {isAdmin && (
                            <button
                                onClick={() => setDeleting(row)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                );
            }
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Employees</h1>
                    </div>
                </div>
            }
        >
            <Head title="Employees" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">

                    <div className="mb-6">
                        <Link
                            href={route("employees.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new employee
                        </Link>
                    </div>

                    {/* SEARCH */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <input
                            type="text"
                            placeholder="Search on keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={filteredData} />
                    </div>

                </div>

            </div>

            {/* DELETE MODAL */}
            <ConfirmDeleteModal
                show={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                name={deleting?.name}
            />

            {/* PLAN CHECKIN MODAL */}
            {planModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            Plan checkin for {planModal.name}
                        </h3>
                        <form onSubmit={handlePlanSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium text-sm mb-1">Date</label>
                                <input
                                    type="date"
                                    value={planForm.data.checkin_date}
                                    onChange={(e) => planForm.setData('checkin_date', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                                {planForm.errors.checkin_date && (
                                    <div className="text-red-600 text-sm">{planForm.errors.checkin_date}</div>
                                )}
                            </div>
                            <div>
                                <label className="block font-medium text-sm mb-1">Notes</label>
                                <textarea
                                    value={planForm.data.notes}
                                    onChange={(e) => planForm.setData('notes', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                />
                                {planForm.errors.notes && (
                                    <div className="text-red-600 text-sm">{planForm.errors.notes}</div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setPlanModal(null); planForm.reset(); }}
                                    className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={planForm.processing}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CHECKOUT CONFIRMATION MODAL */}
            {checkoutTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Confirm checkout?</h3>
                        <p className="text-gray-700 mb-4">
                            <span className="font-medium">{checkoutTarget.name}</span>
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCheckoutTarget(null)}
                                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
