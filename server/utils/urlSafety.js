import { redisClient } from '../db/dbConnect.js';
import dotenv from "dotenv";
dotenv.config();

const REDIS_BLACKLIST_KEY = process.env.REDIS_BLACKLIST_KEY;
const BLACKLIST_TTL_SECONDS = process.env.BLACKLIST_TTL_SECONDS;

let inMemoryBlacklistedDomains = new Set();

async function refreshBlacklistFromSource() {
  const blacklistUrl = process.env.BLACKLIST_URL;
  console.log("Attempting to refresh URL blacklist from GitHub and store in Redis...");

  try {
    const response = await fetch(blacklistUrl);
    if (!response.ok) {
      console.error(`Failed to fetch blacklist from GitHub: ${response.status} ${response.statusText}`);
      return false;
    }
    const data = await response.json();

    if (data && Array.isArray(data.links)) {
      const newBlacklistArray = data.links.map(domain => domain.toLowerCase());
      const newBlacklistSet = new Set(newBlacklistArray);

      inMemoryBlacklistedDomains = newBlacklistSet;

      if (redisClient.isReady) {
        await redisClient.set(REDIS_BLACKLIST_KEY, JSON.stringify(newBlacklistArray), { EX: BLACKLIST_TTL_SECONDS });
        console.log(`Blacklist successfully refreshed from GitHub and stored in Redis. Total domains: ${newBlacklistSet.size}`);
        return true;
      } else {
        console.warn("Redis client not connected, cannot store blacklist in Redis.");
        return false;
      }
    } else {
      console.error("Fetched blacklist is not in the expected {links: []} format from GitHub.");
      return false;
    }
  } catch (error) {
    console.error("Error refreshing blacklist from GitHub:", error.message);
    return false;
  }
}

async function loadBlacklistFromRedis() {
  console.log("Attempting to load URL blacklist from Redis...");
  try {
    const cachedBlacklist = await redisClient.get(REDIS_BLACKLIST_KEY);
    if (cachedBlacklist) {
      const parsedList = JSON.parse(cachedBlacklist);
      if (Array.isArray(parsedList)) {
        inMemoryBlacklistedDomains = new Set(parsedList);
        console.log(`Blacklist loaded from Redis. Total domains: ${inMemoryBlacklistedDomains.size}`);
        return true;
      } else {
        console.error("Cached blacklist in Redis is not an array.");
        return false;
      }
    } else {
      console.log("No blacklist found in Redis.");
      return false;
    }
  } catch (error) {
    console.error("Error loading blacklist from Redis:", error.message);
    return false;
  }
}

// --- Initial Blacklist Loading Strategy ---
async function initializeBlacklist() {
  const loadedFromRedis = await loadBlacklistFromRedis();
  if (!loadedFromRedis) {
    console.log("Blacklist not found in Redis or failed to load. Refreshing from source...");
    await refreshBlacklistFromSource();
  }
}

/**
 * @returns {Promise<{safe: boolean, reason: string}>}.
 */
async function isSafeUrl(url) {
  if (inMemoryBlacklistedDomains.size === 0) {
      console.warn("Blacklist is empty. All URLs will be considered safe by this check.");
      // throw an error or return unsafe if the list is critical.
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    for (const badDomain of inMemoryBlacklistedDomains) {
      if (hostname === badDomain || hostname.endsWith(`.${badDomain}`)) {
        return { safe: false, reason: `Domain '${hostname}' is blacklisted.` };
      }
    }

    return { safe: true, reason: 'URL is safe by custom blacklist.' };

  } catch (error) {
    console.error(`Error checking URL safety for ${url}:`, error.message);
    return { safe: false, reason: `Invalid URL format or internal safety check error: ${error.message}` };
  }
}

export { isSafeUrl, refreshBlacklistFromSource, initializeBlacklist };