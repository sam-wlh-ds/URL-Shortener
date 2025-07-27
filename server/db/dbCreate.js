import UrlModel from "../models/UrlModel.js";
import crypto from "crypto";

async function createShortUrl(url) {
    if (!url || typeof url !== "string" || !url.trim()) {
        return { success: false, message: "Invalid URL provided." };
    }

    let processedUrl = url.trim();

    // Add https:// if no protocol is present
    if (
        !/^https?:\/\//i.test(processedUrl) ||
        !/^http?:\/\//i.test(processedUrl)
    ) {
        processedUrl = `https://${processedUrl}`;
    }

    const MAX_RETRIES = 5;
    let attempts = 0;
    let shortUrl;

    while (attempts < MAX_RETRIES) {
        shortUrl = crypto.randomBytes(4).toString("hex");

        try {
            const existingUrl = await UrlModel.findOne({ shortUrl });

            if (!existingUrl) {
                const newUrl = new UrlModel({
                    shortUrl,
                    longUrl: processedUrl,
                    createdAt: new Date(),
                });

                await newUrl.save();
                return {
                    success: true,
                    message: "URL shortened successfully!",
                    shortUrl,
                };
            }
        } catch (error) {
            console.error(error);
        }

        attempts++;
    }

    return {
        success: false,
        message:
            "Failed to generate a unique short URL after multiple attempts. Please try again.",
    };
}

export { createShortUrl };
