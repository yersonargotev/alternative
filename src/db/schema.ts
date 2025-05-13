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
	(table) => [
		uniqueIndex("slug_idx").on(table.slug),
		index("status_idx").on(table.status),
		index("repo_url_idx").on(table.repoUrl), // Useful for finding tools by repo
	],
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
	(table) => [
		primaryKey({
			columns: [table.originalToolId, table.alternativeToolId],
		}),
		index("original_tool_idx").on(table.originalToolId),
		index("alternative_tool_idx").on(table.alternativeToolId),
	],
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
	(table) => [
		unique("user_tool_vote_unique").on(table.userId, table.toolId), // User can only vote once per tool
		index("vote_tool_id_idx").on(table.toolId),
		index("vote_user_id_idx").on(table.userId),
	],
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
	// Link back to the user who submitted it
	submittedByUser: one(users, {
		fields: [tools.submittedByUserId],
		references: [users.id],
	}),
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
	// Link back to the user who voted
	user: one(users, { fields: [votes.userId], references: [users.id] }),
}));

// --- Users Table ---
export const users = pgTable(
	"users",
	{
		id: varchar("id", { length: 191 }).primaryKey(), // Clerk User ID
		email: varchar("email", { length: 255 }).notNull().unique(),
		firstName: varchar("first_name", { length: 100 }),
		lastName: varchar("last_name", { length: 100 }),
		imageUrl: varchar("image_url", { length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
			() => new Date(),
		),
		lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
	},
	(table) => [index("email_idx").on(table.email)],
);

// --- Users Relations ---
export const usersRelations = relations(users, ({ many }) => ({
	// A user can submit many tools
	submittedTools: many(tools),
	// A user can cast many votes
	votes: many(votes),
}));
