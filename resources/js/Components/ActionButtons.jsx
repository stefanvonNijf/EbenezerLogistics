import React, { useState } from 'react';
import {
    HiPencilSquare,
    HiTrash,
    HiPlusCircle,
    HiMinusCircle
} from "react-icons/hi2";
import { Link, router } from '@inertiajs/react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function ToolActionButtons({ row, canDelete = false }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        router.delete(route("tools.destroy", row.id), {
            onSuccess: () => setShowDeleteModal(false),
        });
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
                title="Edit"
            >
                <HiPencilSquare className="text-3xl" />
            </Link>

            {/* DELETE */}
            {canDelete && (
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                >
                    <HiTrash className="text-3xl" />
                </button>
            )}

            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                name={row.name}
            />

            {/* STOCK MINUS */}
            <button
                onClick={() => handleDecrement(row.id)}
                className="text-gray-600 hover:text-gray-800"
                title="Decrease stock -1"
            >
                <HiMinusCircle className="text-3xl" />
            </button>

            {/* STOCK PLUS */}
            <button
                onClick={() => handleIncrement(row.id)}
                className="text-green-600 hover:text-green-800"
                title="Increase stock +1"
            >
                <HiPlusCircle className="text-3xl" />
            </button>
        </div>
    );
}
