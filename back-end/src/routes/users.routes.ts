import { Router } from "express";
import { UsersController } from "../controllers/users.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const router = Router();
const { create, update, delete: deleteUser, findById } = new UsersController();

router.post("/", (req, res) => create(req, res));
router.put("/:id", authenticate, (req, res) => update(req, res));
router.delete("/:id", authenticate, (req, res) => deleteUser(req, res));
router.get("/:id", authenticate, (req, res) => findById(req, res));

export { router as userRoutes };
