import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = forwardRef(function SignaturePad({ label, onChange, onNext }, ref) {
    const padRef = useRef(null);
    const containerRef = useRef(null);
    const fsRef = useRef(null);
    const fsContainerRef = useRef(null);
    const [fullscreen, setFullscreen] = useState(false);

    useImperativeHandle(ref, () => ({
        openFullscreen: () => setFullscreen(true),
    }));

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

    useEffect(() => {
        if (!fullscreen || !fsRef.current || !fsContainerRef.current) return;
        const canvas = fsRef.current.getCanvas();
        canvas.width  = fsContainerRef.current.offsetWidth;
        canvas.height = fsContainerRef.current.offsetHeight;
    }, [fullscreen]);

    const handleEnd = () => {
        if (padRef.current && !padRef.current.isEmpty()) {
            onChange(padRef.current.getTrimmedCanvas().toDataURL("image/png"));
        }
    };

    const clear = () => {
        padRef.current?.clear();
        onChange(null);
    };

    const clearFs = () => { fsRef.current?.clear(); };

    const saveFs = () => {
        if (fsRef.current && !fsRef.current.isEmpty()) {
            const dataUrl = fsRef.current.getTrimmedCanvas().toDataURL("image/png");
            onChange(dataUrl);
            padRef.current?.fromDataURL(dataUrl);
            return true;
        }
        return false;
    };

    const confirmFs = () => { saveFs(); setFullscreen(false); };

    const nextFs = () => {
        saveFs();
        setFullscreen(false);
        onNext?.();
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
            <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={clear} className="text-xs text-gray-500 hover:text-red-600 underline">
                    Clear
                </button>
                <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Fullscreen
                </button>
            </div>

            {fullscreen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col" style={{ touchAction: "none" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 shrink-0">
                        <p className="font-medium text-gray-700">{label}</p>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={clearFs} className="text-sm text-gray-500 hover:text-red-600 underline">
                                Clear
                            </button>
                            <button type="button" onClick={() => setFullscreen(false)} className="text-sm text-gray-500 hover:text-gray-800 underline">
                                Cancel
                            </button>
                            {onNext && (
                                <button type="button" onClick={nextFs} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                    Next →
                                </button>
                            )}
                            <button type="button" onClick={confirmFs} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                                Done
                            </button>
                        </div>
                    </div>
                    <div ref={fsContainerRef} className="flex-1 bg-white" style={{ touchAction: "none" }}>
                        <SignatureCanvas
                            ref={fsRef}
                            penColor="black"
                            canvasProps={{ className: "block w-full h-full" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

export default SignaturePad;
