import { Router } from "express";
import { UsersController } from "../controllers/users.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.ts";

const router = Router();
const {
  create,
  update,
  delete: deleteUser,
  findById,
  search,
} = new UsersController();

router.post("/", validateBody(createUserSchema), (req, res) =>
  create(req, res),
);
router.get("/search", authenticate, (req, res) => search(req, res));
router.put("/:id", authenticate, validateBody(updateUserSchema), (req, res) =>
  update(req, res),
);
router.delete("/:id", authenticate, (req, res) => deleteUser(req, res));
router.get("/:id", authenticate, (req, res) => findById(req, res));

export { router as userRoutes };
