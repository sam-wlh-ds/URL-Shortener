import { Router } from "express";
import redirectController from "../controllers/redirectController.js";

const redirect = Router();

redirect.get("/:url", redirectController);

export default redirect;