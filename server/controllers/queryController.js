import { getUrlData } from "../db/dbQuery.js"; 
const queryController = {};

queryController.searchUrl = async (req, res, next) => {
    const shortUrl = req.query.shortUrl;

    if (!shortUrl) {
        return res.status(400).json({ message: "Short URL query parameter is required." });
    }

    try {
        const urlData = await getUrlData(shortUrl);

        if (urlData) {
            res.status(200).json(urlData);
        } else {
            res.status(404).json({ message: "URL not found." });
        }
    } catch (error) {
        console.error("Error in queryController.searchUrl:", error.message);
        next(error);
    }
};

export default queryController;