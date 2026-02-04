"use client";

import React, { useState, useCallback, useMemo } from 'react';
import SectionHeader from './SectionHeader';
import { sendEmail } from '@/utils/sendEmail';
import { toast } from "react-toastify";

import PhoneIcon from '../icons/PhoneIcon';
import TwitterIcon from '../icons/TwitterIcon';
import FacebookIcon from '../icons/FacebookIcon';
import InstagramIcon from '../icons/InstagramIcon';
import EmailIcon from '../icons/EmailIcon';
import LocationIcon from '../icons/LocationIcon';

/**
 * Clean, accessible styles for form inputs
 * Increased opacity and contrast for better readability against complex backgrounds
 */
const inputStyles = "w-full px-4 py-3 bg-black/60 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
const labelStyles = "block text-sm font-medium text-gray-200 mb-2";

/**
 * Clock Icon SVG (Inline to avoid creating a new file for a single usage)
 */
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

/**
 * HomepageContact component
 * Redesigned with a modern split layout and high-contrast glassmorphism.
 */
function HomepageContact() {
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formState.email.trim() || !emailRegex.test(formState.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!formState.message.trim()) {
            toast.error("Please enter your message");
            return;
        }

        setLoading(true);
        try {
            await sendEmail(formState);
            setSubmitted(true);
            toast.success("Message sent successfully!");
            setFormState({ name: '', email: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [formState]);

    const socialLinks = useMemo(() => [
        { href: "https://www.instagram.com/pizzaport", label: "Instagram", icon: <InstagramIcon /> },
        { href: "https://www.facebook.com/pizzaport", label: "Facebook", icon: <FacebookIcon /> },
        { href: "https://twitter.com/pizzaport", label: "Twitter", icon: <TwitterIcon /> }
    ], []);

    return (
        <>
            {/* Anchor spacer for navigation - provides scroll target offset */}
            <div className="w-full h-20" id="contact"></div>

            <section className="relative py-20 px-4 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto pointer-events-none opacity-20">
                    <div className="absolute top-1/2 right-10 w-64 h-64 bg-primary rounded-full blur-[120px]"></div>
                </div>

                <div className="container mx-auto relative z-10 max-w-6xl">
                    <SectionHeader subHeader="Get in Touch" mainHeader="Contact Us" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 items-start">

                        {/* Left Column: Contact Information */}
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">
                                    Contact Information
                                </h3>

                                <p className="text-gray-200 mb-8 leading-relaxed">
                                    Have a question about our menu? Want to book a venue?
                                    Or simply want to say hello? We&apos;d love to hear from you.
                                </p>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 ring-1 ring-primary/30">
                                            <LocationIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Visit Us</h4>
                                            <p className="text-gray-300 mt-1">123 Pizza Lane, Pizza City</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <a href="tel:+918918039886" className="flex items-start gap-4 group">
                                        <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 ring-1 ring-primary/30">
                                            <PhoneIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Call Us</h4>
                                            <p className="text-gray-300 mt-1 group-hover:text-primary transition-colors">+91 8918039886</p>
                                        </div>
                                    </a>

                                    {/* Email */}
                                    <a href="mailto:rajarnab31@gmail.com" className="flex items-start gap-4 group">
                                        <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 ring-1 ring-primary/30">
                                            <EmailIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Email Us</h4>
                                            <p className="text-gray-300 mt-1 group-hover:text-primary transition-colors">rajarnab31@gmail.com</p>
                                        </div>
                                    </a>

                                    {/* Hours */}
                                    <div className="flex items-start gap-4 group">
                                        <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 ring-1 ring-primary/30">
                                            <ClockIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white">Working Hours</h4>
                                            <p className="text-gray-300 mt-1">Mon - Sat: 10:00 AM - 8:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex gap-4 justify-center lg:justify-start">
                                {socialLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-black/60 border border-white/10 rounded-full text-gray-300 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg backdrop-blur-md"
                                        aria-label={link.label}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl relative">
                            {!submitted ? (
                                <>
                                    <h3 className="text-3xl font-bold text-white mb-2">Send Message</h3>
                                    <p className="text-gray-300 mb-8">We usually respond within 24 hours.</p>

                                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                        <div>
                                            <label htmlFor="name" className={labelStyles}>Your Name</label>
                                            <input
                                                id="name"
                                                name="name"
                                                value={formState.name}
                                                onChange={handleChange}
                                                required
                                                className={inputStyles}
                                                placeholder="John Doe"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className={labelStyles}>Email Address</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                required
                                                className={inputStyles}
                                                placeholder="john@example.com"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className={labelStyles}>Message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                value={formState.message}
                                                onChange={handleChange}
                                                required
                                                className={`${inputStyles} resize-none`}
                                                placeholder="How can we help you?"
                                                disabled={loading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in px-4">
                                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                                    <p className="text-gray-300 mb-8 max-w-xs mx-auto">
                                        Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium cursor-pointer"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default React.memo(HomepageContact);