import { MongoClient, ServerApiVersion } from "mongodb"

/**
 * MongoDB database connection utility
 * 
 * @module mongoConnect
 * @description 
 * - Provides a singleton MongoDB client instance for database operations
 * - Implements connection pooling and reuse across the application
 * - Uses global variable in development to preserve connection during hot reloads
 * - Supports both development and production environments
 * - Implements MongoDB server API versioning for compatibility
 * 
 * @throws {Error} When MONGO_URL environment variable is missing or invalid
 */

// Validate required environment variable
if (!process.env.MONGO_URL) {
    throw new Error('Invalid/Missing environment variable: "MONGO_URL"')
}

/**
 * MongoDB connection URI from environment variables
 * @constant {string}
 */
const uri = process.env.MONGO_URL

/**
 * MongoDB client options configuration
 * @constant {Object}
 * @property {Object} serverApi - MongoDB server API configuration
 * @property {string} serverApi.version - Server API version (v1)
 * @property {boolean} serverApi.strict - Enable strict mode
 * @property {boolean} serverApi.deprecationErrors - Enable deprecation errors
 */
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
}

/**
 * MongoDB client promise instance
 * @type {MongoClient}
 * 
 * @description
 * - Singleton client instance reused across the application
 * - In development: preserved across hot reloads using global variable
 * - In production: new instance created for each process
 */
let clientPromise: MongoClient

/**
 * Connection strategy based on environment
 * @description
 * - Development: Uses global variable to prevent multiple connections during hot reload
 * - Production: Creates new connection for each process
 */
if (process.env.NODE_ENV === "development") {
    /**
     * Extended global type definition for MongoDB client caching
     * @type {typeof globalThis & { _mongoClient?: MongoClient }}
     */
    const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient
    }

    // Create new client only if it doesn't exist in global scope
    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(uri, options)
    }
    clientPromise = globalWithMongo._mongoClient
} else {
    // Production: create new client instance
    clientPromise = new MongoClient(uri, options)
}

/**
 * Exported MongoDB client instance
 * @default
 * @type {MongoClient}
 * 
 * @example
 * // Usage in API routes
 * import clientPromise from '@/lib/mongoConnect'
 * 
 * const client = await clientPromise
 * const db = client.db('pizzaport')
 * const collection = db.collection('menuItems')
 */
export default clientPromise