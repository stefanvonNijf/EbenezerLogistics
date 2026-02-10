import React, { useState } from 'react';
import { usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table.jsx';

export default function CarIndex() {
    const { cars } = usePage().props;

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [search, setSearch] = useState('');
    const normalize = (str) =>
        (str ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const categories = ['all', 'available', 'in use'];

    const normalizedSearch = normalize(search);

    const filteredData = cars.filter(car => {
        const carStatus = car.employee_id ? 'in use' : 'available';

        const matchesCategory =
            categoryFilter === 'all' ||
            carStatus === categoryFilter;

        const matchesSearch =
            normalize(car.brand).includes(normalizedSearch) ||
            normalize(car.license_plate).includes(normalizedSearch);

        return matchesCategory && matchesSearch;
    });



    const columns = [
        { header: 'Brand', accessor: 'brand' },
        { header: 'License', accessor: 'license_plate' },
        { header: 'Status', render: (row) => row.employee_id ? "In use" : "Available" },
    ];


    return (
        <AuthenticatedLayout
            header={
                <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between py-6">
                        <h1 className="text-xl font-bold">Cars</h1>
                    </div>
                </div>
            }
        >
            <Head title="Cars" />

            <div className="lg:max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">

                <div className="max-w-full mx-auto">


                    <div className="mb-6">
                        <Link
                            href={route("cars.create")}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 whitespace-nowrap"
                        >
                            Add new car
                        </Link>
                    </div>

                    {/* FILTERS */}
                    <div className="w-11/12 flex flex-wrap items-center gap-3 mb-6">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium border
                                    transition-all duration-150
                                    ${
                                    categoryFilter === cat
                                        ? "bg-gray-300 border-[#014489]"
                                        : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-200"
                                }
                                `}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}

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

        </AuthenticatedLayout>
    );
}
