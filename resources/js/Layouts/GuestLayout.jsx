import ApplicationLogo from '@/Components/ApplicationLogo';

export default function GuestLayout({ children }) {
    return (
        <>
            <div className="fixed top-0 left-0 w-full bg-gray-100 h-28 z-50 flex justify-center items-center px-4">
                <img
                    src="/storage/ebenezer-logo.png"
                    alt="Ebenezer"
                    className="h-20 object-contain max-w-full"
                />
            </div>

            <div className="h-28" />

            <div className="h-[calc(100vh-7rem)] w-full flex items-center justify-center bg-gray-100 overflow-auto p-4">
                <div className="w-full max-w-md bg-white px-6 py-6 sm:py-8 shadow-md rounded-lg">
                    <div className="flex justify-center mb-6">
                        <ApplicationLogo
                            className="rounded-[10px]"
                            src="/storage/ebenezer-logo-small.png"
                            alt="Ebenezer"
                            width={100}
                            height={100}
                        />
                    </div>

                    {children}
                </div>
            </div>
        </>
    );
}



