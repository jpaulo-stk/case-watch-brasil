import express, { type Express } from "express";
import { userRoutes } from "./routes/users.routes.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { categoryRoutes } from "./routes/categories.routes.ts";
import { tasksRoutes } from "./routes/tasks.routes.ts";

const app: Express = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/tasks", tasksRoutes);

app.use(errorHandler);

export { app };
