/**
 * This component displays the menu links for larger screens (Laptops, Desktops).
 * It changes based on whether you are logged in, logged out, or an admin.
 */

import React from 'react';
import Link from 'next/link';
import Cart from '@/components/icons/Cart';
import { NavLink } from '@/types/common';


interface DesktopNavProps {
    links: NavLink[];
    status: "authenticated" | "loading" | "unauthenticated";
    userName: string;
    isAdmin: boolean;
    cartCount: number;
    onNavigate: (href: string, e: React.MouseEvent) => void;
    onLogout: () => void;
}

export default function DesktopNav({
    links,
    status,
    userName,
    isAdmin,
    cartCount,
    onNavigate,
    onLogout
}: DesktopNavProps) {
    return (
        <nav
            className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6 text-[#FFFAF0] font-semibold text-xs lg:text-sm xl:text-base whitespace-nowrap"
            aria-label="Main navigation"
        >
            {/* Navigation Links */}
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => onNavigate(link.href, e)}
                    scroll={!link.href.includes('#')}
                    className="hover:text-amber-400 transition-colors py-1"
                >
                    {link.label}
                </Link>
            ))}

            {/* Authentication Section */}
            {status === "authenticated" ? (
                <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 ml-2 lg:ml-4">
                    <Link
                        href="/profile"
                        onClick={(e) => onNavigate("/profile", e)}
                        className="relative text-amber-200 hover:text-amber-400 font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                        <span className="hover:underline max-w-20 xl:max-w-none truncate">Hello, {userName}</span>
                        {isAdmin && (
                            <span className="px-2 py-0.5 text-xs font-extrabold text-white bg-linear-to-r from-red-600 to-amber-600 rounded-full shadow-md text-[10px] leading-none">
                                Admin
                            </span>
                        )}
                    </Link>

                    {!isAdmin && (
                        <Link
                            href="/cart"
                            onClick={(e) => onNavigate("/cart", e)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-red-600 via-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-950/50 hover:scale-105 transition-all cursor-pointer border border-amber-400/20"
                        >
                            <Cart />
                            <span>Cart</span>
                            <span className="bg-black/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-black">
                                {cartCount}
                            </span>
                        </Link>
                    )}

                    <button
                        onClick={onLogout}
                        className="px-3 lg:px-4 py-2 rounded-full border border-red-500/40 text-red-300 hover:bg-red-950/40 hover:border-red-500 transition-all cursor-pointer text-xs lg:text-sm"
                    >
                        Logout
                    </button>
                </div>
            ) : status === "unauthenticated" ? (
                /* Authentication Buttons (Unauthenticated) */
                <div className="flex items-center gap-2 lg:gap-3 ml-2 lg:ml-4">
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-full border border-amber-500/40 text-amber-200 hover:bg-amber-950/40 hover:border-amber-500 transition-all text-xs lg:text-sm font-semibold"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-linear-to-r from-red-600 via-orange-600 to-amber-600 px-4 lg:px-5 py-2 rounded-full hover:scale-105 transition-all text-white font-bold shadow-lg shadow-orange-950/50 text-xs lg:text-sm border border-amber-400/20"
                    >
                        Register
                    </Link>
                </div>
            ) : (
                /* Loading state - show empty space to prevent flicker */
                <div className="ml-4 w-48 h-10" />
            )}
        </nav>
    );
}

