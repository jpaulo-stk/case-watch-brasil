import "dotenv/config";
import { app } from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";

const PORT = process.env.PORT ?? 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize the Data Source:", error);
    process.exit(1);
  });
