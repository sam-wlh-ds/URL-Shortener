import UrlModel from "../models/UrlModel.js";
import { redisClient } from "./dbConnect.js";

async function getLongUrl(shortUrl) {
    try {
        const cacheUrl = await redisClient.get(shortUrl);
        // console.log(shortUrl, cacheUrl);
        if (cacheUrl) {
            try {
                const parsedUrl = JSON.parse(cacheUrl);
                if (typeof parsedUrl === 'object' && parsedUrl !== null && 'usedCount' in parsedUrl) {
                    parsedUrl.usedCount++;
                    redisClient.set(shortUrl, JSON.stringify(parsedUrl)).catch(setErr => {
                        console.warn(`Redis: Failed to update usedCount in cache for ${shortUrl}. Error: ${setErr.message}`);
                    });
                } else {
                    console.warn(`Redis: Cached value for ${shortUrl} is not an object with 'usedCount'. Skipping increment.`);
                }
                return parsedUrl;
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
        url.usedCount++;
        await url.save();
        return url;
    } catch (mongoDBError) {
        throw new Error(mongoDBError.message || "Failed to fetch url");
    }
}

export { getLongUrl };
