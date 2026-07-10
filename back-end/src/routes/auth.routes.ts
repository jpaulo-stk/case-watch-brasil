import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";

const router = Router();
const { login } = new AuthController();

router.post("/login", (req, res) => login(req, res));

export { router as authRoutes };
