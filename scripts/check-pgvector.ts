import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(url, { ssl: "require", max: 1 });

  const [ver] = await sql`SELECT version()`;
  console.log("PG version:", ver.version.split(" ").slice(0, 2).join(" "));

  const exts = await sql`
    SELECT name, default_version
    FROM pg_available_extensions
    WHERE name = 'vector'
  `;
  if (exts.length > 0) {
    console.log(`pgvector: AVAILABLE (version ${exts[0].default_version})`);
  } else {
    console.log("pgvector: NOT AVAILABLE on this host");
  }

  const installed = await sql`
    SELECT extversion FROM pg_extension WHERE extname = 'vector'
  `;
  console.log("pgvector already installed:", installed.length > 0
    ? `YES (${installed[0].extversion})`
    : "NO");

  await sql.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
