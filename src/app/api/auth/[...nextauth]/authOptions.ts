import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongoConnect";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary for image uploads
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * Upload external image to Cloudinary
 * Downloads image from URL and uploads to Cloudinary.
 * Used for Google OAuth profile pictures.
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
            async profile(profile) {
                // Return default profile structure. Cloudinary upload will be handled
                // in the signIn callback to have better control over existing users.
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
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
                await dbConnect();

                // Find user and include password and admin fields
                const user = await User.findOne({ email }).select('+password +admin +banned +phone');
                if (!user || user.banned) {
                    console.log("User not found or banned");
                    return null;
                }

                if (!user.password || typeof user.password !== 'string') {
                    console.log("User missing password");
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
                    phone: user.phone,
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
            // Ensure database connection
            const db = (await clientPromise).db();
            const users = db.collection("users");

            // Check if user is banned before allowing sign-in
            const existingUser = await users.findOne({ email: user.email });
            if (existingUser?.banned) {
                throw new Error("UserBanned");
            }

            const now = new Date();

            if (account?.provider === 'google') {
                // Handle Google OAuth manually since we're not using the adapter
                if (!existingUser) {
                    // New user from Google
                    let imageUrl = user.image;
                    if (imageUrl) {
                        const cloudinaryUrl = await uploadExternalImageToCloudinary(imageUrl);
                        if (cloudinaryUrl) imageUrl = cloudinaryUrl;
                    }

                    await users.insertOne({
                        name: user.name,
                        email: user.email,
                        image: imageUrl,
                        admin: false,
                        banned: false,
                        createdAt: now,
                        updatedAt: now,
                    });
                } else {
                    // Existing user - Update only necessary fields
                    const updateData: { updatedAt: Date; image?: string } = { updatedAt: now };

                    // If the user doesn't have an image or uses a Google proxy URL, update to Cloudinary
                    if (user.image && (!existingUser.image || existingUser.image.includes('googleusercontent.com'))) {
                        const cloudinaryUrl = await uploadExternalImageToCloudinary(user.image);
                        if (cloudinaryUrl) updateData.image = cloudinaryUrl;
                    }

                    await users.updateOne(
                        { _id: existingUser._id },
                        { $set: updateData }
                    );
                }
            } else if (existingUser) {
                // For Credentials provider, just update timestamp
                await users.updateOne(
                    { _id: existingUser._id },
                    { $set: { updatedAt: now } }
                );
            }

            return true;
        },

        /**
         * JWT callback - manages JWT token content
         * - Adds user info to token on sign in
         * - Updates token when session is updated
         */
        async jwt({ token, user, trigger, session }) {
            // Initial sign in or token setup
            if (user || !token.id) {
                const db = (await clientPromise).db();
                const email = user?.email || token.email;
                if (email) {
                    const found = await db.collection("users").findOne({ email });
                    if (found) {
                        token.id = found._id.toString();
                        token.name = found.name || token.name || "";
                        token.email = found.email || token.email || "";
                        token.image = found.image || user?.image || token.image || "";
                        token.admin = found.admin ?? false;
                        token.banned = found.banned ?? false;
                        token.phone = found.phone || "";
                        token.address = found.address || "";
                        token.gender = found.gender || "";
                    }
                }

                if (user?.id && !token.id) token.id = user.id;
            }

            // Handle manual session updates (e.g. from profile page)
            if (trigger === "update" && session?.user) {
                const u = session.user as {
                    name?: string;
                    image?: string;
                    phone?: string;
                    address?: string;
                    gender?: string;
                    admin?: boolean;
                };
                if (u.name !== undefined) token.name = u.name;
                if (u.image !== undefined) token.image = u.image;
                if (u.phone !== undefined) token.phone = u.phone;
                if (u.address !== undefined) token.address = u.address;
                if (u.gender !== undefined) token.gender = u.gender;
                if (u.admin !== undefined) token.admin = u.admin;
            }

            return token;
        },

        /**
         * Session callback - populates session with user data
         * - OPTIMIZED: Populates session directly from JWT token with zero DB queries
         * - Invalidates session instantly if user is marked banned in token
         */
        async session({ session, token }) {
            // CRITICAL SECURITY: If user is banned, invalidate session
            if (token.banned) {
                return {
                    ...session,
                    user: undefined // Effectively signs out the user on client
                };
            }

            // Populate session with token data (0 DB hits)
            if (session.user) {
                session.user = {
                    id: token.id as string,
                    name: (token.name as string) ?? session.user.name,
                    email: (token.email as string) ?? session.user.email,
                    image: (token.image as string) ?? session.user.image,
                    address: (token.address as string) ?? "",
                    gender: (token.gender as string) ?? "",
                    phone: (token.phone as string) ?? "",
                    admin: (token.admin as boolean) ?? false,
                };
            }

            return session;
        },
    },

    // Secret key for encrypting tokens
    secret: process.env.NEXTAUTH_SECRET,
};
