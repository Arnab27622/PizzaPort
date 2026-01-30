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

/**
 * CSS styles for the input and button elements.
 */
const inputStyles = "w-full p-2 bg-gradient-to-br from-[#2c1a0d] to-[#1a1108] border border-amber-900 text-amber-100 rounded";
const buttonStyles = "px-6 py-3 rounded-lg transition inline-flex gap-2 items-center justify-center";

/**
 * HomepageContact component
 * Shows our phone, email, and social links, along with a "Send us a message" form.
 */
function HomepageContact() {
    /**
     * State for form data (Name, Email, Message).
     */
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });

    /**
     * State to track if form has been successfully submitted
     * @state {boolean} submitted
     */
    const [submitted, setSubmitted] = useState(false);

    /**
     * State to track form submission loading status
     * @state {boolean} loading
     */
    const [loading, setLoading] = useState(false);

    /**
     * Updates the form text when the user types.
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    }, []);

    /**
     * Checks if the form is valid, then sends the email.
     */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate name field
        if (!formState.name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formState.email.trim() || !emailRegex.test(formState.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Validate message field
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

    /**
     * List of contact buttons (Call and Email).
     */
    const contactButtons = useMemo(() => [
        {
            href: "tel:+918918039886",
            label: "Call us at +91 8918039886",
            icon: <PhoneIcon />,
            className: "bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        },
        {
            href: "mailto:rajarnab31@gmail.com",
            label: "Email: rajarnab31@gmail.com",
            icon: <EmailIcon />,
            className: "bg-[#1a1108] border border-amber-900 text-amber-100 hover:bg-amber-900/70"
        }
    ], []);

    /**
     * List of social media links.
     */
    const socialLinks = useMemo(() => [
        { href: "https://www.instagram.com/pizzaport", label: "Instagram", icon: <InstagramIcon /> },
        { href: "https://www.facebook.com/pizzaport", label: "Facebook", icon: <FacebookIcon /> },
        { href: "https://twitter.com/pizzaport", label: "Twitter", icon: <TwitterIcon /> }
    ], []);

    return (
        <>
            {/* Anchor spacer for navigation - provides scroll target for #contact */}
            <div className="w-full h-26.25" id='contact'></div>

            {/* Main contact section */}
            <section className="text-center mb-16 px-4">
                {/* Section header */}
                <SectionHeader subHeader="Don't hesitate" mainHeader="Contact Us" />

                {/* Introductory description */}
                <p className="text-card mt-4 max-w-xl mx-auto heading-border">
                    Whether it&apos;s feedback, a question, or a special request—let us know and we&apos;ll get back to you within 24 hours.
                </p>

                {/* Contact action buttons - Call and Email */}
                <div className="mt-8 flex flex-col md:flex-row md:justify-center gap-6">
                    {contactButtons.map((button, index) => (
                        <a
                            key={index}
                            href={button.href}
                            aria-label={button.label}
                            className={`${buttonStyles} ${button.className}`}
                        >
                            {button.icon}
                            {button.label.includes("Call") ? "Call Us: +91 8918039886" : "Email: rajarnab31@gmail.com"}
                        </a>
                    ))}
                </div>

                {/* Contact Form Section */}
                {!submitted ? (
                    <form
                        onSubmit={handleSubmit}
                        className="mt-10 max-w-md mx-auto text-left space-y-3 bg-linear-to-br from-[#2c1a0d]/50 to-[#1a1108]/80 backdrop-blur-sm border border-amber-900/30 rounded-2xl p-6"
                        noValidate
                    >
                        {/* Name input field */}
                        <label htmlFor="name" className="block text-amber-100">Name*</label>
                        <input
                            id="name"
                            name="name"
                            value={formState.name}
                            onChange={handleChange}
                            required
                            className={inputStyles}
                            placeholder='Enter your Name'
                            disabled={loading}
                        />

                        {/* Email input field */}
                        <label htmlFor="email" className="block text-amber-100">Email*</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formState.email}
                            onChange={handleChange}
                            required
                            className={inputStyles}
                            placeholder='Enter your email'
                            disabled={loading}
                        />

                        {/* Message textarea field */}
                        <label htmlFor="message" className="block text-amber-100">Message*</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formState.message}
                            onChange={handleChange}
                            required
                            className={inputStyles}
                            placeholder='Enter your message...'
                            disabled={loading}
                        />

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary text-white ${buttonStyles} hover:bg-primary-dark cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed`}
                            aria-label={loading ? 'Sending message' : 'Send message'}
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                ) : (
                    /* Success state after form submission */
                    <div className="mt-10 text-amber-200">
                        <p>Thank you! We&apos;ll be in touch soon.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            aria-label="Send another message"
                        >
                            Send another message
                        </button>
                    </div>
                )}

                {/* Additional Contact Information & Social Links */}
                <div className="mt-12 text-black space-y-2">
                    {/* Business address */}
                    <p><strong>Visit us (By appointment):</strong> 123 Pizza Lane, Pizza City</p>

                    {/* Support hours */}
                    <p>🕒<strong> Support Hours:</strong> Mon-Sat 10am-8pm</p>

                    {/* Social media links */}
                    <div className="flex justify-center gap-4 mt-4">
                        {socialLinks.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                aria-label={link.label}
                                className="text-black hover:text-white transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

// Export memoized component to prevent unnecessary re-renders
export default React.memo(HomepageContact);