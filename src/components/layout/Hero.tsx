"use client";

/**
 * Hero Section - The First Thing Users See
 * 
 * A stunning, modern hero section with animations, floating elements,
 * and premium visual design to capture attention instantly.
 */

import Image from "next/image";
import Link from "next/link";
import Right from "../icons/Right";
import StarIcon from "../icons/StarIcon";

function Hero() {
    return (
        <section className="relative px-4 md:px-8 py-16 lg:py-24 min-h-[90vh] flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto overflow-hidden">

            {/* Background Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Floating circles with gradient */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-linear-to-br from-primary/20 to-orange-500/10 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-tr from-yellow-500/15 to-red-500/10 rounded-full blur-3xl animate-float-medium" />
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-linear-to-r from-orange-400/15 to-yellow-400/10 rounded-full blur-2xl animate-float-fast" />

                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,58,1,0.03)_1px,transparent_1px)] bg-size-[40px_40px]" />
            </div>

            {/* Text Content Section */}
            <div className="relative z-10 pt-6 lg:pt-0 lg:max-w-lg xl:max-w-xl text-center lg:text-left">

                {/* Badge / Trust Element */}
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in-down">
                    <span className="flex h-2 w-2">
                        <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-white/90 text-sm font-medium">Fresh from the oven</span>
                </div>

                {/* Main Headline with Gradient Effect */}
                <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight animate-fade-in-up animation-delay-100">
                    Life&apos;s Just
                    <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-orange-400 to-yellow-500 animate-gradient-shift">
                        Better
                    </span>{" "}
                    with
                    <br />
                    <span className="relative inline-block">
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 via-primary to-red-600 animate-gradient-shift-reverse">
                            Pizza
                        </span>
                        {/* Underline decoration */}
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                            <path
                                d="M2 8C30 4 70 2 100 6C130 10 170 8 198 4"
                                stroke="url(#underlineGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="animate-draw-line"
                            />
                            <defs>
                                <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#f13a01" />
                                    <stop offset="50%" stopColor="#fb923c" />
                                    <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </span>
                </h1>

                {/* Supporting description */}
                <p className="text-gray-300 text-base md:text-lg lg:text-xl my-6 max-w-md mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200">
                    Where every slice tells a story of <span className="text-primary font-semibold">passion</span>,
                    <span className="text-orange-400 font-semibold"> tradition</span>, and
                    <span className="text-yellow-400 font-semibold"> perfection</span>.
                    Made fresh, delivered hot.
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-center lg:justify-start gap-6 md:gap-8 mb-8 animate-fade-in-up animation-delay-300">
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-extrabold text-amber-100">15k+</div>
                        <div className="text-xs md:text-sm text-amber-200/60 font-medium">Happy Foodies</div>
                    </div>
                    <div className="w-px h-10 bg-amber-500/30" />
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                            <span>4.9</span>
                            <StarIcon className="w-5 h-5 text-amber-400 inline" />
                        </div>
                        <div className="text-xs md:text-sm text-amber-200/60 font-medium">Top Rated</div>
                    </div>
                    <div className="w-px h-10 bg-amber-500/30" />
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-extrabold text-amber-100">30 Min</div>
                        <div className="text-xs md:text-sm text-amber-200/60 font-medium">Hot Delivery</div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fade-in-up animation-delay-400">
                    {/* Primary CTA - Order Now */}
                    <Link
                        href="/menu"
                        className="group relative flex items-center gap-2.5 bg-linear-to-r from-red-600 via-orange-600 to-amber-600 
                        text-white px-8 py-4 rounded-xl font-extrabold text-base md:text-lg
                        transition-all duration-300 
                        shadow-2xl shadow-orange-950/70 hover:shadow-orange-900/90 hover:scale-105
                        border border-amber-400/30 overflow-hidden"
                        aria-label="Order pizza now"
                    >
                        <span className="relative z-10">Order Now</span>
                        <Right className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Link>

                    {/* Secondary CTA - View Menu */}
                    <Link
                        href="/menu"
                        className="group flex items-center gap-2 bg-[#18120c]/90 backdrop-blur-md border border-amber-500/50 
                        text-amber-100 px-8 py-4 rounded-xl font-bold text-base md:text-lg
                        hover:bg-[#241b12] hover:border-amber-400 hover:text-white transition-all duration-300 hover:scale-105 shadow-xl"
                        aria-label="View our menu"
                    >
                        <span>Explore Menu</span>
                        <Right className="w-5 h-5 group-hover:translate-x-1 transition-transform text-amber-400" />
                    </Link>
                </div>
            </div>

            {/* Hero Image Section */}
            <div className="relative z-10 flex justify-center w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in animation-delay-200">
                {/* Glow effects behind pizza */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] bg-linear-to-r from-primary/40 via-orange-500/30 to-yellow-500/40 rounded-full blur-3xl animate-pulse-slow" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[60%] h-[60%] bg-linear-to-tr from-yellow-400/30 to-red-500/30 rounded-full blur-2xl animate-pulse-medium" />
                </div>

                {/* Rotating outer ring */}
                <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                    <div className="w-[90%] h-[90%] rounded-full border-2 border-dashed border-white/10" />
                </div>

                {/* Pizza image with floating animation */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-105 lg:h-105 xl:w-120 xl:h-120 animate-float-pizza">
                    <Image
                        src={"/hero-pizza.webp"}
                        alt={"Delicious pizza from PizzaPort"}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 384px, (max-width: 1280px) 420px, 480px"
                        priority
                    />

                    {/* Steam/heat lines effect */}
                    <div className="absolute top-0 left-1/4 w-1 h-8 bg-linear-to-t from-white/30 to-transparent rounded-full animate-steam-1" />
                    <div className="absolute top-2 left-1/2 w-1 h-6 bg-linear-to-t from-white/20 to-transparent rounded-full animate-steam-2" />
                    <div className="absolute top-4 right-1/4 w-1 h-7 bg-linear-to-t from-white/25 to-transparent rounded-full animate-steam-3" />
                </div>

                {/* Floating ingredient badges */}
                <div className="absolute top-8 right-4 md:right-0 bg-[#140e08]/95 backdrop-blur-md border border-amber-500/60 rounded-2xl px-4 py-2 shadow-2xl animate-float-badge-1 hidden sm:block">
                    <span className="text-sm font-extrabold text-amber-200">100% Mozzarella</span>
                </div>
                <div className="absolute bottom-16 left-0 md:-left-4 bg-[#140e08]/95 backdrop-blur-md border border-amber-500/60 rounded-2xl px-4 py-2 shadow-2xl animate-float-badge-2 hidden sm:block">
                    <span className="text-sm font-extrabold text-amber-200">Organic Toppings</span>
                </div>
                <div className="absolute bottom-8 right-8 bg-linear-to-r from-emerald-600 to-emerald-500 border border-emerald-400/40 rounded-2xl px-4 py-2 shadow-2xl animate-float-badge-3 hidden sm:block">
                    <span className="text-white text-xs font-black uppercase tracking-wider">Wood-Fired Daily</span>
                </div>
            </div>
        </section>
    );
}

export default Hero;
