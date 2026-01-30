/**
 * This is the Home Page (/).
 * 
 * It behaves differently depending on who you are:
 * 1. If you are NOT logged in -> It sends you to the Login page.
 * 2. If you are an ADMIN -> It sends you to the Orders page (dashboard).
 * 3. If you are a CUSTOMER -> It shows you the delicious Pizza Homepage.
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
 * Server-rendered landing page. Redirects based on user role:
 * - Unauthenticated -> Login
 * - Admin -> Admin Dashboard
 * - Customer -> Homepage
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

  // Redirect admin users to admin orders page
  if (session.user?.admin) {
    redirect('/orders');
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