import React, { useState, useRef } from "react";
import SignaturePad from "@/Components/SignaturePad.jsx";

export default function SignatureModal({ open, employeeName, onConfirm, onClose }) {
    const [employeeSig, setEmployeeSig] = useState(null);
    const [managerSig, setManagerSig] = useState(null);
    const managerSigRef = useRef(null);

    if (!open) return null;

    const handleConfirm = () => {
        onConfirm({ employeeSignature: employeeSig, managerSignature: managerSig });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl mx-4">
                <h2 className="text-lg font-semibold mb-4">Sign Check-in Contract</h2>

                <div className="space-y-5">
                    <SignaturePad
                        label={`Signature ${employeeName}`}
                        onChange={setEmployeeSig}
                        onNext={() => managerSigRef.current?.openFullscreen()}
                    />
                    <SignaturePad
                        ref={managerSigRef}
                        label="Signature person in charge"
                        onChange={setManagerSig}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!employeeSig || !managerSig}
                        className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Confirm &amp; Export PDF
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 border rounded text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
