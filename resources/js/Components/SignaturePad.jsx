import React, { useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ label, onChange }) {
    const padRef = useRef(null);
    const containerRef = useRef(null);

    const syncWidth = useCallback(() => {
        if (!padRef.current || !containerRef.current) return;
        const canvas = padRef.current.getCanvas();
        const width = containerRef.current.offsetWidth;
        if (canvas.width === width) return;
        canvas.width = width;
        padRef.current.clear();
        onChange(null);
    }, [onChange]);

    useEffect(() => {
        syncWidth();
        const ro = new ResizeObserver(syncWidth);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [syncWidth]);

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
            <div ref={containerRef} className="border border-gray-300 rounded bg-white w-full" style={{ touchAction: "none" }}>
                <SignatureCanvas
                    ref={padRef}
                    penColor="black"
                    canvasProps={{ width: 400, height: 140, className: "block w-full" }}
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
