/**
 * This special file (ending in .d.ts) is used to tell TypeScript about
 * custom properties we've added to NextAuth (our login system).
 * 
 * By default, NextAuth users only have a name and email. We want them to also have
 * things like "address" and "admin" status.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    /**
     * This defines what a "User" object looks like inside the app.
     */
    interface User {
        id: string;
        admin?: boolean; // True if the user has admin privileges
        phone?: string;
    }

    /**
     * This defines what information is stored in the "Session".
     * A session is what the browser uses to remember you are logged in.
     */
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
            address?: string; // The user's saved delivery address
            gender?: string;  // The user's gender
            phone?: string;   // The user's phone number
            admin: boolean;   // Whether the user can access the admin dashboard
        };
    }
}

declare module "next-auth/jwt" {
    /**
     * This defines what information is stored inside the "JSON Web Token" (JWT).
     * The JWT is a secure, encrypted piece of data used for authentication.
     */
    interface JWT {
        id?: string;
        name?: string;
        email?: string;
        image?: string;
        admin?: boolean;
        phone?: string;
    }
}

