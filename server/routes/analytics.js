import { Router } from "express";
import { getTopUrl } from "../db/dbQuery.js";
import queryController from "../controllers/queryController.js";

const analytics = Router();

analytics.get("/top", async (req,res, next) => {
    try {
        const topUrls = await getTopUrl();
        res.status(200).json(topUrls).end();
    } catch (error) {
        next(error);
    }
});

analytics.get("/search", queryController.searchUrl);

export default analytics;