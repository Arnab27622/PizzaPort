/**
 * This file provides a direct MongoDB client connection using the official MongoDB driver.
 * It is primarily used by NextAuth to store session data in the database.
 */

import { MongoClient, ServerApiVersion } from "mongodb"

// Ensure the MongoDB URL is present in the environment variables
if (!process.env.MONGO_URL) {
    throw new Error('Invalid/Missing environment variable: "MONGO_URL"')
}

const uri = process.env.MONGO_URL
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

/**
 * We handle the connection differently in development vs production.
 */
if (process.env.NODE_ENV === "development") {
    /**
     * In development mode:
     * Next.js frequently reloads modules (HMR). Using a global variable ensures
     * that we reuse the same database connection instead of creating a new one
     * every time the code changes.
     */
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
} else {
    /**
     * In production mode:
     * We don't need global variables because the server instance stays alive.
     * We just create a new client and connect.
     */
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
}

/**
 * Export the connection promise.
 * Other parts of the app (like NextAuth) will wait for this promise to resolve
 * before trying to talk to the database.
 */
export default clientPromise

