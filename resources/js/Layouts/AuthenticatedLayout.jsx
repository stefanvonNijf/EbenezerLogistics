import ApplicationLogo from '@/Components/ApplicationLogo';
import Sidebar from "@/Layouts/Sidebar.jsx";
import { router, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    const { user } = usePage().props.auth;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role={user?.role} handleLogout={handleLogout} />

            <div className="fixed top-0 left-0 w-full h-28 bg-blue-200 z-50 flex justify-center items-center">
                <ApplicationLogo
                    src="/storage/ebenezer-logo.png"
                    alt="Ebenezer logo"
                    className="h-20 object-contain"
                />
            </div>

            <div className="h-28 lg:w-1/12" />

            {/* Content */}
            <div className="pt-40 lg:pl-[8.333%] pr-4 w-full h-screen box-border overflow-hidden">
                {children}
            </div>
        </div>
    );
}
