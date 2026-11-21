import postgres from "postgres";
import { PEPTIDES } from "../src/lib/peptides/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(url, { ssl: "require", max: 1 });

  for (const p of PEPTIDES) {
    const updated = await sql`
      UPDATE peptides
      SET synonyms = ${p.synonyms},
          category = ${p.category},
          fda_status = ${p.fdaStatus},
          fda_indication = ${p.fdaIndication}
      WHERE canonical_name = ${p.canonicalName}
      RETURNING id
    `;
    if (updated.length) {
      console.log(`Updated: ${p.canonicalName}`);
      continue;
    }
    await sql`
      INSERT INTO peptides (
        id, canonical_name, synonyms, category, fda_status, fda_indication
      )
      VALUES (
        gen_random_uuid(),
        ${p.canonicalName},
        ${p.synonyms},
        ${p.category},
        ${p.fdaStatus},
        ${p.fdaIndication}
      )
    `;
    console.log(`Inserted: ${p.canonicalName}`);
  }

  await sql.end();
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
