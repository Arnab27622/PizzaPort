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
                    className="hover:text-primary transition-colors"
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
                        className="relative text-primary font-semibold inline-flex items-center"
                    >
                        <span className="hover:underline max-w-20 xl:max-w-none truncate">Hello, {userName}</span>
                        {isAdmin && (
                            <span className="ml-1 px-2 py-1 text-xs uppercase font-semibold text-red-100 bg-red-600 rounded-full text-[10px] leading-none">
                                Admin
                            </span>
                        )}
                    </Link>

                    {!isAdmin && (
                        <Link
                            href="/cart"
                            onClick={(e) => onNavigate("/cart", e)}
                            className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-primary text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Cart />({cartCount})
                        </Link>
                    )}

                    <button
                        onClick={onLogout}
                        className="px-2 lg:px-3 xl:px-5 py-2 rounded-2xl border border-red-500 text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            ) : status === "unauthenticated" ? (
                /* Authentication Buttons (Unauthenticated) */
                <div className="flex gap-2 lg:gap-3 xl:gap-4 ml-2 lg:ml-4">
                    <Link
                        href="/login"
                        className="px-2 lg:px-3 xl:px-5 py-2 rounded-2xl border border-primary text-primary hover:bg-primary/10 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="bg-primary px-3 lg:px-5 py-2 rounded-2xl hover:bg-primary-dark transition-colors text-white"
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

