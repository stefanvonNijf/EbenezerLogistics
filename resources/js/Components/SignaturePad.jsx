import React, { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ label, onChange }) {
    const padRef = useRef(null);

    const handleEnd = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            onChange(padRef.current.getTrimmedCanvas().toDataURL("image/png"));
        }
    };

    const clear = () => {
        padRef.current?.clear();
        onChange(null);
    };

    return (
        <div>
            <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
            <div className="border border-gray-300 rounded bg-white" style={{ touchAction: "none" }}>
                <SignatureCanvas
                    ref={padRef}
                    penColor="black"
                    canvasProps={{ width: 400, height: 140, className: "block" }}
                    onEnd={handleEnd}
                />
            </div>
            <button
                type="button"
                onClick={clear}
                className="mt-1 text-xs text-gray-500 hover:text-red-600 underline"
            >
                Clear
            </button>
        </div>
    );
}
