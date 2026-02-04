"use client";

/**
 * The main Navigation Bar at the top of every page.
 * It stays visible (fixed) as you scroll down.
 * It handles:
 * - Switching between "Admin" and "Customer" links.
 * - Showing the Logo.
 * - Opening/Closing the mobile menu on small screens.
 */

import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { CartContext } from "../CartProvider";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { ExtendedUser } from "@/types/user";

export default function Navbar() {
    const { status, data: session } = useSession({ required: false });
    const router = useRouter();
    const pathname = usePathname();
    const user = session?.user as ExtendedUser;

    // Persistent admin state to prevent flicker during session updates
    const [lastKnownAdmin, setLastKnownAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'authenticated' && user) {
            setLastKnownAdmin(!!user.admin);
        }
    }, [status, user]);

    // Check if the user is an Admin
    const isAdmin = (status === 'loading' && lastKnownAdmin !== null)
        ? lastKnownAdmin
        : !!user?.admin;

    // Cart Context to show number of items
    const { cartProducts } = useContext(CartContext);

    // State for Mobile Menu and Scroll Effect
    const [isOpen, setIsOpen] = useState(false); // Mobile menu open/close
    const [scrolled, setScrolled] = useState(false); // True if user scrolled down

    // Format user name (e.g., "John Doe" -> "John")
    let userName = user?.name ?? "";
    if (userName.includes(" ")) userName = userName.split(" ")[0];

    // Close mobile menu if clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && !(e.target as Element).closest("nav, button")) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => setScrolled(window.scrollY > 10);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isOpen]);

    // Helper to secure redirects and handle anchor links
    const handleNavigation = (href: string, e: React.MouseEvent) => {
        // Handle same-page navigation
        if (pathname === '/') {
            // Case 1: Clicking a hash link while on home page
            if (href.startsWith('/#')) {
                const hash = href.split('#')[1];
                e.preventDefault();
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                setIsOpen(false);
                return;
            }
            // Case 2: Clicking logo or Home link while on home page
            if (href === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsOpen(false);
                return;
            }
        }

        // Authentication guard
        if (href === '/login' || href === '/register') return;
        if (status !== 'authenticated' && href !== '/' && !href.startsWith('/#')) {
            e.preventDefault();
            router.push('/login');
            setIsOpen(false);
        }
    };

    // Define which links to show based on user role
    const links = isAdmin
        ? [
            { href: "/menuitem", label: "Menu" },
            { href: "/users", label: "Users" },
            { href: "/sales", label: "Sales" },
            { href: "/orders", label: "Orders" },
            { href: "/coupons", label: "Coupons" },
        ]
        : [
            { href: "/", label: "Home" },
            { href: "/menu", label: "Menu" },
            { href: "/user-orders", label: "Orders" },
            { href: "/user-coupons", label: "Coupons" },
            { href: "/#about", label: "About" },
            { href: "/#contact", label: "Contact" },
        ];

    return (
        <header
            className={`fixed w-full top-0 z-50 py-4 px-4 transition-all duration-300 ${scrolled
                ? "bg-[rgba(17,15,13,0.95)] shadow-lg"
                : "bg-[rgba(17,15,13,0.85)]"
                }`}
            role="banner"
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                {isAdmin ? (
                    <span
                        className="text-primary font-semibold text-3xl lg:text-4xl logo-text"
                        aria-label="PizzaPort Home (Disabled for Admin)"
                    >
                        PizzaPort
                    </span>
                ) : (
                    <Link
                        href="/"
                        onClick={(e) => handleNavigation("/", e)}
                        className="text-primary font-semibold text-3xl lg:text-4xl logo-text"
                        aria-label="PizzaPort Home"
                    >
                        PizzaPort
                    </Link>
                )}

                {/* Desktop Navigation (Hidden on small screens) */}
                <DesktopNav
                    links={links}
                    status={status}
                    userName={userName}
                    isAdmin={isAdmin}
                    cartCount={cartProducts.length}
                    onNavigate={handleNavigation}
                    onLogout={signOut}
                />

                {/* Mobile Menu Toggle Button (Hidden on large screens) */}
                <button
                    className="md:hidden flex flex-col items-center justify-center w-10 h-10 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                >
                    <span className={`bg-white block h-[0.5px] w-6 rounded transition-transform duration-300 ease-out ${isOpen ? "rotate-45 translate-y-1.25" : "translate-y-0"}`} />
                    <span className={`bg-white block h-[0.5px] w-6 my-1 rounded transition-opacity duration-300 ${isOpen ? "opacity-0" : "opacity-100"}`} />
                    <span className={`bg-white block h-[0.5px] w-6 rounded transition-transform duration-300 ease-out ${isOpen ? "-rotate-45 -translate-y-1.25" : "translate-y-0"}`} />
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            <MobileNav
                isOpen={isOpen}
                links={links}
                status={status}
                userName={userName}
                isAdmin={isAdmin}
                cartCount={cartProducts.length}
                onNavigate={handleNavigation}
                onLogout={signOut}
                onClose={() => setIsOpen(false)}
            />
        </header>
    );
}

