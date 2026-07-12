import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity.ts";
import { Category } from "../entities/category.entity.ts";
import { Task } from "../entities/task.entity.ts";
import { UserHasTasks } from "../entities/user-has-tasks.entity.ts";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Category, Task, UserHasTasks],
  migrations: ["src/migrations/**/*.ts"],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});
