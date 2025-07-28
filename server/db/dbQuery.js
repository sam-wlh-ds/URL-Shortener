import UrlModel from "../models/UrlModel.js";
import { redisClient } from "./dbConnect.js";

async function getLongUrl(shortUrl) {
    try {
        const cacheUrl = await redisClient.get(shortUrl);
        // console.log(shortUrl, cacheUrl);
        if (cacheUrl) {
            try {
                const parsedUrl = JSON.parse(cacheUrl);
                if (
                    typeof parsedUrl === "object" &&
                    parsedUrl !== null &&
                    "usedCount" in parsedUrl
                ) {
                    parsedUrl.usedCount++;
                    redisClient
                        .set(shortUrl, JSON.stringify(parsedUrl))
                        .catch((setErr) => {
                            console.warn(
                                `Redis: Failed to update usedCount in cache for ${shortUrl}. Error: ${setErr.message}`
                            );
                        });
                } else {
                    console.warn(
                        `Redis: Cached value for ${shortUrl} is not an object with 'usedCount'. Skipping increment.`
                    );
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

async function getTopUrl() {
    try {
        const cachedTopUrls = await redisClient.get("top_urls_list");
        if (cachedTopUrls) {
            console.log("Fetched top URLs from Redis cache.");
            const parsedUrls = JSON.parse(cachedTopUrls);

            parsedUrls.sort((a, b) => b.usedCount - a.usedCount);

            return parsedUrls;
        }
    } catch (redisError) {
        console.warn(
            `Redis Error fetching top URLs: ${redisError.message}. Falling back to MongoDB.`
        );
    }

    // Fallback to MongoDB if not found in cache or Redis had an error
    try {
        const topUrls = await UrlModel.find({})
            .sort({ usedCount: -1 })
            .limit(100)
            .lean();

        if (!topUrls || topUrls.length === 0) {
            return [];
        }

        // Cache the result in Redis for future requests
        if (redisClient.isReady) {
            try {
                await redisClient.set(
                    "top_urls_list",
                    JSON.stringify(topUrls),
                    { EX: 3600 }
                ); // Cache for 1 hour
                console.log("Cached top URLs to Redis.");
            } catch (cacheError) {
                console.warn(
                    `Redis: Failed to cache top URLs. Error: ${cacheError.message}`
                );
            }
        }

        return topUrls;
    } catch (mongoDBError) {
        console.error(
            `MongoDB Error fetching top URLs: ${mongoDBError.message}`
        );
        throw new Error(
            mongoDBError.message || "Failed to fetch top URLs from database."
        );
    }
}

async function getUrlData(inputString) {
    let shortUrl = inputString;

    if (
        inputString.startsWith("http://") ||
        inputString.startsWith("https://")
    ) {
        try {
            const urlObject = new URL(inputString);
            const pathSegments = urlObject.pathname
                .split("/")
                .filter((segment) => segment !== "");
            if (pathSegments.length > 0) {
                shortUrl = pathSegments[pathSegments.length - 1];
            } else {
                throw new Error("Invalid URL format provided.");
            }
        } catch (urlParseError) {
            shortUrl = inputString;
        }
    }

    try {
        const cacheUrl = await redisClient.get(shortUrl);
        if (cacheUrl) {
            try {
                const parsedUrl = JSON.parse(cacheUrl);
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
        return url;
    } catch (mongoDBError) {
        throw new Error(mongoDBError.message || "Failed to fetch url");
    }
}

export { getLongUrl, getTopUrl, getUrlData };
