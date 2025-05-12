import { z } from "zod";

// Base schema for a tool (can be original or alternative)
export const toolCoreSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	slug: z
		.string()
		.min(1)
		.max(120)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
	description: z.string().min(10, "Description is too short").max(500),
	websiteUrl: z
		.string()
		.url("Invalid website URL")
		.optional()
		.or(z.literal("")),
	repoUrl: z
		.string()
		.url("Invalid repository URL")
		.startsWith("https://github.com/", "Must be a GitHub URL"),
	tags: z
		.array(z.string().min(1).max(30))
		.max(10, "Maximum 10 tags allowed")
		.optional()
		.default([]),
	// GitHub specific data (fetched periodically)
	githubStars: z.number().int().nonnegative().optional().nullable(),
	githubForks: z.number().int().nonnegative().optional().nullable(),
	githubIssues: z.number().int().nonnegative().optional().nullable(),
	githubLastCommit: z.date().optional().nullable(),
	// Internal status
	status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

// Schema for creating a new tool suggestion (less strict on GitHub data)
export const createToolSuggestionSchema = toolCoreSchema
	.omit({
		slug: true, // Slug will be generated
		githubStars: true,
		githubForks: true,
		githubIssues: true,
		githubLastCommit: true,
		status: true, // Status handled internally
	})
	.extend({
		// Optionally suggest it as an alternative to an existing tool ID
		alternativeToToolId: z.number().int().positive().optional(),
	});

// Schema for updating an existing tool (admin)
export const updateToolSchema = toolCoreSchema.partial().extend({
	id: z.number().int().positive(), // Required for update
});

// Schema for representing a tool pair (Original -> Alternative)
export const toolPairSchema = z.object({
	original: toolCoreSchema.extend({ id: z.number().int().positive() }),
	alternative: toolCoreSchema.extend({ id: z.number().int().positive() }),
	// Relationship metadata
	relationId: z.number().int().positive(),
	createdAt: z.date(),
	// Calculated score
	score: z.number().optional(), // Will be calculated based on votes/stars
});

// Schema for API responses or full tool data
export const toolSchema = toolCoreSchema.extend({
	id: z.number().int().positive(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
	// Relations (populated based on context)
	alternatives: z
		.array(toolCoreSchema.extend({ id: z.number().int().positive() }))
		.optional(),
	alternativeTo: z
		.array(toolCoreSchema.extend({ id: z.number().int().positive() }))
		.optional(),
	// User votes count for this specific tool
	userVotesCount: z.number().int().nonnegative().default(0),
});

export type ToolCore = z.infer<typeof toolCoreSchema>;
export type CreateToolSuggestion = z.infer<typeof createToolSuggestionSchema>;
export type UpdateTool = z.infer<typeof updateToolSchema>;
export type ToolPair = z.infer<typeof toolPairSchema>;
export type Tool = z.infer<typeof toolSchema>;

// Helper function to generate slugs (can be moved to lib/utils later)
export const generateSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // Remove invalid chars
		.replace(/\s+/g, "-") // Collapse whitespace and replace by -
		.replace(/-+/g, "-") // Collapse dashes
		.slice(0, 120); // Truncate
};
