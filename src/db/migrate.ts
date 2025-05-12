import path from "node:path";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator"; // Use drizzle-orm/postgres-js/migrator for standard pg

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		"DATABASE_URL environment variable is not set for migration.",
	);
}

const runMigrate = async () => {
	try {
		console.log("Connecting to database...");
		const sql = neon(databaseUrl);
		// For standard pg:
		// import postgres from 'postgres';
		// const migrationClient = postgres(databaseUrl, { max: 1 });

		console.log("Database connected. Starting migration...");

		await migrate(drizzle(sql), {
			migrationsFolder: path.resolve(process.cwd(), "db/migrations"),
		});
		// For standard pg:
		// await migrate(drizzle(migrationClient), { migrationsFolder: path.resolve(process.cwd(), 'db/migrations') });

		console.log("Migrations applied successfully!");

		// For standard pg, ensure the connection is closed
		// await migrationClient.end();

		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
};

runMigrate();
