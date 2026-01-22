"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import Right from "../icons/Right";

/**
 * Hero section component for the main landing page
 * 
 * @component
 * @description The main hero banner featuring a headline, description, call-to-action buttons, and pizza image
 * @example
 * return <Hero />
 * 
 * @returns {JSX.Element} Hero section with text content and visual elements
 */
function Hero() {
    return (
        <section className="px-4 md:px-8 py-16 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
            {/* Text Content Section */}
            <div className="pt-6 md:pt-12 lg:pt-20 lg:max-w-lg xl:max-w-xl">
                {/* Main headline with emphasized "Pizza" */}
                <h1 className="text-white heading-border text-3xl sm:text-4xl md:text-5xl font-semibold text-center lg:text-left">
                    Life&apos;s Just Better with <span className="text-primary">Pizza</span>
                </h1>

                {/* Supporting description text */}
                <p className="text-white my-4 md:my-6 text-sm md:text-base text-center lg:text-left heading-border">
                    Life&apos;s ordinary moments transform into celebrations when pizza arrives...
                </p>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    {/* Primary CTA - Order Now */}
                    <Link
                        href="/menu"
                        className="flex items-center bg-white text-primary px-5 py-2 md:px-6 md:py-2 rounded-full font-bold
                        hover:bg-gray-200 transition-all gap-1 cursor-pointer uppercase hover:shadow-lg hover:scale-105
                        text-sm md:text-base"
                        aria-label="Order pizza now"
                    >
                        Order Now
                        <Right className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>

                    {/* Secondary CTA - View Menu */}
                    <Link
                        href="/menu"
                        className="flex items-center gap-1 bg-transparent border-2 border-white text-white px-6 py-2 md:px-7.5 md:py-2
                        rounded-full font-semibold hover:bg-white hover:text-black transition-all cursor-pointer hover:scale-105
                        text-sm md:text-base"
                        aria-label="View our menu"
                    >
                        View Menu
                        <Right className="w-4 h-4 md:w-5 md:h-5" />
                    </Link>
                </div>
            </div>

            {/* Hero Image Section */}
            <div className="relative flex justify-center w-full max-w-md lg:max-w-none">
                {/* Responsive image container */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-95 lg:h-95 xl:w-105 xl:h-105">
                    <Image
                        src={"/hero-pizza.png"}
                        alt={"Delicious pizza from PizzaPort"}
                        fill
                        className="object-contain"
                        priority // Prioritize loading for above-the-fold content
                    />
                </div>
            </div>
        </section>
    );
}

export default Hero;