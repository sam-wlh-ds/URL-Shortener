import UrlModel from "../models/UrlModel.js";
import crypto from "crypto";
import { isSafeUrl } from "../utils/urlSafety.js";

async function createShortUrl(url) {
    if (!url || typeof url !== "string" || !url.trim()) {
        return { success: false, message: "Invalid URL provided." };
    }

    let processedUrl = url.trim();

    const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(processedUrl);
    
    // Add https:// if no protocol is present
    if (!hasProtocol) {
        processedUrl = `https://${processedUrl}`;
    }
    // console.log(processedUrl);
    try{
        const safetyCheck = await isSafeUrl(processedUrl);
        if (!safetyCheck.safe){
            return {
                success: false,
                message: safetyCheck.reason
            }
        }
        const existingUrl = await UrlModel.findOne({ longUrl:processedUrl });
        if (existingUrl) {
            return {
                success: true,
                message: "URL already shortened!",
                shortUrl : existingUrl.shortUrl,
            };
        }
    } catch (error) {console.log(error);}

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
