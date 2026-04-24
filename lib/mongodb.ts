import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

const mongoUrl = process.env.MONGODB_URL || "";
if (!mongoUrl) {
    throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    }
}

async function connectDB() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        const opts = {
            bufferCommands: false
        };
        cached.promise = mongoose.connect(mongoUrl, opts).then((mongoose) => {
            return mongoose;
        })
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}

export default connectDB;

