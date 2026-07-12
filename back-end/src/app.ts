import express, { type Express } from "express";
import { userRoutes } from "./routes/users.routes.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { categoryRoutes } from "./routes/categories.routes.ts";
import { tasksRoutes } from "./routes/tasks.routes.ts";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiDoc } from "./config/openapi.ts";
import cors from "cors";

const app: Express = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(buildOpenApiDoc()));
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/tasks", tasksRoutes);

app.use(errorHandler);

export { app };
