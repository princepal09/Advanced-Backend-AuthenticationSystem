import express from "express";
import { googleCallBackController, redirectToGoogleController } from "./oauth.controller.js";

const router = express.Router();

router.get("/google", redirectToGoogleController);
router.get("/google/callback", googleCallBackController);

export default router;
