import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

/**
 * NextAuth API Route Handler
 * 
 * This file exports the NextAuth API handlers for both GET and POST requests.
 * It uses the authentication configuration defined in authOptions.ts.
 * 
 * Routes:
 * - /api/auth/* (all NextAuth API endpoints)
 * 
 * The handler manages:
 * - Authentication flows (sign in, sign out)
 * - Session management
 * - Provider callbacks
 * - Token refresh
 */

export const dynamic = 'force-dynamic';

// Create NextAuth handler with custom configuration
const handler = NextAuth(authOptions);

// Export handlers for both GET and POST requests
export { handler as GET, handler as POST };