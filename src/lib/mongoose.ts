/**
 * This file handles the connection to the MongoDB database using Mongoose.
 * We use a "cached connection" strategy to prevent opening too many connections
 * during development (when the code reloads frequently).
 */

import mongoose from "mongoose";

// Get the MongoDB connection URL from our environment variables (.env file)
const MONGO_URL = process.env.MONGO_URL;

// If the URL is missing, we stop the app and show an error
if (!MONGO_URL) {
    throw new Error('Please define the MONGO_URL environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across "Hot Module Replacement" (HMR)
 * in development. This keeps our connection alive between code changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

// If there's no cached connection yet, initialize it
if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Main function to connect to the database.
 */
async function dbConnect() {
    // 1. If we already have an active connection, just return it
    if (cached.conn) {
        return cached.conn;
    }

    // 2. If we don't have a connection promise yet, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Don't queue commands if the database is down
        };

        // Start connecting to the database
        cached.promise = mongoose.connect(MONGO_URL!, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    // 3. Wait for the connection promise to finish and store the active connection
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        // If something goes wrong, reset the promise so we can try again later
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;

