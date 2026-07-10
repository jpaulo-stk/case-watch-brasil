import express, { type Express } from "express";
import { userRoutes } from "./routes/user.routes.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";

const app: Express = express();

app.use(express.json());

app.use("/users", userRoutes);

app.use(errorHandler);

export { app };
