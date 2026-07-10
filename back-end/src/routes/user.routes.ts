import { Router } from "express";
import { UserController } from "../controllers/user.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const router = Router();
const controller = new UserController();

router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", authenticate, (req, res) => controller.update(req, res));
router.delete("/:id", authenticate, (req, res) => controller.delete(req, res));
router.get("/:id", authenticate, (req, res) => controller.findById(req, res));

export { router as userRoutes };
