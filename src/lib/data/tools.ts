import "server-only"; // Ensure these functions run only on the server

import { db } from "@/db";
import { toolAlternatives, tools, votes } from "@/db/schema";
import { calculateScore } from "@/lib/utils";
import { type CreateToolSuggestion, type Tool, generateSlug } from "@/schemas"; // Import Tool type and helpers
import {
	type SQL,
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	or,
	sql,
} from "drizzle-orm";
import { unstable_cache as cache } from "next/cache"; // For caching server-side fetches

// --- Types for Fetching ---
export type ToolWithVotes = Tool & { userVotesCount: number; score: number };
export type ToolDetails = {
	tool: ToolWithVotes;
	alternatives: ToolWithVotes[];
	alternativeTo: ToolWithVotes[];
};

export type GetToolsParams = {
	page?: number;
	limit?: number;
	query?: string;
	tags?: string[];
	sortBy?: "score" | "stars" | "createdAt";
	order?: "asc" | "desc";
};

// --- Helper for Score Calculation SQL ---
// Encapsulates the weighted score calculation directly in SQL for sorting/filtering
// Note: Weights (0.8, 0.2) should match the JS calculation or be configurable
const scoreSql =
	sql<number>`COALESCE(${tools.githubStars}, 0) * 0.8 + COUNT(${votes.id}) * 0.2`.as(
		"calculated_score",
	);

// --- Main Data Fetching Functions ---

/**
 * Fetches a list of approved tools with pagination, filtering, and sorting.
 * Uses Next.js cache for performance.
 */
export const getApprovedTools = cache(
	async (
		params: GetToolsParams = {},
	): Promise<{ tools: ToolWithVotes[]; totalCount: number }> => {
		const {
			page = 1,
			limit = 12,
			query,
			tags,
			sortBy = "score",
			order = "desc",
		} = params;
		const offset = (page - 1) * limit;

		// Build dynamic where conditions
		const conditions: SQL[] = [eq(tools.status, "approved")];
		if (query) {
			// Create the search condition with two ilike expressions
			const searchCondition = or(
				ilike(tools.name, `%${query}%`),
				ilike(tools.description, `%${query}%`),
			);

			// Only push if the condition is valid (should always be true)
			if (searchCondition) {
				conditions.push(searchCondition);
			}
		}
		if (tags && tags.length > 0) {
			// Assumes tags is jsonb: `tags @> '["tag1", "tag2"]'`
			conditions.push(sql`${tools.tags} @> ${JSON.stringify(tags)}`);
		}

		const whereCondition = and(...conditions);

		// Determine sorting
		let orderByClause: SQL;
		switch (sortBy) {
			case "stars":
				orderByClause =
					order === "asc"
						? sql`COALESCE(${tools.githubStars}, 0) asc`
						: sql`COALESCE(${tools.githubStars}, 0) desc`;
				break;
			case "createdAt":
				orderByClause =
					order === "asc" ? asc(tools.createdAt) : desc(tools.createdAt);
				break;
			default: // Handles "score" and any other cases
				// Order by the calculated score alias
				orderByClause =
					order === "asc"
						? sql`calculated_score asc`
						: sql`calculated_score desc`;
				break;
		}

		try {
			// Query for tools data
			const results = await db
				.select({
					tool: tools,
					userVotesCount: count(votes.id),
					score: scoreSql, // Select the calculated score
				})
				.from(tools)
				.where(whereCondition)
				.leftJoin(votes, eq(tools.id, votes.toolId))
				.groupBy(tools.id)
				.orderBy(orderByClause)
				.limit(limit)
				.offset(offset);

			// Query for total count matching filters (without pagination)
			const totalCountResult = await db
				.select({ count: count() })
				.from(tools)
				.where(whereCondition);

			const totalCount = totalCountResult[0]?.count ?? 0;

			// Map results and ensure score is calculated if needed (should come from SQL now)
			const toolsWithScores = results.map((r) => ({
				...r.tool,
				// Ensure tags is never null for type safety
				tags: r.tool.tags ?? [],
				// Ensure websiteUrl is properly typed (null -> undefined if needed)
				websiteUrl: r.tool.websiteUrl ?? undefined,
				userVotesCount: r.userVotesCount,
				// Use score from SQL, fallback to JS calculation if somehow null
				score: r.score ?? calculateScore(r.tool.githubStars, r.userVotesCount),
			}));

			return { tools: toolsWithScores, totalCount };
		} catch (error) {
			console.error("Error fetching approved tools:", error);
			return { tools: [], totalCount: 0 };
		}
	},
	["getApprovedTools"], // Cache key prefix
	{
		revalidate: 60 * 5, // Revalidate every 5 minutes
		tags: ["tools-list"], // Cache tag for invalidation
	},
);

/**
 * Fetches details for a single tool by slug, including its alternatives and originals.
 * Uses Next.js cache.
 */
export const getToolDetailsBySlug = cache(
	async (slug: string): Promise<ToolDetails | null> => {
		try {
			// 1. Fetch the main tool
			const mainToolResult = await db
				.select({
					tool: tools,
					userVotesCount: count(votes.id),
					score: scoreSql,
				})
				.from(tools)
				.where(and(eq(tools.slug, slug), eq(tools.status, "approved")))
				.leftJoin(votes, eq(tools.id, votes.toolId))
				.groupBy(tools.id)
				.limit(1);

			if (!mainToolResult || mainToolResult.length === 0) {
				return null;
			}

			const mainTool = {
				...mainToolResult[0].tool,
				// Ensure tags is never null for type safety
				tags: mainToolResult[0].tool.tags ?? [],
				// Ensure websiteUrl is properly typed (null -> undefined if needed)
				websiteUrl: mainToolResult[0].tool.websiteUrl ?? undefined,
				userVotesCount: mainToolResult[0].userVotesCount,
				score:
					mainToolResult[0].score ??
					calculateScore(
						mainToolResult[0].tool.githubStars,
						mainToolResult[0].userVotesCount,
					),
			};

			// 2. Fetch alternatives
			const alternativesQuery = db
				.select({
					tool: tools,
					userVotesCount: count(votes.id),
					score: scoreSql,
				})
				.from(toolAlternatives)
				.innerJoin(tools, eq(toolAlternatives.alternativeToolId, tools.id))
				.where(
					and(
						eq(toolAlternatives.originalToolId, mainTool.id),
						eq(tools.status, "approved"),
					),
				)
				.leftJoin(votes, eq(tools.id, votes.toolId))
				.groupBy(tools.id)
				.orderBy(sql`calculated_score desc`); // Order by score

			// 3. Fetch tools for which this is an alternative
			const alternativeToQuery = db
				.select({
					tool: tools,
					userVotesCount: count(votes.id),
					score: scoreSql,
				})
				.from(toolAlternatives)
				.innerJoin(tools, eq(toolAlternatives.originalToolId, tools.id))
				.where(
					and(
						eq(toolAlternatives.alternativeToolId, mainTool.id),
						eq(tools.status, "approved"),
					),
				)
				.leftJoin(votes, eq(tools.id, votes.toolId))
				.groupBy(tools.id)
				.orderBy(sql`calculated_score desc`); // Order by score

			const [alternativesResult, alternativeToResult] = await Promise.all([
				alternativesQuery,
				alternativeToQuery,
			]);

			const mapResults = (results: typeof alternativesResult) =>
				results
					.map((r) => ({
						...r.tool,
						// Ensure tags is never null for type safety
						tags: r.tool.tags ?? [],
						// Ensure websiteUrl is properly typed (null -> undefined if needed)
						websiteUrl: r.tool.websiteUrl ?? undefined,
						userVotesCount: r.userVotesCount,
						score:
							r.score ?? calculateScore(r.tool.githubStars, r.userVotesCount),
					}))
					.sort((a, b) => b.score - a.score); // Ensure final sort by score

			return {
				tool: mainTool,
				alternatives: mapResults(alternativesResult),
				alternativeTo: mapResults(alternativeToResult),
			};
		} catch (error) {
			console.error(`Error fetching tool details for slug ${slug}:`, error);
			return null;
		}
	},
	["getToolDetailsBySlug"], // Cache key prefix
	{
		revalidate: 60 * 10, // Revalidate every 10 minutes
		tags: ["tool-details"], // Cache tags - can't use dynamic slug here
	},
);

/**
 * Creates a new tool suggestion (status defaults to 'pending').
 * Typically called from an API route/server action.
 * Does NOT use Next.js cache as it's a mutation.
 */
export async function createToolSuggestion(
	data: CreateToolSuggestion,
	userId: string,
): Promise<ToolWithVotes> {
	const slug = generateSlug(data.name);

	// Check if slug or repoUrl already exists (optional, depends on desired strictness)
	const existing = await db.query.tools.findFirst({
		where: or(eq(tools.slug, slug), eq(tools.repoUrl, data.repoUrl)),
	});

	if (existing) {
		// Handle conflict: maybe return existing, or throw error
		// For suggestions, maybe allow duplicates pending review?
		console.warn(
			`Potential duplicate suggestion: Slug=${slug}, Repo=${data.repoUrl}`,
		);
		// Let's allow it for now, admin can resolve duplicates.
		// throw new Error(`Tool with slug '${slug}' or repo URL '${data.repoUrl}' already exists.`);
	}

	try {
		const [newTool] = await db
			.insert(tools)
			.values({
				...data,
				slug: slug, // Use generated slug
				status: "pending", // Explicitly set status
				submittedByUserId: userId,
				// GitHub data fields are omitted, will be fetched later if approved
			})
			.returning();

		// If it was suggested as an alternative to another tool, create the relationship link
		if (data.alternativeToToolId) {
			// Check if the original tool exists and is approved
			const originalTool = await db.query.tools.findFirst({
				where: and(
					eq(tools.id, data.alternativeToToolId),
					eq(tools.status, "approved"),
				),
			});

			if (originalTool) {
				await db
					.insert(toolAlternatives)
					.values({
						originalToolId: data.alternativeToToolId,
						alternativeToolId: newTool.id,
						// Optionally add submittedByUserId here too
					})
					.onConflictDoNothing(); // Avoid error if relationship somehow exists
			} else {
				console.warn(
					`Original tool ID ${data.alternativeToToolId} not found or not approved when creating suggestion link.`,
				);
			}
		}

		// Add the required properties for ToolWithVotes type compatibility
		return {
			...newTool,
			// Ensure tags is never null
			tags: newTool.tags ?? [],
			// Ensure websiteUrl is properly typed
			websiteUrl: newTool.websiteUrl ?? undefined,
			// Add required properties for ToolWithVotes
			userVotesCount: 0,
			score: 0,
		};
	} catch (error) {
		console.error("Error creating tool suggestion:", error);
		// Consider more specific error handling (e.g., unique constraint violation)
		throw new Error("Failed to save suggestion to the database.");
	}
}

// TODO: Add functions for updating tools (admin), deleting tools (admin),
// approving/rejecting suggestions (admin).
