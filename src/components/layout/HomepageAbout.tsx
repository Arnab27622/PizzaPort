"use client";

import React from 'react';
import SectionHeader from './SectionHeader';
import BackgroundCircle from '../icons/BackgroundCircle';

/**
 * HomepageAbout component
 * Displays the "About Us" section with company story and values.
 */
function HomepageAbout() {
    return (
        <>
            {/* Anchor spacer for navigation - provides scroll target offset */}
            <div className="w-full h-26.25" id='about'></div>

            {/* Main about section */}
            <section className='text-center mb-25 px-4'>
                {/* Section header with about us title */}
                <SectionHeader
                    subHeader="About Us"
                    mainHeader="Why Choose Us?"
                />

                {/* Content container with decorative background circles */}
                <div className="max-w-3xl mx-auto mt-8 relative">
                    {/* Top-left decorative circle */}
                    <div className="absolute -top-6 -left-6 z-0">
                        <BackgroundCircle />
                    </div>

                    {/* Main content card with glassmorphism effect */}
                    <div className="relative z-10 bg-linear-to-br from-[#2c1a0d]/50 to-[#1a1108]/90 backdrop-blur-sm border border-amber-900/30 rounded-2xl p-8 space-y-6">
                        {/* First paragraph - company passion and craftsmanship */}
                        <p className='text-amber-100 text-lg leading-relaxed'>
                            At PizzaPort, every slice tells a story — one of passion, flavor, and tradition. From our carefully crafted dough to our house-made sauces, we pay attention to every detail to give you a pizza that&apos;s unforgettable.
                        </p>

                        {/* Second paragraph - ingredients and menu diversity */}
                        <p className='text-amber-100 text-lg leading-relaxed'>
                            What sets us apart? It&apos;s our commitment to fresh, locally sourced ingredients, eco-friendly practices, and a menu that celebrates both classic and adventurous palates. Whether you&apos;re craving a traditional Margherita or something bolder, we&apos;ve got you covered.
                        </p>

                        {/* Third paragraph - community and service values */}
                        <p className='text-amber-100 text-lg leading-relaxed'>
                            We&apos;re more than just a pizza place — we&apos;re a community hub where good food and great memories come together. Fast delivery, friendly service, and consistent quality are what make our loyal customers keep coming back.
                        </p>
                    </div>

                    {/* Bottom-right decorative circle (rotated) */}
                    <div className="absolute -bottom-6 -right-6 z-0 rotate-180">
                        <BackgroundCircle />
                    </div>
                </div>
            </section>
        </>
    );
}

export default HomepageAbout;