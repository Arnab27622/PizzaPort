import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongoConnect";
import mongoose from "mongoose";

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
            allowDangerousEmailAccountLinking: true, // Allows linking existing accounts with same email
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
         * SignIn callback - handles user validation and database operations
         * - Checks if user is banned
         * - Creates new user record for OAuth first-time login
         * - Updates last login timestamp
         */
        async signIn({ user }) {
            const db = (await clientPromise).db();
            const users = db.collection("users");

            // Check if user exists and is banned
            const existingUser = await users.findOne({ email: user.email });
            if (existingUser?.banned) {
                throw new Error("UserBanned"); // Custom error for banned users
            }

            const now = new Date();

            if (!existingUser) {
                // First-time OAuth login - create new user record
                await users.insertOne({
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    createdAt: now,
                    updatedAt: now,
                    admin: false,    // Default non-admin
                    banned: false,   // Default not banned
                });
            } else {
                // Update last login timestamp for existing users
                await users.updateOne(
                    { _id: existingUser._id },
                    { $set: { updatedAt: now } }
                );
            }

            return true; // Allow sign in
        },

        /**
         * JWT callback - manages JWT token content
         * - Adds user info to token on sign in
         * - Updates token when session is updated
         */
        async jwt({ token, user, trigger, session }) {
            // Add user info to token during initial authentication
            if (user) {
                token.id = user.id;
                token.name = user.name ?? undefined;
                token.email = user.email ?? undefined;
                token.image = user.image ?? undefined;
                token.admin = user.admin ?? false;
            }

            // Update token when session is manually updated
            if (trigger === "update" && session?.user) {
                const u = session.user as {
                    name?: string;
                    email?: string;
                    image?: string;
                    admin?: boolean
                };
                if (u.name) token.name = u.name;
                if (u.image) token.image = u.image;
                if (u.email) token.email = u.email;
                if (typeof u.admin === 'boolean') token.admin = u.admin;
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
            // Populate session with token data
            if (session.user) {
                session.user = {
                    id: token.id as string,
                    name: token.name ?? session.user.name,
                    email: token.email ?? session.user.email,
                    image: token.image,
                    address: "",     // Placeholder, will be populated from DB
                    gender: "",      // Placeholder, will be populated from DB
                    admin: token.admin ?? false,
                };
            }

            // Fetch additional user data from database
            const db = (await clientPromise).db();
            const found = await db.collection("users").findOne(
                { email: token.email },
                { projection: { address: 1, gender: 1, image: 1, admin: 1, banned: 1 } }
            );

            if (found) {
                // Update session with database values
                session.user!.address = found.address ?? "";
                session.user!.gender = found.gender ?? "";
                session.user!.image = found.image ?? session.user?.image;
                session.user!.admin = found.admin ?? session.user?.admin;

                // Terminate session if user is banned
                if (found.banned) {
                    return null!;
                }
            }

            return session;
        },
    },

    // Secret key for encrypting tokens
    secret: process.env.NEXTAUTH_SECRET,
};