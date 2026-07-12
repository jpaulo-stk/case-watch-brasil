import "reflect-metadata";
import "dotenv/config";
import serverless from "serverless-http";
import { app } from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";

const serverlessHandler = serverless(app);

let dataSourceReady: Promise<unknown> | null = null;

function ensureDataSource(): Promise<unknown> {
  if (!dataSourceReady) {
    dataSourceReady = AppDataSource.initialize();
  }
  return dataSourceReady;
}

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDataSource();
  return serverlessHandler(event, context);
};
