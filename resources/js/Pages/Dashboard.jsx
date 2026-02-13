import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';

const statusConfig = {
    planned_checkin:  { label: 'Planned checkin',  bg: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-300' },
    planned_checkout: { label: 'Checked in',       bg: 'bg-blue-100 text-blue-800',     border: 'border-blue-300' },
};

export default function Dashboard() {
    const { plannedCheckins = [] } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold">Dashboard</h1>
                    </div>
                    {plannedCheckins.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Planned checkins / checkouts</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {plannedCheckins.map((checkin) => {
                                    const config = statusConfig[checkin.status] || statusConfig.planned_checkin;
                                    return (
                                        <div
                                            key={checkin.id}
                                            className={`p-4 bg-white rounded-lg shadow border-l-4 ${config.border}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-800">
                                                    {checkin.employee?.name || 'Unknown'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Date: {checkin.checkin_date}
                                            </p>
                                            {checkin.notes && (
                                                <p className="text-sm text-gray-500 mt-1 truncate" title={checkin.notes}>
                                                    {checkin.notes}
                                                </p>
                                            )}
                                            {checkin.status === 'planned_checkin' && (
                                                <Link
                                                    href={route("checkins.create") + `?employee_id=${checkin.employee_id}`}
                                                    className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                                                >
                                                    Check in now
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
