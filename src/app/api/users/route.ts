import clientPromise from '@/lib/mongoConnect';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

/**
 * GET /api/admin/users
 * Retrieves a list of all users in the system (Admin only)
 * 
 * This endpoint provides comprehensive user management data for administrative purposes.
 * It returns all user accounts with essential profile and account status information.
 * 
 * @returns {Promise<NextResponse>} 
 *   Success: Array of user objects with projected fields
 *   Unauthorized: 401 if not logged in
 *   Forbidden: 403 if not an admin
 *   Error: Internal server error (handled by Next.js)
 * 
 * @security Admin access required
 * 
 * @example
 * // Successful response
 * GET /api/admin/users → 200
 * [
 *   {
 *     "_id": "67a1b2c3d4e5f67890123456",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "image": "/uploads/profile.jpg",
 *     "gender": "male",
 *     "address": "123 Main St",
 *     "admin": false,
 *     "banned": false,
 *     "createdAt": "2024-01-15T10:30:00.000Z",
 *     "updatedAt": "2024-01-20T14:22:00.000Z"
 *   }
 * ]
 * 
 * @data_security Only returns non-sensitive user fields
 * @performance Uses projection to limit returned fields and improve response time
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user?.admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  /**
   * Database Connection and Query
   * Establishes connection and retrieves all users with field projection
   */
  const db = (await clientPromise).db();

  /**
   * User Data Retrieval with Field Projection
   * Selects specific fields to return, excluding sensitive data like passwords
   * Includes administrative fields (admin, banned) and timestamps for management
   */
  const users = await db.collection('users')
    .find({}, {
      projection: {
        name: 1,        // User's display name
        email: 1,       // User's email address
        image: 1,       // Profile picture URL
        gender: 1,      // User's gender
        address: 1,     // User's address
        admin: 1,       // Administrator privilege flag
        banned: 1,      // Account suspension status
        createdAt: 1,   // Account creation timestamp
        updatedAt: 1,   // Last profile update timestamp
      }
    })
    .toArray();

  /**
   * Response
   * Returns complete user list with projected fields
   * MongoDB documents are automatically serialized to JSON
   */
  return NextResponse.json(users);
}