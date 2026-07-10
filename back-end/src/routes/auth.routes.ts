import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { loginSchema } from "../schemas/auth.schema.ts";

const router = Router();
const { login } = new AuthController();

router.post("/login", validateBody(loginSchema), (req, res) => login(req, res));

export { router as authRoutes };
