import User from "@/app/models/User";
import dbConnect from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RegisterSchema = z.object({
    name: z.string().min(1, 'Full Name is required').max(50, 'Name is too long'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(50, 'Password is too long'),
});

/**
 * Force dynamic rendering for this API route
 * Prevents static optimization and ensures fresh database connections
 */
export const dynamic = 'force-dynamic';

/**
 * POST /api/register
 * Handles user registration by creating a new user account
 * 
 * This endpoint validates user input, checks for existing users, and creates new user accounts
 * Uses Mongoose ODM for MongoDB operations and includes proper error handling
 * 
 * @param {NextRequest} request - The incoming request containing user registration data
 * 
 * @requestBody {Object} data - User registration data
 * @requestBody {string} data.name - User's full name
 * @requestBody {string} data.email - User's email address (used for authentication)
 * @requestBody {string} data.password - User's password (will be hashed by User model)
 * 
 * @returns {Promise<NextResponse>}
 *   Success: { success: true, userId: string } with 201 status
 *   Client Error: { error: 'Email already exists' } with 400 status
 *   Server Error: { error: string } with 500 status
 * 
 * @throws {Error} Database connection errors, validation errors, environment variable issues
 * 
 * @example
 * // Successful registration
 * POST /api/register
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response: 201
 * {
 *   "success": true,
 *   "userId": "67a1b2c3d4e5f67890123456"
 * }
 * 
 * @example
 * // Email already exists
 * POST /api/register → 400
 * {
 *   "error": "Email already exists"
 * }
 * 
 * @example
 * // Server error
 * POST /api/register → 500
 * {
 *   "error": "Registration failed"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        /**
         * Database Connection
         * Establish connection to MongoDB using Mongoose
         * Connection is cached for reuse
         */
        await dbConnect();

        /**
         * Request Data Parsing & Validation
         * Extract user registration data and validate with Zod
         */
        const body = await request.json();
        const validation = RegisterSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password } = validation.data;

        /**
         * Duplicate User Check
         * Prevent multiple accounts with the same email address
         * Essential for data integrity and user experience
         */
        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 } // Bad Request
            );
        }

        /**
         * User Creation
         * Uses Mongoose model to create new user
         * User model automatically handles password hashing via pre-save middleware
         */
        const user = await User.create({ name, email, password });

        /**
         * Success Response
         * Returns user ID for client reference
         * 201 status indicates successful resource creation
         */
        return NextResponse.json(
            { success: true, userId: user._id },
            { status: 201 } // Created
        );

    } catch (err: unknown) {
        console.error('❌ Error in register:', err);

        // Return a generic error message to the client to avoid leaking sensitive system information
        return NextResponse.json(
            { error: 'Registration failed. Please try again later.' },
            { status: 500 }
        );
    }
}
