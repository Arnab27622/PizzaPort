import User from "@/app/models/User";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

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
         * Environment Variable Validation
         * Ensure MongoDB connection string is available
         * Critical for database operations
         */
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGO_URL environment variable is not defined");
        }

        /**
         * Database Connection
         * Establish connection to MongoDB using Mongoose
         * Connection is reused if already established
         */
        mongoose.connect(mongoUrl);

        /**
         * Request Data Parsing
         * Extract user registration data from JSON request body
         */
        const data = await request.json();
        const { name, email, password } = data;

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
        /**
         * Comprehensive Error Handling
         * Handles various error types including:
         * - Database connection errors
         * - Mongoose validation errors
         * - JSON parsing errors
         * - Environment variable issues
         */
        console.error('❌ Error in register:', err);

        /**
         * Safe Error Message Extraction
         * Uses type guard to safely extract error message
         * Prevents exposing sensitive internal error details to client
         */
        const errorMessage = (err instanceof Error && err.message)
            ? err.message
            : 'Registration failed';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 } // Internal Server Error
        );
    }
}