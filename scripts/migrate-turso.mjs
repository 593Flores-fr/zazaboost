import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("❌  DATABASE_URL manquant");
  process.exit(1);
}

const client = createClient({ url, authToken });

const migrationsDir = join(root, "prisma", "migrations");
const folders = readdirSync(migrationsDir)
  .filter((f) => !f.endsWith(".toml"))
  .sort();

console.log(`🚀  Migration de ${folders.length} fichier(s) sur Turso...\n`);

for (const folder of folders) {
  const sqlPath = join(migrationsDir, folder, "migration.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  // Découper par statement (séparés par ;)
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`  ▶ ${folder} (${statements.length} statement${statements.length > 1 ? "s" : ""})`);

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (err) {
      // Ignorer les "table already exists"
      if (err.message?.includes("already exists")) {
        process.stdout.write(" (déjà existant, ignoré)");
      } else {
        console.error(`\n❌  Erreur : ${err.message}`);
        console.error(`    Statement : ${stmt.slice(0, 80)}...`);
        process.exit(1);
      }
    }
  }
  console.log("  ✓");
}

console.log("\n✅  Schéma déployé sur Turso avec succès !");
client.close();
