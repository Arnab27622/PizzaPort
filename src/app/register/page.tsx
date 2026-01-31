'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

import Eye from '@/components/icons/Eye';
import Eyelash from '@/components/icons/Eyelash';
import CheckIcon from '@/components/icons/CheckIcon';
import GoogleIcon from '@/components/icons/GoogleIcon';
import { useRouter } from 'next/navigation';

/**
 * This is the Registration Page (Sign Up).
 * 
 * New users can create an account here by providing:
 * - Full Name
 * - Email
 * - Password (must be strong!)
 * 
 * Or they can sign up instantly with Google.
 */

// Rules for checking if the registration form is valid
const RegisterSchema = z
    .object({
        name: z.string().min(1, 'Full Name is required').max(50, 'Name is too long'),
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: z.string()
            .min(6, 'Password must be at least 6 characters')
            .max(50, 'Password is too long')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
    })
    .refine((d) => d.password === d.confirmPassword, {
        path: ['confirmPassword'],
        message: "Passwords don't match",
    });

import { RegisterInput } from '@/types/user';

function RegisterPage() {
    const router = useRouter();

    /**
     * React Hook Form Configuration
     * 
     * Manages form state, validation, and submission with optimal performance
     * Integrates Zod validation for type-safe form handling
     */
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        shouldFocusError: false,  // Prevents automatic focus on errors for better UX
        mode: 'onChange',         // Real-time validation during user input
    });

    /**
     * Component State Management
     * Tracks visibility of password fields and Google sign-in status.
     */
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

    /**
     * Password Value Watcher
     * 
     * Tracks password field value for real-time strength calculation
     * Enables dynamic UI updates based on password complexity
     */
    const passwordValue = watch('password', '');

    /**
     * Registration Form Submission Handler
     * Sends the user's data to the server to create an account.
     */
    const onSubmit = useCallback(async (data: RegisterInput) => {
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('Account created successfully!');
                router.push('/');
                reset();
            } else {
                setError('root.serverError', {
                    type: 'server',
                    message: result.message || result.error || 'Registration failed'
                });
                toast.error(result.message || result.error || 'Registration failed');
            }
        } catch {
            setError('root.serverError', { type: 'network', message: 'Network error' });
            toast.error('Network error. Please try again.');
        }
    }, [reset, setError, router]);

    /**
     * Google OAuth Authentication Handler
     * Allows users to sign in using their Google account.
     */
    const handleGoogleSignIn = useCallback(async () => {
        setIsGoogleSignIn(true);
        try {
            const result = await signIn('google', { callbackUrl: '/' });
            if (result?.error) {
                toast.error('Google sign-in failed. Please try again.');
            }
        } catch {
            toast.error('Google sign-in failed. Please try again.');
        } finally {
            setIsGoogleSignIn(false);
        }
    }, []);

    /**
     * Password Strength Calculator
     * Checks how strong the password is (0-5) and gives it a label like "Weak" or "Strong".
     */
    const getPasswordStrength = useCallback((password: string) => {
        if (password.length === 0) return { strength: 0, label: '' };

        let strength = 0;
        if (password.length >= 6) strength += 1;          // Minimum length requirement
        if (/[a-z]/.test(password)) strength += 1;        // Lowercase letter
        if (/[A-Z]/.test(password)) strength += 1;        // Uppercase letter
        if (/[0-9]/.test(password)) strength += 1;        // Numeric character
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Special character

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        return { strength, label: labels[strength] };
    }, []);

    /**
     * Password Strength Assessment
     * 
     * Real-time strength evaluation for current password value
     * Used for visual feedback and user guidance
     */
    const passwordStrength = getPasswordStrength(passwordValue);

    /**
     * CSS Classes Configuration
     * 
     * Centralized styling for consistent form appearance
     * Improves maintainability and theming consistency
     */
    const inputClasses = `
    w-full p-3 rounded-xl bg-[#3e3e3e] border border-amber-900/50 text-amber-100
    focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed
  `;

    /**
     * Main Component Render
     * 
     * Implements comprehensive registration interface with:
     * - Marketing benefits section
     * - Secure registration form with validation
     * - Password strength visualization
     * - Google OAuth integration
     * - Responsive two-column layout
     */
    return (
        <section className="mt-5 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-start gap-10">
                    {/* Marketing & Benefits Column */}
                    <div className="w-full lg:w-2/5">
                        <div className="lg:sticky lg:top-24 heading-border">
                            <h1 className="text-4xl font-bold text-primary mb-4">Create Account</h1>
                            <p className="text-amber-200 text-lg mb-6">Join PizzaPort for exclusive deals and faster ordering</p>
                            <div className="mt-8 space-y-4">
                                {[
                                    'Exclusive deals',
                                    'Faster checkout experience',
                                    'Early access to new menu items',
                                    'Personalized recommendations',
                                ].map((text, idx) => (
                                    <div className="flex items-start" key={idx}>
                                        <CheckIcon />
                                        <p className="text-amber-300">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Registration Form Column */}
                    <div className="w-full lg:w-3/5">
                        <div className="bg-linear-to-br from-[#2e2e2e] to-[#000000]/80 backdrop-blur-sm border border-amber-900/30 rounded-2xl p-8">
                            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                                {/* Full Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-amber-200 mb-2">Full Name</label>
                                    <input
                                        {...register('name')}
                                        id="name"
                                        type="text"
                                        disabled={isSubmitting}
                                        className={inputClasses}
                                        placeholder="Enter your Name"
                                        aria-invalid={errors.name ? "true" : "false"}
                                        aria-describedby={errors.name ? "name-error" : undefined}
                                    />
                                    {errors.name && (
                                        <p id="name-error" className="text-red-500 text-sm mt-1">
                                            {errors.name.message}
                                        </p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-amber-200 mb-2">Email</label>
                                    <input
                                        {...register('email')}
                                        id="email"
                                        type="email"
                                        disabled={isSubmitting}
                                        className={inputClasses}
                                        placeholder="Enter your Email"
                                        aria-invalid={errors.email ? "true" : "false"}
                                        aria-describedby={errors.email ? "email-error" : undefined}
                                    />
                                    {errors.email && (
                                        <p id="email-error" className="text-red-500 text-sm mt-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Password Field with Strength Indicator */}
                                <div className="relative">
                                    <label htmlFor="password" className="block text-amber-200 mb-2">Password</label>
                                    <input
                                        {...register('password')}
                                        id="password"
                                        type={showPwd ? 'text' : 'password'}
                                        disabled={isSubmitting}
                                        className={inputClasses}
                                        placeholder="••••••••"
                                        aria-invalid={errors.password ? "true" : "false"}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                    />
                                    {/* Password Visibility Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((s) => !s)}
                                        className="absolute right-4 top-11 text-amber-400 cursor-pointer"
                                        disabled={isSubmitting}
                                        aria-label={showPwd ? "Hide password" : "Show password"}
                                        aria-pressed={showPwd}
                                    >
                                        {showPwd ? <Eyelash /> : <Eye />}
                                    </button>
                                    {errors.password && (
                                        <p id="password-error" className="text-red-500 text-sm mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}

                                    {/* Real-time Password Strength Indicator */}
                                    {passwordValue.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-amber-300">Password strength:</span>
                                                <span className="text-xs font-medium text-amber-300">{passwordStrength.label}</span>
                                            </div>
                                            <div className="w-full bg-amber-900/30 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${passwordStrength.strength <= 1 ? 'bg-red-500' :
                                                        passwordStrength.strength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-amber-200 mb-2">Confirm Password</label>
                                    <input
                                        {...register('confirmPassword')}
                                        id="confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        disabled={isSubmitting}
                                        className={inputClasses}
                                        placeholder="••••••••"
                                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                                        aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                                    />
                                    {/* Confirm Password Visibility Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        className="absolute right-4 top-11 text-amber-400 cursor-pointer"
                                        disabled={isSubmitting}
                                        aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"}
                                        aria-pressed={showConfirm}
                                    >
                                        {showConfirm ? <Eyelash /> : <Eye />}
                                    </button>
                                    {errors.confirmPassword && (
                                        <p id="confirm-password-error" className="text-red-500 text-sm mt-1">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                {/* Registration Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="
                                    w-full bg-primary text-white py-3 rounded-xl font-semibold transition-colors
                                    hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2
                                    "
                                    aria-disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </button>

                                {/* Google OAuth Registration Alternative */}
                                <button
                                    type="button"
                                    disabled={isSubmitting || isGoogleSignIn}
                                    onClick={handleGoogleSignIn}
                                    className="
                                        w-full mt-4 flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-[#1a1108] font-semibold
                                        border border-amber-900/50 hover:bg-gray-100 transition-colors cursor-pointer
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                    aria-disabled={isSubmitting || isGoogleSignIn}
                                >
                                    <GoogleIcon />
                                    {isGoogleSignIn ? 'Redirecting...' : 'Continue with Google'}
                                </button>
                            </form>

                            {/* Login Redirect */}
                            <div className="mt-6 text-center">
                                <p className="text-amber-400">
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="text-primary hover:underline font-semibold"
                                        tabIndex={isSubmitting ? -1 : 0}
                                        aria-disabled={isSubmitting}
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default RegisterPage;