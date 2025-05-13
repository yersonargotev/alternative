import { eq } from "drizzle-orm";
import { db } from "./index";
import { tools, users, votes } from "./schema";

/**
 * Database operations for Clerk webhook events
 */

/**
 * Create or update a user in the database
 * @param userData User data from Clerk
 */
export async function upsertUser(userData: {
	id: string;
	email_addresses?: Array<{ email_address: string }>;
	first_name?: string | null;
	last_name?: string | null;
	image_url?: string | null;
}) {
	try {
		const primaryEmail = userData.email_addresses?.[0]?.email_address;

		if (!primaryEmail) {
			console.error(`Cannot upsert user ${userData.id} without email address`);
			return false;
		}

		// Check if user exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, userData.id))
			.limit(1);

		if (existingUser.length === 0) {
			// Create new user
			await db.insert(users).values({
				id: userData.id,
				email: primaryEmail,
				firstName: userData.first_name || null,
				lastName: userData.last_name || null,
				imageUrl: userData.image_url || null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			console.log(`Created new user: ${userData.id}`);
		} else {
			// Update existing user
			await db
				.update(users)
				.set({
					email: primaryEmail,
					firstName: userData.first_name || null,
					lastName: userData.last_name || null,
					imageUrl: userData.image_url || null,
					updatedAt: new Date(),
				})
				.where(eq(users.id, userData.id));
			console.log(`Updated user: ${userData.id}`);
		}

		return true;
	} catch (error) {
		console.error(`Error upserting user ${userData.id}:`, error);
		return false;
	}
}

/**
 * Update user's last login timestamp
 * @param userId The Clerk user ID
 */
export async function updateUserLastLogin(userId: string) {
	try {
		await db
			.update(users)
			.set({ lastLoginAt: new Date() })
			.where(eq(users.id, userId));

		return true;
	} catch (error) {
		console.error(`Error updating last login for user ${userId}:`, error);
		return false;
	}
}

/**
 * Handle user deletion by removing their votes and anonymizing their tool submissions
 * @param clerkUserId The Clerk user ID to process
 */
export async function handleUserDeletion(clerkUserId: string) {
	try {
		// 1. Delete all votes by this user
		await db.delete(votes).where(eq(votes.userId, clerkUserId));

		// 2. Anonymize tool submissions by this user (set submittedByUserId to null)
		await db
			.update(tools)
			.set({ submittedByUserId: null })
			.where(eq(tools.submittedByUserId, clerkUserId));

		// 3. Delete the user from our local users table
		// Note: We could keep the record with a 'deleted' flag instead if we want to preserve history
		await db.delete(users).where(eq(users.id, clerkUserId));

		console.log(`Successfully processed deletion for user ${clerkUserId}`);
		return true;
	} catch (error) {
		console.error(`Error processing user deletion for ${clerkUserId}:`, error);
		return false;
	}
}

/**
 * Get user vote statistics
 * @param clerkUserId The Clerk user ID to get stats for
 * @returns Object containing vote count
 */
export async function getUserVoteStats(clerkUserId: string) {
	try {
		const userVotes = await db
			.select({ count: votes.id })
			.from(votes)
			.where(eq(votes.userId, clerkUserId))
			.execute();

		return {
			voteCount: userVotes.length,
		};
	} catch (error) {
		console.error(`Error getting vote stats for user ${clerkUserId}:`, error);
		return { voteCount: 0 };
	}
}

/**
 * Get tools submitted by a user
 * @param clerkUserId The Clerk user ID
 * @returns Array of tools submitted by the user
 */
export async function getUserSubmittedTools(clerkUserId: string) {
	try {
		const userTools = await db
			.select()
			.from(tools)
			.where(eq(tools.submittedByUserId, clerkUserId))
			.execute();

		return userTools;
	} catch (error) {
		console.error(`Error getting tools for user ${clerkUserId}:`, error);
		return [];
	}
}
