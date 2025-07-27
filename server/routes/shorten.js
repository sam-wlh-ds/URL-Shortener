import { Router } from "express";
import shortenController from "../controllers/shortenController.js";

const shorten = Router();

shorten.post("/", shortenController);

export default shorten;