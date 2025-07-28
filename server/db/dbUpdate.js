import UrlModel from "../models/UrlModel.js";
import { redisClient } from "./dbConnect.js";

async function updateDBFromCache() {
    let cursor = '0';
    let keysUpdated = 0;

    console.log("Starting updateDBFromCache...");

    try {
        do {
            const reply = await redisClient.scan(cursor, { MATCH: '*', COUNT: 100 });

            cursor = reply.cursor; 
            const shortUrlKeys = reply.keys;


            for (const key of shortUrlKeys) {
                try {
                    const cacheValue = await redisClient.get(key);

                    if (cacheValue) {
                        const parsedUrl = JSON.parse(cacheValue);

                        if (parsedUrl.shortUrl === key && typeof parsedUrl.usedCount === 'number') {
                            const result = await UrlModel.findOneAndUpdate(
                                { shortUrl: key },
                                { $set: { usedCount: parsedUrl.usedCount } },
                                { new: true }
                            );

                            if (result) {
                                console.log(`Updated usedCount for ${key} in MongoDB. New count: ${result.usedCount}`);
                                keysUpdated++;
                            } else {
                                console.warn(`MongoDB: Document for shortUrl ${key} not found for update.`);
                            }
                        } else {
                            console.warn(`Redis key ${key} did not contain expected 'shortUrl' or 'usedCount' in JSON.`);
                        }
                    } else {
                        console.warn(`Redis key ${key} had no value.`);
                    }
                } catch (innerError) {
                    console.error(`Error processing Redis key ${key}: ${innerError.message}`);
                }
            }
        } while (cursor !== '0');

        console.log(`Finished updateDBFromCache. Total keys processed: ${keysUpdated}`);

    } catch (outerError) {
        console.error(`Error during updateDBFromCache process: ${outerError.message}`);
    }
}

async function updateCacheFromDB() {
    console.log("Starting updateCacheFromDB with percentile-based popularity threshold...");

    try {
        // await redisClient.flushall();
        await redisClient.sendCommand(['FLUSHALL']);
        console.log("Redis cache flushed.");

        let urlsCachedCount = 0;
        const allUrls = await UrlModel.find({}, { usedCount: 1, shortUrl: 1, longUrl: 1, createdAt: 1 }).lean();

        if (allUrls.length === 0) {
            console.log("No URLs found in the database. Exiting updateCacheFromDB.");
            return;
        }

        const validUsedCounts = [];
        for (const url of allUrls) {
            if (typeof url.usedCount === 'number' && url.usedCount >= 0) {
                validUsedCounts.push(url.usedCount);
            }
        }

        if (validUsedCounts.length === 0) {
            console.warn("No valid 'usedCount' values found in the database to calculate popularity. Exiting.");
            return;
        }

        validUsedCounts.sort((a, b) => a - b);

        const percentileToCache = 80;
        const index = Math.floor((percentileToCache / 100) * (validUsedCounts.length - 1));
        let popularityThreshold = validUsedCounts[index];

        popularityThreshold = Math.max(popularityThreshold, 1);

        console.log(`Calculated ${percentileToCache}th percentile usedCount: ${popularityThreshold}`);

        for (const urlDoc of allUrls) {
            if (urlDoc.usedCount >= popularityThreshold) {
                try {
                    await redisClient.set(urlDoc.shortUrl, JSON.stringify(urlDoc));
                    urlsCachedCount++;
                    console.log(`Cached ${urlDoc.shortUrl} (usedCount: ${urlDoc.usedCount}) - meets threshold of ${popularityThreshold}`);
                } catch (redisSetError) {
                    console.error(`Error caching ${urlDoc.shortUrl} to Redis: ${redisSetError.message}`);
                }
            }
        }

        console.log(`Finished updateCacheFromDB. Total URLs cached: ${urlsCachedCount}`);

    } catch (error) {
        console.error(`Error during updateCacheFromDB process: ${error.message}`);
        throw error;
    }
}

export {updateDBFromCache, updateCacheFromDB};