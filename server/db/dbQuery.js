import UrlModel from "../models/UrlModel.js";
import { redisClient } from "./dbConnect.js";

async function getLongUrl(shortUrl) {
    try {
        const cacheUrl = await redisClient.get(shortUrl);
        console.log(shortUrl, cacheUrl);
        if (cacheUrl) {
            try {
                return JSON.parse(cacheUrl);
            } catch (parseError) {
                console.warn(
                    `Redis: Failed to parse JSON from cache for ${shortUrl}. Error: ${parseError.message}. Falling back to MongoDB.`
                );
            }
        }
    } catch (redisError) {
        console.error(
            `Redis Error for ${shortUrl}: ${redisError.message}. Falling back to MongoDB.`
        );
    }

    try {
        const url = await UrlModel.findOne({ shortUrl });
        if (!url) {
            throw new Error("Url not found");
        }
        return url;
    } catch (mongoDBError) {
        throw new Error(mongoDBError.message || "Failed to fetch url");
    }
}

export { getLongUrl };
