import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" }); // Load .env.local for drizzle-kit

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	throw new Error("DATABASE_URL environment variable is required.");
}

export default defineConfig({
	schema: "./db/schema.ts",
	out: "./db/migrations",
	dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'
	dbCredentials: {
		url: dbUrl,
	},
	verbose: true,
	strict: true,
});
