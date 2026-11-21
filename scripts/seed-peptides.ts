import postgres from "postgres";
import { PEPTIDES } from "../src/lib/peptides/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(url, { ssl: "require", max: 1 });

  for (const p of PEPTIDES) {
    const result = await sql`
      INSERT INTO peptides (id, canonical_name, synonyms, category, fda_status)
      SELECT gen_random_uuid(), ${p.canonicalName}, ${p.synonyms}, ${p.category}, ${p.fdaStatus}
      WHERE NOT EXISTS (
        SELECT 1 FROM peptides WHERE canonical_name = ${p.canonicalName}
      )
      RETURNING id
    `;
    console.log(result.length ? `Inserted: ${p.canonicalName}` : `Exists:   ${p.canonicalName}`);
  }

  await sql.end();
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
