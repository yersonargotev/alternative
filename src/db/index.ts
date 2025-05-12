import { neon } from "@neondatabase/serverless"; // Or import postgres from 'postgres'
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/neon-http"; // Or drizzle-orm/postgres-js if using pg directly
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is not set.");
}

// For Neon serverless driver (or Vercel Postgres)
const sql = neon(databaseUrl);

// For standard pg driver (e.g., local development, other providers)
// import postgres from 'postgres';
// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString, { prepare: false })

export const db = drizzle(sql, {
	schema,
	logger: process.env.NODE_ENV === "development",
}); // Set logger: true for dev debugging if needed

// If using standard pg driver:
// export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' });
