import express, { type Express } from "express";
import { userRoutes } from "./routes/users.routes.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";
import { authRoutes } from "./routes/auth.routes.ts";
import { categoryRoutes } from "./routes/categories.routes.ts";
import { tasksRoutes } from "./routes/tasks.routes.ts";
import { buildOpenApiDoc } from "./config/openapi.ts";
import cors from "cors";

const app: Express = express();

function getRequestOrigin(req: express.Request) {
  const protocolHeader = req.get("x-forwarded-proto") ?? req.protocol;
  const protocol = protocolHeader.split(",")[0]?.trim() || req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host");

  return `${protocol}://${host}`;
}

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get(["/docs", "/docs/"], (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Case Watch API Docs</title>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
	</head>
	<body>
		<div id="swagger-ui"></div>
		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin="anonymous"></script>
		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin="anonymous"></script>
		<script>
			window.onload = function () {
				window.ui = SwaggerUIBundle({
					url: "/openapi.json",
					dom_id: "#swagger-ui",
					deepLinking: true,
					presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
					layout: "BaseLayout"
				});
			};
		</script>
	</body>
</html>`);
});

app.get("/openapi.json", (req, res) => {
  res.json(buildOpenApiDoc(getRequestOrigin(req)));
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/tasks", tasksRoutes);

app.use(errorHandler);

export { app };
