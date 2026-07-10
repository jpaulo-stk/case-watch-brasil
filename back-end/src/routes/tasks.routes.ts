import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { TasksController } from "../controllers/tasks.controller.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from "../schemas/task.schema.ts";
import { collaboratorSchema } from "../schemas/collaborator.schema.ts";

const router = Router();
const {
  create,
  getTasksByUserId,
  getTaskById,
  updateTask,
  updateStatus,
  deleteTask,
  addCollaborator,
  getCollaborators,
  removeCollaborator,
} = new TasksController();

router.post("/", authenticate, validateBody(createTaskSchema), (req, res) =>
  create(req, res),
);
router.get("/", authenticate, (req, res) => getTasksByUserId(req, res));
router.get("/:id", authenticate, (req, res) => getTaskById(req, res));
router.patch("/:id", authenticate, validateBody(updateTaskSchema), (req, res) =>
  updateTask(req, res),
);
router.patch(
  "/:id/status",
  authenticate,
  validateBody(updateStatusSchema),
  (req, res) => updateStatus(req, res),
);
router.delete("/:id", authenticate, (req, res) => deleteTask(req, res));
router.post(
  "/:id/collaborators",
  authenticate,
  validateBody(collaboratorSchema),
  (req, res) => addCollaborator(req, res),
);
router.get("/:id/collaborators", authenticate, (req, res) =>
  getCollaborators(req, res),
);
router.delete("/:id/collaborators/:collaboratorId", authenticate, (req, res) =>
  removeCollaborator(req, res),
);

export { router as tasksRoutes };
