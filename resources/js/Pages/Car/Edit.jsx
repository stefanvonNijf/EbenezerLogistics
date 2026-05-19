import React from 'react';
import { useForm, Link, Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function CarEdit() {
    const { car, employees } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        brand: car.brand ?? '',
        license_plate: car.license_plate ?? '',
        employee_id: car.employee_id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('cars.update', car.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Car" />

            <div className="lg:max-w-2xl mx-auto px-6 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold mb-6">Edit Car</h1>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="font-medium">Brand</label>
                        <input
                            type="text"
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                        {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand}</p>}
                    </div>

                    <div>
                        <label className="font-medium">License plate</label>
                        <input
                            type="text"
                            value={data.license_plate}
                            onChange={(e) => setData('license_plate', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                        />
                        {errors.license_plate && <p className="text-red-600 text-sm mt-1">{errors.license_plate}</p>}
                    </div>

                    <div>
                        <label className="font-medium">Assigned to <span className="text-gray-400 font-normal">(optional)</span></label>
                        <select
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="border rounded px-3 py-2 w-full mt-1"
                        >
                            <option value="">— Not assigned —</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                        {errors.employee_id && <p className="text-red-600 text-sm mt-1">{errors.employee_id}</p>}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                        >
                            Save changes
                        </button>
                        <Link
                            href={route('cars.index')}
                            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
