import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaWarehouse } from "react-icons/fa";
import { FaCar, FaPeopleGroup } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { IoIosSwap } from "react-icons/io";
import { RiBriefcase4Fill } from "react-icons/ri";

export default function Sidebar({ roles, handleLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const sidebarRef = useRef(null);

    const toggleSidebar = () => setIsOpen(prev => !prev);
    const closeSidebar = () => setIsOpen(false);

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
            <Link onClick={closeSidebar} href={route('dashboard')} className="flex items-center gap-2 hover:text-gray-300">
                <FaWarehouse className="text-2xl" />
                Storage
            </Link>
            <hr className="border-white border-t-[2px]" />

            <Link onClick={closeSidebar} href={route('dashboard')} className="flex items-center gap-2 hover:text-gray-300">
                <IoIosSwap className="text-2xl" />
                Check-ins
            </Link>
            <hr className="border-white border-t-[2px]" />

                <>
                    <Link onClick={closeSidebar} href={route('dashboard')} className="flex items-center gap-2 hover:text-gray-300">
                        <RiBriefcase4Fill className="text-2xl" />
                        Toolbags
                    </Link>
                    <hr className="border-white border-t-[2px]" />
                </>

                <>
                    <Link onClick={closeSidebar} href={route('dashboard')} className="flex items-center gap-2 hover:text-gray-300">
                        <FaPeopleGroup className="text-2xl" />
                        Employee's
                    </Link>
                    <hr className="border-white border-t-[2px]" />
                </>

                <>
                    <Link onClick={closeSidebar} href={route('dashboard')} className="flex items-center gap-2 hover:text-gray-300">
                        <FaCar className="text-2xl" />
                        Cars
                    </Link>
                    <hr className="border-white border-t-[2px]" />
                </>

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
