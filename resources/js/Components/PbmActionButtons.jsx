import React, { useState } from 'react';
import { HiPencilSquare, HiTrash, HiPlusCircle, HiMinusCircle } from 'react-icons/hi2';
import { Link, router } from '@inertiajs/react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function PbmActionButtons({ row, canDelete = false }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        router.delete(route('pbm.destroy', row.id), {
            onSuccess: () => setShowDeleteModal(false),
        });
    };

    return (
        <div className="flex items-center gap-3">
            <Link href={route('pbm.edit', row.id)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                <HiPencilSquare className="text-3xl" />
            </Link>

            {canDelete && (
                <button onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:text-red-800" title="Delete">
                    <HiTrash className="text-3xl" />
                </button>
            )}

            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                name={row.name}
            />

            <button onClick={() => router.patch(route('pbm.decrementStock', row.id))} className="text-gray-600 hover:text-gray-800" title="Decrease stock -1">
                <HiMinusCircle className="text-3xl" />
            </button>

            <button onClick={() => router.patch(route('pbm.incrementStock', row.id))} className="text-green-600 hover:text-green-800" title="Increase stock +1">
                <HiPlusCircle className="text-3xl" />
            </button>
        </div>
    );
}
