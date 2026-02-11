import React from 'react';
import {
    HiPencilSquare,
    HiTrash,
    HiPlusCircle,
    HiMinusCircle
} from "react-icons/hi2";
import { Link, router } from '@inertiajs/react';

export default function ToolActionButtons({ row, canDelete = false }) {

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this tool?")) {
            router.delete(route("tools.destroy", id));
        }
    };

    const handleIncrement = (id) => {
        router.patch(route("tools.incrementStock", id));
    };

    const handleDecrement = (id) => {
        router.patch(route("tools.decrementStock", id));
    };

    return (
        <div className="flex items-center gap-3">

            {/* EDIT */}
            <Link
                href={route("tools.edit", row.id)}
                className="text-yellow-600 hover:text-yellow-800"
                title="Bewerken"
            >
                <HiPencilSquare className="text-3xl" />
            </Link>

            {/* DELETE */}
            {canDelete && (
                <button
                    onClick={() => handleDelete(row.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Verwijderen"
                >
                    <HiTrash className="text-3xl" />
                </button>
            )}

            {/* STOCK MINUS */}
            <button
                onClick={() => handleDecrement(row.id)}
                className="text-gray-600 hover:text-gray-800"
                title="Voorraad verminderen"
            >
                <HiMinusCircle className="text-3xl" />
            </button>

            {/* STOCK PLUS */}
            <button
                onClick={() => handleIncrement(row.id)}
                className="text-green-600 hover:text-green-800"
                title="Voorraad verhogen"
            >
                <HiPlusCircle className="text-3xl" />
            </button>
        </div>
    );
}
