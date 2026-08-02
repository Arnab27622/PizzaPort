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
                    <div className="relative z-10 bg-[#16100a]/90 backdrop-blur-md border border-amber-900/50 hover:border-amber-500/40 transition-colors rounded-2xl p-8 md:p-10 space-y-6 shadow-2xl shadow-orange-950/40 text-left">
                        {/* First paragraph - company passion and craftsmanship */}
                        <p className='text-amber-100 text-base md:text-lg leading-relaxed'>
                            At <span className="text-amber-400 font-bold">PizzaPort</span>, every slice tells a story — one of passion, wood-fired flavor, and authentic tradition. From our hand-tossed 48-hour fermented dough to our house-made secret sauces, we pay attention to every detail to give you an unforgettable meal.
                        </p>

                        {/* Second paragraph - ingredients and menu diversity */}
                        <p className='text-amber-200/90 text-base md:text-lg leading-relaxed'>
                            What sets us apart? It&apos;s our commitment to 100% fresh, locally sourced ingredients, premium mozzarella, and a menu that celebrates both classic Italian heritages and adventurous gourmet palates.
                        </p>

                        {/* Third paragraph - community and service values */}
                        <p className='text-amber-200/90 text-base md:text-lg leading-relaxed'>
                            We&apos;re more than just a pizza delivery service — we&apos;re a passion project dedicated to bringing piping-hot comfort food to your doorstep in under 30 minutes.
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