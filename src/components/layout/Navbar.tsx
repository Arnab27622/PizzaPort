"use client";

import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CartContext } from "../AppContext";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { ExtendedUser } from "@/types/user";

export default function Navbar() {
    const { status, data: session } = useSession({ required: false });
    const router = useRouter();
    const user = session?.user as ExtendedUser;

    // Persistent admin state to prevent flicker during session updates
    const [lastKnownAdmin, setLastKnownAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        if (status === 'authenticated' && user) {
            setLastKnownAdmin(!!user.admin);
        }
    }, [status, user]);

    const isAdmin = (status === 'loading' && lastKnownAdmin !== null)
        ? lastKnownAdmin
        : !!user?.admin;

    // Cart Context
    const { cartProducts } = useContext(CartContext);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Format user name
    let userName = user?.name ?? "";
    if (userName.includes(" ")) userName = userName.split(" ")[0];

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

    const handleNavigation = (href: string, e: React.MouseEvent) => {
        if (href === '/login' || href === '/register') return;
        if (status !== 'authenticated') {
            e.preventDefault();
            router.push('/login');
        }
    };

    const links = isAdmin
        ? [
            { href: "/menuitem", label: "Menu" },
            { href: "/users", label: "Users" },
            { href: "/sales", label: "Sales" },
            { href: "/orders", label: "Orders" },
        ]
        : [
            { href: "/", label: "Home" },
            { href: "/menu", label: "Menu" },
            { href: "/user-orders", label: "Orders" },
            { href: "/#about", label: "About" },
            { href: "/#contact", label: "Contact" },
        ];

    return (
        <header
            className={`fixed w-full top-0 z-50 py-4 px-4 transition-all duration-300 ${scrolled
                ? "bg-[rgba(25,18,12,0.95)] shadow-lg"
                : "bg-[rgba(25,18,12,0.85)]"
                }`}
            role="banner"
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Logo/Brand */}
                <Link
                    href="/"
                    onClick={(e) => handleNavigation("/", e)}
                    className="text-primary font-semibold text-3xl logo-text"
                    aria-label="PizzaPort Home"
                >
                    PizzaPort
                </Link>

                {/* Desktop Navigation */}
                <DesktopNav
                    links={links}
                    status={status}
                    userName={userName}
                    isAdmin={isAdmin}
                    cartCount={cartProducts.length}
                    onNavigate={handleNavigation}
                    onLogout={signOut}
                />

                {/* Mobile Menu Toggle Button */}
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

            {/* Mobile Navigation */}
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
