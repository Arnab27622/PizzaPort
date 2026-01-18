/**
 * Home Page Component
 * 
 * Landing page for authenticated users with restaurant overview
 * Provides navigation to key sections and featured content
 * 
 * @file page.tsx
 * 
 * @features
 * - Server-side session validation for security
 * - Automatic redirection for unauthenticated users
 * - Modular section components for maintainability
 * - Progressive content revelation for optimal user experience
 * 
 * @security
 * - Server-side authentication checking prevents client-side exposure
 * - Protected route with automatic redirect to login
 * - Session validation through NextAuth.js
 * 
 * @performance
 * - Server-side rendering for optimal initial load
 * - Component-level code splitting for efficient bundling
 * - Optimized image loading and lazy loading for below-fold content
 * 
 * @user_experience
 * - Immediate feedback through automatic redirection
 * - Clear information hierarchy with prominent calls-to-action
 * - Consistent branding and visual design throughout
 */

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Hero from "@/components/layout/Hero";
import HomeMenu from "@/components/layout/HomeMenu";
import HomepageAbout from "@/components/layout/HomepageAbout";
import HomepageContact from "@/components/layout/HomepageContact";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";

/**
 * Home Component
 * 
 * Server-rendered landing page that requires user authentication
 * Composes multiple section components for comprehensive restaurant overview
 * 
 * @async
 * @function
 * 
 * @returns {Promise<JSX.Element>} Complete home page with all sections
 * 
 * @throws {Redirect} Redirects to login page if user is not authenticated
 */
export default async function Home() {
  /**
   * Server-Side Session Validation
   * 
   * Checks user authentication status before rendering page content
   * Essential for protecting authenticated routes and user data
   */
  const session = await getServerSession(authOptions);

  // Automatic redirection for unauthenticated users
  if (!session) {
    redirect('/login');
  }

  /**
   * Page Composition
   * 
   * Renders complete home page with sequential section components:
   * 1. Hero - Prominent banner with key value proposition
   * 2. HomeMenu - Featured menu items and categories
   * 3. HomepageAbout - Restaurant story and differentiators
   * 4. HomepageContact - Location and contact information
   */
  return (
    <>
      <Hero />
      <HomeMenu />
      <HomepageAbout />
      <HomepageContact />
    </>
  );
}