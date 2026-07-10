import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";

const router = Router();
const controller = new AuthController();

router.post("/login", (req, res) => controller.login(req, res));

export { router as authRoutes };
