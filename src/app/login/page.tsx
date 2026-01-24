'use client';

import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import Eye from '@/components/icons/Eye';
import Eyelash from '@/components/icons/Eyelash';
import CheckIcon from '@/components/icons/CheckIcon';
import ShieldIcon from '@/components/icons/ShieldIcon';
import GoogleIcon from '@/components/icons/GoogleIcon';

/**
 * Login Form Validation Schema
 * 
 * Defines form validation rules using Zod schema validation
 * Ensures data integrity and provides user-friendly error messages
 */
const LoginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')                    // Required field validation
    .email('Invalid email address'),               // Email format validation
  password: z.string()
    .min(6, 'Password must be at least 6 characters'), // Minimum length requirement
});

/**
 * Type Inference from Zod Schema
 * 
 * Automatically generates TypeScript types from validation schema
 * Ensures type safety throughout the form handling logic
 */
type LoginInput = z.infer<typeof LoginSchema>;

/**
 * LoginPage Component
 * 
 * Authentication interface providing both email/password and Google OAuth login
 * Features responsive design, form validation, and secure authentication flows
 * 
 * @component
 * @example
 * <LoginPage />
 * 
 * @features
 * - Email/password authentication with validation
 * - Google OAuth integration
 * - Password visibility toggle
 * - Form error handling with user-friendly messages
 * - Responsive two-column layout
 * - Loading states and disabled form during submission
 * 
 * @security
 * - Client-side form validation
 * - Secure credential handling via NextAuth
 * - Protected against CSRF through NextAuth
 * - Error message sanitization
 * 
 * @accessibility
 * - ARIA labels for form fields
 * - Semantic HTML structure
 * - Keyboard navigation support
 * - Screen reader compatible
 */
function LoginPage() {
  /**
   * Router instance for post-login navigation
   */
  const router = useRouter();

  /**
   * React Hook Form Configuration
   * 
   * Manages form state, validation, and submission
   * Integrates with Zod for schema validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),    // Zod schema integration
    shouldFocusError: false,               // Prevents auto-scroll on error
  });

  /**
   * Component State Management
   * 
   * @state showPwd - Toggles password visibility
   * @state isGoogleSignIn - Tracks Google OAuth submission state
   */
  const [showPwd, setShowPwd] = useState(false);
  const [isGoogleSignIn, setIsGoogleSignIn] = useState(false);

  /**
   * Email/Password Login Handler
   * 
   * Processes credential-based authentication through NextAuth
   * Handles both success and error states with appropriate user feedback
   * 
   * @param {LoginInput} data - Validated form data from user input
   * @throws {Error} Authentication errors from NextAuth provider
   */
  const onSubmit = async (data: LoginInput) => {
    // Clear previous server errors before new submission
    clearErrors('root.serverError');

    /**
     * NextAuth Credential Authentication
     * 
     * Attempts to authenticate user with provided credentials
     * Uses custom credentials provider configured in NextAuth
     */
    const resp = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,        // Handle redirect manually for error handling
      callbackUrl: '/',       // Destination after successful login
    });

    /**
     * Authentication Response Handling
     * 
     * Processes NextAuth response and provides appropriate user feedback
     * Handles various error scenarios with specific messaging
     */
    if (!resp?.ok || resp.error || !resp.url) {
      /**
       * Error Message Processing
       * 
       * Maps NextAuth error codes to user-friendly messages
       * Provides specific feedback for different failure scenarios
       */
      let msg = resp?.error;
      if (resp?.error === 'UserBanned') {
        msg = 'Your account has been banned.';
      } else if (resp?.error === 'CredentialsSignin') {
        msg = 'Invalid credentials';
      }

      // Fallback to generic message if no specific error identified
      const safeMsg = msg || 'Login Failed';

      // Set form error and show toast notification
      setError('root.serverError', { type: 'server', message: safeMsg });
      toast.error(safeMsg);
    } else {
      /**
       * Success Handling
       * 
       * Shows success feedback and redirects to home page
       * Uses the callbackUrl provided to NextAuth
       */
      toast.success('Login successful!');
      router.push(resp.url);
    }
  };

  /**
   * Google OAuth Login Handler
   * 
   * Initiates Google OAuth authentication flow
   * Handles loading state and error scenarios
   */
  const handleGoogleSignIn = async () => {
    setIsGoogleSignIn(true);
    try {
      /**
       * NextAuth Google Provider Authentication
       * 
       * Redirects to Google OAuth consent screen
       * Handles OAuth flow and returns to callback URL
       */
      const resp = await signIn('google', { callbackUrl: '/' });

      // Handle OAuth errors (typically network or configuration issues)
      if (resp?.error) {
        toast.error('Google sign-in failed. Please try again.');
      }
    } catch {
      // Handle unexpected errors during OAuth process
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      // Reset loading state regardless of outcome
      setIsGoogleSignIn(false);
    }
  };

  /**
   * Reusable CSS Classes
   * 
   * Centralized styling for consistent form appearance
   * Uses Tailwind CSS with custom color scheme
   */
  const inputClasses = `
    w-full p-3 rounded-xl bg-[#1a1108] border border-amber-900/50 text-amber-100
    focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed
  `;

  /**
   * Component Render
   * 
   * Two-column responsive layout:
   * - Left: Marketing content and value propositions
   * - Right: Login form with authentication options
   */
  return (
    <section className="mt-7 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-10">

          {/* Marketing/Content Column */}
          <div className="w-full lg:w-2/5">
            <div className="lg:sticky lg:top-24 heading-border">
              {/* Page Header */}
              <h1 className="text-4xl font-bold text-primary mb-4">Welcome Back</h1>
              <p className="text-amber-200 text-lg mb-6">
                Login to PizzaPort for exclusive offers and fast checkout
              </p>

              {/* Value Proposition List */}
              <div className="mt-8 space-y-4">
                {[
                  'Exclusive members-only deals',
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

              {/* Security Illustration */}
              <div className="mt-10 hidden lg:block">
                <div className="relative w-48 h-48 mx-auto">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl" />
                  <ShieldIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Login Form Column */}
          <div className="w-full lg:w-3/5">
            <div className="bg-linear-to-br from-[#2c1a0d]/80 to-[#1a1108]/80 backdrop-blur-sm border border-amber-900/30 rounded-2xl p-8">

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>

                {/* Email Input Field */}
                <div>
                  <label htmlFor="email" className="block text-amber-200 mb-2">
                    Email
                  </label>
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
                  {/* Email Validation Error */}
                  {errors.email && (
                    <p id="email-error" className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input Field with Visibility Toggle */}
                <div className="relative">
                  <label htmlFor="password" className="block text-amber-200 mb-2">
                    Password
                  </label>
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
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-4 top-11 text-amber-400"
                    disabled={isSubmitting}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    aria-pressed={showPwd}
                  >
                    {showPwd ? <Eyelash /> : <Eye />}
                  </button>
                  {/* Password Validation Error */}
                  {errors.password && (
                    <p id="password-error" className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Email/Password Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full bg-primary text-white py-3 rounded-xl font-semibold transition-colors
                    hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  "
                  aria-disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in…' : 'Login'}
                </button>

                {/* Google OAuth Login Button */}
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

              {/* Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-amber-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    className="text-primary hover:underline font-semibold"
                    aria-disabled={isSubmitting}
                    tabIndex={isSubmitting ? -1 : 0}
                  >
                    Sign up
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

export default LoginPage;