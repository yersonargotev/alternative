"server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Checks if the current authenticated user is an admin of a specific organization
 * @param orgSlug - The slug of the organization to check
 * @param adminRole - The role required for admin access (defaults to 'org:admin')
 * @returns A promise that resolves to a boolean indicating if the user is an admin
 */
export async function isOrganizationAdmin(
	orgSlug = "alternatives",
	adminRole = "org:admin",
): Promise<boolean> {
	try {
		const { userId } = await auth();

		if (!userId) {
			return false;
		}

		const client = await clerkClient();
		const memberships = await client.users.getOrganizationMembershipList({
			userId,
		});

		return memberships.data.some(
			(membership) =>
				membership.organization.slug === orgSlug &&
				membership.role === adminRole,
		);
	} catch (error) {
		console.error(
			`[IS_ORG_ADMIN] Error checking admin status for ${orgSlug}:`,
			error,
		);
		return false;
	}
}

/**
 * Check if the current user is an admin
 * This is a helper function to verify admin status
 */
export async function isAdmin() {
	// Use the reusable helper function to check if user is admin of the alternatives organization
	return isOrganizationAdmin("alternatives", "org:admin");
}
