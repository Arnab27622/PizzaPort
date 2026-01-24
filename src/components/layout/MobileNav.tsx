import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Cart from '@/components/icons/Cart';
import { NavLink } from './DesktopNav';

interface MobileNavProps {
    isOpen: boolean;
    links: NavLink[];
    status: "authenticated" | "loading" | "unauthenticated";
    userName: string;
    isAdmin: boolean;
    cartCount: number;
    onNavigate: (href: string, e: React.MouseEvent) => void;
    onLogout: () => void;
    onClose: () => void;
}

export default function MobileNav({
    isOpen,
    links,
    status,
    userName,
    isAdmin,
    cartCount,
    onNavigate,
    onLogout,
    onClose
}: MobileNavProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.nav
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden overflow-hidden bg-[rgba(25,18,12,0.95)]"
                >
                    <div className="flex flex-col py-4 px-6 gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                    onNavigate(link.href, e);
                                    onClose();
                                }}
                                className="text-[#FFFAF0] text-xl font-semibold hover:text-primary transition-colors py-2"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {status === "authenticated" ? (
                            <div className="flex flex-col gap-4 mt-2">
                                <Link
                                    href="/profile"
                                    onClick={(e) => {
                                        onNavigate("/profile", e);
                                        onClose();
                                    }}
                                    className="relative text-primary text-center font-semibold hover:underline"
                                >
                                    Hello, {userName}
                                    {isAdmin && (
                                        <span className="inline-block ml-2 px-2 py-1 text-xs uppercase font-semibold text-red-400 bg-red-500/20 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </Link>

                                {!isAdmin && (
                                    <Link
                                        href="/cart"
                                        onClick={(e) => {
                                            onNavigate("/cart", e);
                                            onClose();
                                        }}
                                        className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary/10 rounded-2xl font-semibold"
                                    >
                                        <Cart />({cartCount})
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        onLogout();
                                        onClose();
                                    }}
                                    className="border border-red-500 text-red-300 px-6 py-3 rounded-2xl hover:bg-red-500/10 transition-colors font-semibold"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 mt-2">
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="border border-primary text-primary px-6 py-3 rounded-2xl hover:bg-primary/10 transition-colors text-center font-semibold"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors text-center font-semibold"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
