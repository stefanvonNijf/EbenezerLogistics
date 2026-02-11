import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ConfirmDeleteModal({ show, onClose, onConfirm, name = '' }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    Delete {name ? `"${name}"` : 'item'}?
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    This action cannot be undone. Are you sure you want to permanently delete this item?
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>
                        Cancel
                    </SecondaryButton>

                    <DangerButton onClick={onConfirm}>
                        Delete
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
