import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaWarehouse } from "react-icons/fa";
import { FaCar, FaPeopleGroup, FaUsersGear } from "react-icons/fa6";
import { IoLogOutOutline, IoPrintOutline, IoSettingsSharp } from "react-icons/io5";
import { IoIosSwap } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { RiBriefcase4Fill } from "react-icons/ri";

export default function Sidebar({ role, handleLogout, alertCount = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => setIsOpen(prev => !prev);
    const closeSidebar = () => setIsOpen(false);

    const isActive = (routePattern) => route().current(routePattern);
    const linkClass = (routePattern) =>
        `flex items-center gap-2 rounded px-2 py-1 -mx-2 transition-colors ${
            isActive(routePattern)
                ? 'bg-white/20 text-white font-semibold'
                : 'hover:text-gray-300'
        }`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                isOpen
            ) {
                closeSidebar();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const menuItems = (
        <>
            <Link onClick={closeSidebar} href={route('dashboard')} className={linkClass('dashboard')}>
                <div className="relative">
                    <MdDashboard className="text-2xl" />
                    {alertCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                            !
                        </span>
                    )}
                </div>
                Dashboard
            </Link>
            <hr className="border-white border-t-[2px]" />

            <Link onClick={closeSidebar} href={route('tools.index')} className={linkClass('tools.*')}>
                <FaWarehouse className="text-2xl" />
                Inventory
            </Link>
            <hr className="border-white border-t-[2px]" />

                    <Link onClick={closeSidebar} href={route('toolbags.index')} className={linkClass('toolbags.*')}>
                        <RiBriefcase4Fill className="text-2xl" />
                        Toolbags
                    </Link>
                    <hr className="border-white border-t-[2px]" />

                    {role === 'admin' && (
                        <>
                            <Link onClick={closeSidebar} href={route('employees.index')} className={linkClass('employees.*')}>
                                <FaPeopleGroup className="text-2xl" />
                                Employee's
                            </Link>
                            <hr className="border-white border-t-[2px]" />
                        </>
                    )}

                    <Link onClick={closeSidebar} href={route('checkins.index')} className={linkClass('checkins.*')}>
                        <IoIosSwap className="text-2xl" />
                        Check-ins/outs
                    </Link>
                    <hr className="border-white border-t-[2px]" />

                    {role === 'admin' && (
                        <>
                            <Link onClick={closeSidebar} href={route('users.index')} className={linkClass('users.*')}>
                                <FaUsersGear className="text-2xl" />
                                Users
                            </Link>
                            <hr className="border-white border-t-[2px]" />
                        </>
                    )}

                    {/*<Link onClick={closeSidebar} href={route('cars.index')} className="flex items-center gap-2 hover:text-gray-300">*/}
                    {/*    <FaCar className="text-2xl" />*/}
                    {/*    Cars*/}
                    {/*</Link>*/}
                    {/*<hr className="border-white border-t-[2px]" />*/}

                    <Link onClick={closeSidebar} href={route('print-forms.index')} className={linkClass('print-forms.*')}>
                        <IoPrintOutline className="text-2xl" />
                        Print Forms
                    </Link>
                    <hr className="border-white border-t-[2px]" />

                    {role === 'admin' && (
                        <>
                            <Link onClick={closeSidebar} href={route('settings.index')} className={linkClass('settings.*')}>
                                <IoSettingsSharp className="text-2xl" />
                                Settings
                            </Link>
                            <hr className="border-white border-t-[2px]" />
                        </>
                    )}

            <button
                onClick={() => {
                    closeSidebar();
                    handleLogout();
                }}
                className="flex items-center gap-2 hover:text-gray-300"
            >
                <IoLogOutOutline className="text-2xl" />
                Logout
            </button>
        </>
    );

    return (
        <>
            {/* Blauwe balk onder header met Menu-knop (alleen mobiel/tablet) */}
            <div
                onClick={toggleSidebar}
                className="lg:hidden fixed top-28 left-0 w-full bg-[#014489] z-50 py-2 flex justify-center cursor-pointer"
            >
                <span className="text-white font-semibold px-6 py-2">
                    Menu
                </span>
            </div>



            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-30" />
            )}

            {/* Sidebar mobile/tablet */}
            <div
                ref={sidebarRef}
                className={`lg:hidden fixed top-40 left-0 h-[calc(100%-10rem)] w-64 bg-[#014489] text-white z-40 p-6 transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <nav className="space-y-5">{menuItems}</nav>
            </div>

            {/* Sidebar desktop */}
            <div className="hidden lg:flex w-1/12 min-w-40 bg-[#014489] text-white fixed top-28 bottom-0 left-0 z-40 p-4 pt-16 flex-col items-center">
                <nav className="space-y-5">{menuItems}</nav>
            </div>
        </>
    );
}
