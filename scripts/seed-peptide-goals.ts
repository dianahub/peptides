import postgres from "postgres";
import { PEPTIDES } from "../src/lib/peptides/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(url, { ssl: "require", max: 1 });

  let inserted = 0;
  let existed = 0;
  let missing = 0;

  for (const p of PEPTIDES) {
    for (const goalSlug of p.goals) {
      const result = await sql`
        INSERT INTO peptide_goals (peptide_id, goal_id)
        SELECT pep.id, g.id
        FROM peptides pep, goals g
        WHERE pep.canonical_name = ${p.canonicalName}
          AND g.slug = ${goalSlug}
        ON CONFLICT (peptide_id, goal_id) DO NOTHING
        RETURNING peptide_id
      `;
      if (result.length) {
        inserted++;
        console.log(`Linked: ${p.canonicalName} → ${goalSlug}`);
      } else {
        // Either link exists, or one side is missing. Disambiguate.
        const [check] = await sql`
          SELECT
            EXISTS (SELECT 1 FROM peptides WHERE canonical_name = ${p.canonicalName}) AS has_peptide,
            EXISTS (SELECT 1 FROM goals WHERE slug = ${goalSlug}) AS has_goal
        `;
        if (!check.has_peptide || !check.has_goal) {
          missing++;
          console.warn(`Missing row: ${p.canonicalName} → ${goalSlug} (peptide=${check.has_peptide}, goal=${check.has_goal})`);
        } else {
          existed++;
          console.log(`Exists: ${p.canonicalName} → ${goalSlug}`);
        }
      }
    }
  }

  await sql.end();
  console.log(`Done. inserted=${inserted}, existed=${existed}, missing=${missing}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
