/**
 * Loader shim: copies STAGING_DATABASE_URL onto DATABASE_URL in-process,
 * then dynamic-imports the target script. Keeps connection strings out of
 * command lines.
 *
 * Usage (via npm script):
 *   npx tsx --env-file=.env.local scripts/run-as-staging.ts <target> [args...]
 */

import path from "node:path";

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: run-as-staging <script-path> [args...]");
    process.exit(1);
  }
  const staging = process.env.STAGING_DATABASE_URL;
  if (!staging) {
    console.error("STAGING_DATABASE_URL is not set (expected in .env.local)");
    process.exit(1);
  }
  process.env.DATABASE_URL = staging;

  // Hand remaining args to the target script.
  process.argv = [process.argv[0], path.resolve(target), ...process.argv.slice(3)];

  await import(path.resolve(process.cwd(), target));
}

main().catch((err) => { console.error(err); process.exit(1); });
