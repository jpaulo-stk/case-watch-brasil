import "reflect-metadata";
import "dotenv/config";
import serverless from "serverless-http";
import { app } from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";

// serverless-http adapts the Express app to the Lambda event/context signature.
const serverlessHandler = serverless(app);

// The DataSource is initialized once and reused across warm invocations of the
// same Lambda container (connection pooling). We memoize the init promise so
// concurrent invocations don't race to initialize it twice.
let dataSourceReady: Promise<unknown> | null = null;

function ensureDataSource(): Promise<unknown> {
  if (!dataSourceReady) {
    dataSourceReady = AppDataSource.initialize();
  }
  return dataSourceReady;
}

// event/context are loosely typed to avoid pulling in @types/aws-lambda.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = async (event: any, context: any) => {
  // Don't wait for the (long-lived) DB pool to drain before returning — keeps
  // the connection alive between warm invocations.
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDataSource();
  return serverlessHandler(event, context);
};
