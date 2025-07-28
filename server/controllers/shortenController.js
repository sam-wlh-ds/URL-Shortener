import { body, validationResult } from "express-validator";
import { createShortUrl } from "../db/dbCreate.js";

const urlValidate = [
  body("url")
    .trim()
    .isURL().withMessage("Invalid URL")
];

const shortenController = [
    ...urlValidate,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
          return res.status(400).json({ errors: errors.array() });
        }

        const { url } = req.body;
        try{
            const shortUrl = await createShortUrl(url);
            res.status(200).json(shortUrl).end();
        } catch (error){
            next(error);
        }
    }
];

export default shortenController;