import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongoConnect";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for image uploads
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

/**
 * Upload external image to Cloudinary
 * Downloads image from URL and uploads to Cloudinary
 * Used for Google OAuth profile pictures and other external images
 * 
 * @param {string} imageUrl - External image URL to download and upload
 * @param {string} folder - Cloudinary folder path for organization
 * @returns {Promise<string | null>} Cloudinary secure URL or null if failed
 */
async function uploadExternalImageToCloudinary(
    imageUrl: string,
    folder: string = 'pizza-delivery/profiles'
): Promise<string | null> {
    try {
        if (!imageUrl || !imageUrl.startsWith('http')) {
            return null;
        }

        // Upload directly from URL to Cloudinary
        const result = await cloudinary.uploader.upload(imageUrl, {
            resource_type: 'image',
            folder,
        });

        return result.secure_url;
    } catch (error) {
        console.error('Error uploading external image to Cloudinary:', error);
        return null; // Fallback to original URL if upload fails
    }
}

/**
 * NextAuth Configuration Options
 * Defines authentication providers, session management, and custom callbacks
 */
export const authOptions: NextAuthOptions = {
    // MongoDB adapter for storing user sessions and accounts
    adapter: MongoDBAdapter(clientPromise),

    // Session configuration using JWT strategy
    session: {
        strategy: "jwt", // JSON Web Token based sessions
        maxAge: 30 * 24 * 60 * 60, // Session expires in 30 days
    },

    // Custom page routes for authentication
    pages: {
        signIn: '/login',    // Custom login page
        error: '/login',     // Error redirects to login page
    },

    // Authentication providers configuration
    providers: [
        // Google OAuth provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            /**
             * Custom profile mapping for Google OAuth
             * Handles initial user data and profile image upload to Cloudinary
             */
            async profile(profile) {
                const imageUrl = profile.picture;
                // Upload profile picture to Cloudinary on first sign-in
                const cloudinaryUrl = await uploadExternalImageToCloudinary(imageUrl);

                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: cloudinaryUrl || imageUrl,
                    admin: false,  // Default admin status
                    banned: false, // Default banned status
                };
            },
        }),

        // Credentials provider for email/password login
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: "email",
                    type: "email",
                    placeholder: "Enter your email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize(credentials) {
                // Validate required credentials
                if (!credentials?.email || !credentials?.password) return null;

                const email = credentials.email;
                const password = credentials.password;

                // Ensure database connection
                if (mongoose.connection.readyState === 0) {
                    await mongoose.connect(process.env.MONGO_URL!);
                }

                // Find user and include password and admin fields
                const user = await User.findOne({ email }).select('+password +admin');
                if (!user || !user.password || typeof user.password !== 'string') {
                    console.log("User not found or missing password");
                    return null;
                }

                // Verify password using bcrypt
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) return null;

                // Return user object for successful authentication
                return {
                    id: (user._id as string | mongoose.Types.ObjectId).toString(),
                    name: user.name ?? "",
                    email: user.email,
                    image: user.image,
                    admin: user.admin ?? false,
                };
            }
        })
    ],

    // Authentication callbacks for custom logic
    callbacks: {
        /**
         * SignIn callback - handles user validation and database updates
         * - Checks if user is banned
         * - Updates last login timestamp for existing users
         */
        async signIn({ user, account }) {
            const db = (await clientPromise).db();
            const users = db.collection("users");

            // Check if user exists and is banned
            const existingUser = await users.findOne({ email: user.email });
            if (existingUser?.banned) {
                throw new Error("UserBanned"); // Custom error for banned users
            }

            const now = new Date();

            if (existingUser) {
                // Update last login timestamp for existing users
                await users.updateOne(
                    { _id: existingUser._id },
                    { $set: { updatedAt: now } }
                );

                // Optionally sync Google profile image if it changed
                if (account?.provider === 'google' && user.image && user.image !== existingUser.image) {
                    // Only update if it's a Cloudinary URL or if we want to re-upload
                    // For simplicity, we'll just update the timestamp for now
                }
            }

            return true; // Allow sign in - Adapter will handle creation if needed
        },

        /**
         * JWT callback - manages JWT token content
         * - Adds user info to token on sign in
         * - Updates token when session is updated
         */
        async jwt({ token, user, trigger, session }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.name = user.name ?? undefined;
                token.email = user.email ?? undefined;
                token.image = user.image ?? undefined;
                token.admin = (user as any).admin ?? false;
            }

            // Handle manual session updates
            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.image) token.image = session.user.image;
                if (session.user.email) token.email = session.user.email;
                if (typeof session.user.admin === 'boolean') token.admin = session.user.admin;
            }

            return token;
        },

        /**
         * Session callback - populates session with user data
         * - Enhances session with user info from token
         * - Fetches additional user data from database
         * - Checks for banned status on each session creation
         */
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.name = (token.name as string) || session.user.name;
                session.user.email = (token.email as string) || session.user.email;
                session.user.image = (token.image as string) || session.user.image;
                session.user.admin = (token.admin as boolean) ?? false;
                session.user.address = "";
                session.user.gender = "";

                try {
                    // Fetch fresh profile data from DB to ensure sync (admin status, banned, etc.)
                    const db = (await clientPromise).db();
                    const found = await db.collection("users").findOne(
                        { email: session.user.email },
                        { projection: { address: 1, gender: 1, image: 1, admin: 1, banned: 1 } }
                    );

                    if (found) {
                        session.user.address = found.address ?? "";
                        session.user.gender = found.gender ?? "";
                        session.user.image = found.image ?? session.user.image;
                        session.user.admin = found.admin ?? session.user.admin;

                        // Security check: Terminate session if user was banned while logged in
                        if (found.banned) {
                            return null as any;
                        }
                    }
                } catch (error) {
                    console.error("Error in session callback database fetch:", error);
                    // Continue with token info if DB fetch fails to prevent breaking the session
                }
            }

            return session;
        },
    },

    // Secret key for encrypting tokens
    secret: process.env.NEXTAUTH_SECRET,
};