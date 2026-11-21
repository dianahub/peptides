import postgres from "postgres";
import { GOALS } from "../src/lib/goals/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

  const sql = postgres(url, { ssl: "require", max: 1 });

  for (const g of GOALS) {
    await sql`
      INSERT INTO goals (
        id, slug, name_en, name_es, synonyms_en, synonyms_es, condition_terms
      )
      VALUES (
        gen_random_uuid(),
        ${g.slug},
        ${g.nameEn},
        ${g.nameEs},
        ${g.synonymsEn},
        ${g.synonymsEs},
        ${g.conditionTerms}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`Seeded: ${g.slug}`);
  }

  await sql.end();
  console.log("Done.");
}

main().catch((err) => { console.error(err); process.exit(1); });
