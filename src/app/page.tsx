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
 * 
 * NOTE: For Admin, we use redirect() which Next.js handles.
 * To avoid history loops, we ensure that navigations to home are handled correctly.
 */
export default async function Home() {
  const session = await getServerSession(authOptions);

  // Automatic redirection for unauthenticated users
  if (!session) {
    redirect('/login');
  }

  // Redirect admin users to admin orders page using replace behavior if possible
  if (session.user?.admin) {
    redirect('/orders');
  }

  return (
    <>
      <Hero />
      <HomeMenu />
      <HomepageAbout />
      <HomepageContact />
    </>
  );
}