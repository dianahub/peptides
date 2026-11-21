import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";

async function main() {
  const url = process.env.STAGING_DATABASE_URL;
  if (!url) {
    console.error("STAGING_DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(url, { max: 1, ssl: "require" });
  const db = drizzle(client);

  console.log("Running migrations against staging…");
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle/migrations"),
  });
  console.log("Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
