"use client";

import Link from "next/link";
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Cart from "../icons/Cart";
import { CartContext } from "../AppContext";

/**
 * Navigation bar component with authentication, cart, and responsive menu
 * 
 * @component
 * @description 
 * - Provides main navigation for the application
 * - Handles user authentication state and role-based navigation
 * - Includes responsive mobile menu with animations
 * - Manages scroll behavior for transparent/opaque background
 * - Integrates with cart context for cart item count
 * - Supports both admin and regular user navigation flows
 * 
 * @example
 * return <Navbar />
 * 
 * @returns {JSX.Element} Responsive navigation bar with authentication
 */
export default function Navbar() {
    // Authentication state management
    const { status, data: session } = useSession({ required: false });
    const router = useRouter();
    const user = session?.user;
    const isAdmin = user?.admin === true;

    // Format user name to display only first name
    let userName = user?.name ?? "";
    if (userName.includes(" ")) userName = userName.split(" ")[0];

    // Cart context for cart item count
    const { cartProducts } = useContext(CartContext);

    // State for mobile menu and scroll behavior
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    /**
     * Effect hook for handling scroll behavior and click outside detection
     * @effect
     * @listens scroll, mousedown
     */
    useEffect(() => {
        /**
         * Handles clicks outside the mobile menu to close it
         * @function handleClickOutside
         * @param {MouseEvent} e - Mouse event
         */
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && !(e.target as Element).closest("nav, button")) {
                setIsOpen(false);
            }
        };

        /**
         * Handles scroll behavior for navbar background opacity
         * @function handleScroll
         */
        const handleScroll = () => setScrolled(window.scrollY > 10);

        // Add event listeners
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll);

        // Cleanup event listeners
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [isOpen]);

    /**
     * Handles navigation with authentication check
     * @function handleNavigation
     * @param {string} href - The target URL to navigate to
     * @param {React.MouseEvent} e - Click event object
     * @returns {void}
     * 
     * @description
     * - Allows navigation to login/register without authentication
     * - Redirects unauthenticated users to login for protected routes
     * - Prevents default navigation for unauthenticated users
     */
    const handleNavigation = (href: string, e: React.MouseEvent) => {
        // Allow navigation to login/register without authentication check
        if (href === '/login' || href === '/register') {
            return; // Let the default Link behavior handle these
        }

        // If user is not authenticated, redirect to login
        if (status !== 'authenticated') {
            e.preventDefault();
            router.push('/login');
        }
    };

    /**
     * Navigation links configuration based on user role
     * @constant {Array}
     */
    const links = isAdmin
        ? [
            // Admin navigation links
            { href: "/menuitem", label: "Menu" },
            { href: "/users", label: "Users" },
            { href: "/sales", label: "Sales" },
            { href: "/orders", label: "Orders" },
        ]
        : [
            // Regular user navigation links
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
            {/* Main Navigation Container */}
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
                <nav
                    className="hidden md:flex items-center gap-6 text-[#FFFAF0] font-semibold"
                    aria-label="Main navigation"
                >
                    {/* Navigation Links */}
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleNavigation(link.href, e)}
                            className="hover:text-primary transition-colors"
                            aria-label={`Navigate to ${link.label}`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Authenticated User Section */}
                    {status === "authenticated" ? (
                        <div className="flex items-center gap-4 ml-4">
                            {/* User Profile Link */}
                            <Link
                                href="/profile"
                                onClick={(e) => handleNavigation("/profile", e)}
                                className="relative text-primary font-semibold inline-flex items-center"
                                aria-label={`User profile for ${userName}`}
                            >
                                <span className="hover:underline">Hello, {userName}</span>
                                {/* Admin Badge */}
                                {isAdmin && (
                                    <span
                                        className="ml-1 px-2 py-1 text-xs uppercase font-semibold text-red-400 bg-red-500/20 rounded-full"
                                        aria-label="Administrator"
                                    >
                                        Admin
                                    </span>
                                )}
                            </Link>

                            {/* Cart Link (Regular Users Only) */}
                            {!isAdmin && (
                                <Link
                                    href="/cart"
                                    onClick={(e) => handleNavigation("/cart", e)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-2xl border border-primary text-primary hover:bg-primary/10 transition-colors"
                                    aria-label={`View cart with ${cartProducts.length} items`}
                                >
                                    <Cart />({cartProducts.length})
                                </Link>
                            )}

                            {/* Logout Button */}
                            <button
                                onClick={() => signOut()}
                                className="px-5 py-2 rounded-2xl border border-red-500 text-red-300 hover:bg-red-500/10 transition-colors"
                                aria-label="Sign out of account"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        /* Authentication Buttons (Unauthenticated Users) */
                        <div className="flex gap-3 ml-4">
                            <Link
                                href="/login"
                                className="px-5 py-2 rounded-2xl border border-primary text-primary hover:bg-primary/10 transition-colors"
                                aria-label="Sign in to account"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-primary px-5 py-2 rounded-2xl hover:bg-primary-dark transition-colors"
                                aria-label="Create new account"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Toggle Button (Hamburger) */}
                <button
                    className="md:hidden flex flex-col items-center justify-center w-10 h-10"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                >
                    {/* Animated Hamburger Icon */}
                    <span
                        className={`bg-white block h-[0.5px] w-6 rounded transition-transform duration-300 ease-out ${isOpen ? "rotate-45 translate-y-[5px]" : "translate-y-0"
                            }`}
                    />
                    <span
                        className={`bg-white block h-[0.5px] w-6 my-1 rounded transition-opacity duration-300 ${isOpen ? "opacity-0" : "opacity-100"
                            }`}
                    />
                    <span
                        className={`bg-white block h-[0.5px] w-6 rounded transition-transform duration-300 ease-out ${isOpen ? "-rotate-45 -translate-y-[5px]" : "translate-y-0"
                            }`}
                    />
                </button>
            </div>

            {/* Mobile Navigation Menu with Animation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden overflow-hidden bg-[rgba(25,18,12,0.95)]"
                        aria-label="Mobile navigation"
                    >
                        <div className="flex flex-col py-4 px-6 gap-4">
                            {/* Mobile Navigation Links */}
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={(e) => {
                                        handleNavigation(link.href, e);
                                        setIsOpen(false);
                                    }}
                                    className="text-[#FFFAF0] text-xl font-semibold hover:text-primary transition-colors py-2"
                                    aria-label={`Navigate to ${link.label}`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Authenticated User Section */}
                            {status === "authenticated" ? (
                                <div className="flex flex-col gap-4 mt-2">
                                    <Link
                                        href="/profile"
                                        onClick={(e) => {
                                            handleNavigation("/profile", e);
                                            setIsOpen(false);
                                        }}
                                        className="relative text-primary text-center font-semibold hover:underline"
                                        aria-label={`User profile for ${userName}`}
                                    >
                                        Hello, {userName}
                                        {isAdmin && (
                                            <span
                                                className="inline-block ml-2 px-2 py-1 text-xs uppercase font-semibold text-red-400 bg-red-500/20 rounded-full"
                                                aria-label="Administrator"
                                            >
                                                Admin
                                            </span>
                                        )}
                                    </Link>

                                    {/* Mobile Cart Link */}
                                    {!isAdmin && (
                                        <Link
                                            href="/cart"
                                            onClick={(e) => {
                                                handleNavigation("/cart", e);
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary hover:bg-primary/10 rounded-2xl font-semibold"
                                            aria-label={`View cart with ${cartProducts.length} items`}
                                        >
                                            <Cart />({cartProducts.length})
                                        </Link>
                                    )}

                                    {/* Mobile Logout Button */}
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsOpen(false);
                                        }}
                                        className="border border-red-500 text-red-300 px-6 py-3 rounded-2xl hover:bg-red-500/10 transition-colors font-semibold"
                                        aria-label="Sign out of account"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                /* Mobile Authentication Buttons */
                                <div className="flex flex-col gap-4 mt-2">
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="border border-primary text-primary px-6 py-3 rounded-2xl hover:bg-primary/10 transition-colors text-center font-semibold"
                                        aria-label="Sign in to account"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-primary text-white px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors text-center font-semibold"
                                        aria-label="Create new account"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}