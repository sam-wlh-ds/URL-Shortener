import { getLongUrl } from "../db/dbQuery.js";

const redirectController = [
    async (req, res, next) => {
        const { url } = req.params;
        console.log(url);
        try{
            const {longUrl} = await getLongUrl(url);
            // console.log(longUrl);
            if (longUrl){
                res.redirect(longUrl);
            } else {
                res.status(404).json({message: "Invalid Url"});
            }
        } catch (error){
            next(error);
        }
    }
];

export default redirectController;