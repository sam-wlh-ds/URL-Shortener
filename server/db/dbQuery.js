import UrlModel from "../models/UrlModel.js";

async function getLongUrl(shortUrl) {
  try {
    const url = await UrlModel.findOne({shortUrl});
    if (!url) {
      throw new Error("Url not found");
    }
    return url;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch url");
  }
}


export {getLongUrl};