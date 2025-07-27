import mongoose from "mongoose";
import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();

let redisClient;

async function connectToDB() {
    try {
        await mongoose.connect(process.env.DB_STRING);
        console.log("Connected to MongoDB");

        redisClient = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            }
        });

        redisClient.on("error", (err) => console.error("Redis Client Error", err));

        await redisClient.connect();
        console.log("Connected to Redis");

        await redisClient.set('connection_test_key', 'Redis connection successful!');
        const testValue = await redisClient.get('connection_test_key');
        console.log(`Redis Test Key Value: ${testValue}`);

    } catch (error) {
        console.error("Connection to DBs Failed!", error);
        process.exit(1);
    }
}

function checkDBConnection(req, res, next) {
    const mongooseReadyState = mongoose.connection.readyState;
    const redisConnected = redisClient && redisClient.isReady;

    if (mongooseReadyState !== 1 || !redisConnected) {
        let message = "Service unavailable: ";
        if (mongooseReadyState !== 1) {
            message += "MongoDB not connected. ";
        }
        if (!redisConnected) {
            message += "Redis not connected. ";
        }
        return res.status(503).json({ error: message.trim() });
    }
    next();
}

export { connectToDB, checkDBConnection, redisClient };