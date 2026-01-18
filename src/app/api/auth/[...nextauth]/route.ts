// import User from "@/app/models/User";
// import bcrypt from "bcryptjs";
// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { MongoDBAdapter } from "@auth/mongodb-adapter"
// import clientPromise from "@/lib/mongoConnect";
// import mongoose from "mongoose";

// declare module "next-auth" {
//     interface User {
//         id: string;
//         admin?: boolean;
//     }

//     interface Session {
//         user: {
//             id: string;
//             name: string;
//             email: string;
//             image?: string;
//             address?: string;
//             gender?: string;
//             admin: boolean;
//         };
//     }
// }

// declare module "next-auth/jwt" {
//     interface JWT {
//         id?: string;
//         name?: string;
//         email?: string;
//         image?: string;
//         admin?: boolean;
//     }
// }

// export const authOptions: NextAuthOptions = {
//     adapter: MongoDBAdapter(clientPromise),
//     session: {
//         strategy: "jwt",
//         maxAge: 30 * 24 * 60 * 60,
//     },
//     pages: {
//         signIn: '/login',
//         error: '/login',
//     },
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//             allowDangerousEmailAccountLinking: true,
//         }),
//         CredentialsProvider({
//             name: 'Credentials',
//             credentials: {
//                 email: { label: "email", type: "email", placeholder: "Enter your email" },
//                 password: { label: "Password", type: "password" }
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email || !credentials?.password) return null;

//                 const email = credentials.email;
//                 const password = credentials.password;

//                 if (mongoose.connection.readyState === 0) {
//                     await mongoose.connect(process.env.MONGO_URL!);
//                 }

//                 const user = await User.findOne({ email }).select('+password +admin');
//                 if (!user || !user.password || typeof user.password !== 'string') {
//                     console.log("User not found or missing password");
//                     return null;
//                 }

//                 const valid = await bcrypt.compare(password, user.password);
//                 if (!valid) return null;

//                 return {
//                     id: (user._id as string | mongoose.Types.ObjectId).toString(),
//                     name: user.name ?? "",
//                     email: user.email,
//                     image: user.image,
//                     admin: user.admin ?? false,
//                 };
//             }
//         })
//     ],
//     callbacks: {
//         async signIn({ user }) {
//             const db = (await clientPromise).db();
//             const users = db.collection("users");

//             const existingUser = await users.findOne({ email: user.email });

//             if (existingUser?.banned) {
//                 throw new Error("UserBanned");
//             }

//             const now = new Date();

//             if (!existingUser) {
//                 // First-time login (Google OAuth)
//                 await users.insertOne({
//                     name: user.name,
//                     email: user.email,
//                     image: user.image,
//                     createdAt: now,
//                     updatedAt: now,
//                     admin: false,
//                     banned: false,
//                 });
//             } else {
//                 // Always update last login
//                 await users.updateOne(
//                     { _id: existingUser._id },
//                     { $set: { updatedAt: now } }
//                 );
//             }

//             return true;
//         },

//         async jwt({ token, user, trigger, session }) {
//             if (user) {
//                 token.id = user.id;
//                 token.name = user.name ?? undefined;
//                 token.email = user.email ?? undefined;
//                 token.image = user.image ?? undefined;
//                 token.admin = user.admin ?? false;
//             }

//             if (trigger === "update" && session?.user) {
//                 const u = session.user as { name?: string; email?: string; image?: string; admin?: boolean };
//                 if (u.name) token.name = u.name;
//                 if (u.image) token.image = u.image;
//                 if (u.email) token.email = u.email;
//                 if (typeof u.admin === 'boolean') token.admin = u.admin;
//             }

//             return token;
//         },
//         async session({ session, token }) {
//             if (session.user) {
//                 session.user = {
//                     id: token.id as string,
//                     name: token.name ?? session.user.name,
//                     email: token.email ?? session.user.email,
//                     image: token.image,
//                     address: "",
//                     gender: "",
//                     admin: token.admin ?? false,
//                 };
//             }

//             const db = (await clientPromise).db();
//             const found = await db.collection("users").findOne(
//                 { email: token.email },
//                 { projection: { address: 1, gender: 1, image: 1, admin: 1, banned: 1 } }
//             );

//             if (found) {
//                 session.user!.address = found.address ?? "";
//                 session.user!.gender = found.gender ?? "";
//                 session.user!.image = found.image ?? session.user?.image;
//                 session.user!.admin = found.admin ?? session.user?.admin;
//                 if (found.banned) {
//                     return null!;
//                 }
//             }

//             return session;
//         },
//     },
//     secret: process.env.NEXTAUTH_SECRET,
// };

// export const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };








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

// Create NextAuth handler with custom configuration
const handler = NextAuth(authOptions);

// Export handlers for both GET and POST requests
export { handler as GET, handler as POST };