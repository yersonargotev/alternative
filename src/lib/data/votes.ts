import "server-only";

import { db } from "@/db";
import { votes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { unstable_cache as cache } from "next/cache";

/**
 * Checks if a specific user has voted for a specific tool.
 * Uses Next.js cache.
 */
// Helper function to check if a user has voted for a tool
async function checkUserVoteStatus(
	toolId: number,
	userId: string | null,
): Promise<{ hasVoted: boolean }> {
	if (!userId) {
		return { hasVoted: false }; // Not logged in, cannot have voted
	}

	try {
		const existingVote = await db.query.votes.findFirst({
			where: and(eq(votes.toolId, toolId), eq(votes.userId, userId)),
			columns: { id: true }, // Only need to know if it exists
		});

		return { hasVoted: !!existingVote };
	} catch (error) {
		console.error(
			`Error fetching vote status for tool ${toolId} and user ${userId}:`,
			error,
		);
		// Decide on behavior on error: assume not voted?
		return { hasVoted: false };
	}
}

// Cached wrapper function that includes the tool ID and user ID in the cache key
export const getUserVoteStatus = async (
	toolId: number,
	userId: string | null,
): Promise<{ hasVoted: boolean }> => {
	// Create a unique cache key for this specific tool and user
	const cacheKey = `getUserVoteStatus-${toolId}-${userId || "anonymous"}`;

	// Use Next.js cache with the specific key
	return cache(() => checkUserVoteStatus(toolId, userId), [cacheKey], {
		revalidate: 60, // Cache for 1 minute (votes can change)
		tags: userId ? ["user-votes", `user-${userId}-votes`] : ["user-votes"],
	})();
};

/**
 * Adds a vote for a tool by a user.
 * Does NOT use cache. Should be called from API route/server action.
 */
export async function addVote(
	toolId: number,
	userId: string,
): Promise<{ success: boolean; message?: string }> {
	if (!userId) {
		return { success: false, message: "User not authenticated." };
	}
	try {
		// Attempt to insert the vote. The unique constraint ('user_tool_vote_unique')
		// in the schema will prevent duplicates.
		await db.insert(votes).values({
			toolId: toolId,
			userId: userId,
		});
		return { success: true };
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		// Check if the error is due to the unique constraint violation
		if (error.code === "23505") {
			// PostgreSQL unique violation error code
			console.warn(`User ${userId} already voted for tool ${toolId}.`);
			return { success: false, message: "Already voted." };
		}
		console.error(
			`Error adding vote for tool ${toolId} by user ${userId}:`,
			error,
		);
		return { success: false, message: "Database error occurred while voting." };
	}
}

/**
 * Removes a vote for a tool by a user.
 * Does NOT use cache. Should be called from API route/server action.
 */
export async function removeVote(
	toolId: number,
	userId: string,
): Promise<{ success: boolean; message?: string }> {
	if (!userId) {
		return { success: false, message: "User not authenticated." };
	}
	try {
		const result = await db
			.delete(votes)
			.where(and(eq(votes.toolId, toolId), eq(votes.userId, userId)));

		// `result.rowCount` might be available depending on the driver/Drizzle version
		// For now, assume success if no error is thrown, or check affected rows if possible
		// console.log('Delete vote result:', result); // Log result for debugging

		return { success: true };
	} catch (error) {
		console.error(
			`Error removing vote for tool ${toolId} by user ${userId}:`,
			error,
		);
		return {
			success: false,
			message: "Database error occurred while removing vote.",
		};
	}
}
