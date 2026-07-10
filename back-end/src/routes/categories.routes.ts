import { Router } from "express";
import { CategoryController } from "../controllers/categories.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { createCategorySchema } from "../schemas/category.schema.ts";

const router = Router();
const { createCategory, getCategoriesByUserId, updateCategory, deleteCategory } =
  new CategoryController();

router.get("/", authenticate, (req, res) => getCategoriesByUserId(req, res));
router.post("/", authenticate, validateBody(createCategorySchema), (req, res) =>
  createCategory(req, res),
);
router.put(
  "/:id",
  authenticate,
  validateBody(createCategorySchema),
  (req, res) => updateCategory(req, res),
);
router.delete("/:id", authenticate, (req, res) => deleteCategory(req, res));

export { router as categoryRoutes };
