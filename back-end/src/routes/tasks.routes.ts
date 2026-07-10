import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { TasksController } from "../controllers/tasks.controller.ts";

const router = Router();
const {
  create,
  getTasksByUserId,
  getTaskById,
  updateTask,
  updateStatus,
  deleteTask,
} = new TasksController();

router.post("/", authenticate, (req, res) => create(req, res));
router.get("/", authenticate, (req, res) => getTasksByUserId(req, res));
router.get("/:id", authenticate, (req, res) => getTaskById(req, res));
router.put("/:id", authenticate, (req, res) => updateTask(req, res));
router.patch("/:id/status", authenticate, (req, res) => updateStatus(req, res));
router.delete("/:id", authenticate, (req, res) => deleteTask(req, res));

export { router as tasksRoutes };
