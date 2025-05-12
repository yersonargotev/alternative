import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	unique,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

// Enum for tool status
export const toolStatusEnum = pgEnum("tool_status", [
	"pending",
	"approved",
	"rejected",
]);

// --- Tools Table ---
export const tools = pgTable(
	"tools",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		slug: varchar("slug", { length: 120 }).notNull().unique(),
		description: text("description").notNull(),
		websiteUrl: varchar("website_url", { length: 255 }),
		repoUrl: varchar("repo_url", { length: 255 }).notNull(),
		tags: jsonb("tags").$type<string[]>().default([]),

		// GitHub Data (nullable, updated periodically)
		githubStars: integer("github_stars"),
		githubForks: integer("github_forks"),
		githubIssues: integer("github_issues"),
		githubLastCommit: timestamp("github_last_commit", { withTimezone: true }),

		// Metadata
		status: toolStatusEnum("status").default("pending").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
		submittedByUserId: varchar("submitted_by_user_id", { length: 191 }), // Clerk User ID (optional)
	},
	(table) => ({
		slugIndex: uniqueIndex("slug_idx").on(table.slug),
		statusIndex: index("status_idx").on(table.status),
		repoUrlIndex: index("repo_url_idx").on(table.repoUrl), // Useful for finding tools by repo
	}),
);

// --- Tool Alternatives Relationship Table (Many-to-Many) ---
export const toolAlternatives = pgTable(
	"tool_alternatives",
	{
		originalToolId: integer("original_tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		alternativeToolId: integer("alternative_tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		// Optional: addedByUserId if tracking who suggested the link
		// addedByUserId: varchar('added_by_user_id', { length: 191 }),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.originalToolId, table.alternativeToolId],
		}),
		originalToolIdx: index("original_tool_idx").on(table.originalToolId),
		alternativeToolIdx: index("alternative_tool_idx").on(
			table.alternativeToolId,
		),
	}),
);

// --- Votes Table ---
export const votes = pgTable(
	"votes",
	{
		id: serial("id").primaryKey(),
		userId: varchar("user_id", { length: 191 }).notNull(), // Clerk User ID
		toolId: integer("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		userToolUnique: unique("user_tool_vote_unique").on(
			table.userId,
			table.toolId,
		), // User can only vote once per tool
		toolIdIndex: index("vote_tool_id_idx").on(table.toolId),
		userIdIndex: index("vote_user_id_idx").on(table.userId),
	}),
);

// --- Drizzle Relations ---

export const toolsRelations = relations(tools, ({ many, one }) => ({
	// A tool can be an alternative TO many other tools
	alternativeToRelations: many(toolAlternatives, {
		relationName: "alternative",
	}),
	// A tool can HAVE many alternatives
	alternativesRelations: many(toolAlternatives, { relationName: "original" }),
	// A tool can have many votes
	votes: many(votes),
	// Optional: Link back to the user who submitted it (if needed, requires a users table)
	// submittedByUser: one(users, { fields: [tools.submittedByUserId], references: [users.clerkId] })
}));

export const toolAlternativesRelations = relations(
	toolAlternatives,
	({ one }) => ({
		// Relation back to the original tool
		originalTool: one(tools, {
			fields: [toolAlternatives.originalToolId],
			references: [tools.id],
			relationName: "original",
		}),
		// Relation back to the alternative tool
		alternativeTool: one(tools, {
			fields: [toolAlternatives.alternativeToolId],
			references: [tools.id],
			relationName: "alternative",
		}),
	}),
);

export const votesRelations = relations(votes, ({ one }) => ({
	// Relation back to the tool being voted on
	tool: one(tools, {
		fields: [votes.toolId],
		references: [tools.id],
	}),
	// Optional: Link back to the user who voted (if needed, requires a users table)
	// user: one(users, { fields: [votes.userId], references: [users.clerkId] })
}));

// Note: We are not creating a separate `users` table synced with Clerk for this MVP,
// as Clerk manages user profiles. We only store the `userId` where needed (votes, submissions).
// If more user-specific data needs to be stored locally, a `users` table would be necessary.
