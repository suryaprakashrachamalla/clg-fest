// Local development PostgreSQL without Docker (uses the `embedded-postgres` package).
// Data lives in ./.pg-data. Matches DATABASE_URL in .env.example.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const pg = new EmbeddedPostgres({
  databaseDir: "./.pg-data",
  user: "sangamam",
  password: "sangamam",
  port: 5433,
  persistent: true,
});

const fresh = !existsSync("./.pg-data/PG_VERSION");
if (fresh) await pg.initialise();
await pg.start();
if (fresh) {
  try {
    await pg.createDatabase("sangamam");
  } catch (e) {
    console.warn("createDatabase:", e?.message);
  }
}
console.log("✓ Embedded Postgres running on postgresql://sangamam:sangamam@localhost:5433/sangamam");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
