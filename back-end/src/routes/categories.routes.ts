import { Router } from "express";
import { CategoryController } from "../controllers/categories.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const router = Router();
const {
  createCategory,
  getCategoriesByUserId,
  updateCategory,
  deleteCategory,
} = new CategoryController();

router.get("/", authenticate, (req, res) => getCategoriesByUserId(req, res));
router.post("/", authenticate, (req, res) => createCategory(req, res));
router.put("/:id", authenticate, (req, res) => updateCategory(req, res));
router.delete("/:id", authenticate, (req, res) => deleteCategory(req, res));

export { router as categoryRoutes };
