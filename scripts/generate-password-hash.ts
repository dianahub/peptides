import bcrypt from "bcryptjs";
import { createInterface } from "readline";

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter password to hash: ", async (password) => {
  rl.close();
  if (!password) {
    console.error("No password entered.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  console.log("\nAdd this to your environment variables:\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(
    "\nAlso set on Vercel: vercel env add ADMIN_PASSWORD_HASH production\n"
  );
});
