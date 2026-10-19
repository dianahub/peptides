import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
}

function createClient() {
  return postgres(process.env.DATABASE_URL!, {
    max: 3,
    connect_timeout: 10,
    idle_timeout: 20,
    ssl: "require",
  });
}

// Reuse client across hot reloads in dev; create fresh in prod/serverless
const client = globalThis._pgClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis._pgClient = client;
}

export const db = drizzle(client, { schema });
