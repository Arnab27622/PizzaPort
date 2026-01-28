import "next-auth";
import "next-auth/jwt";

/**
 * NextAuth Type Extensions
 * Extends default NextAuth types to include custom user properties
 */
declare module "next-auth" {
    interface User {
        id: string;
        admin?: boolean; // Custom admin flag for user permissions
    }

    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string;
            address?: string; // Custom user address field
            gender?: string;  // Custom user gender field
            admin: boolean;   // Admin status for authorization
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;      // User ID from database
        name?: string;    // User's display name
        email?: string;   // User's email address
        image?: string;   // User's profile image URL
        admin?: boolean;  // User's admin status
    }
}
