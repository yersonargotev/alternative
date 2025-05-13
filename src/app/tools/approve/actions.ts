"use server";

import { db } from "@/db";
import { tools } from "@/db/schema";
import { isAdmin } from "@/lib/check-admin";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Approves a tool by changing its status from "pending" to "approved"
 */
export async function approveTool(toolId: number) {
	if (!(await isAdmin())) {
		throw new Error("Unauthorized. Admin access required.");
	}

	try {
		// Update the tool status to approved
		await db
			.update(tools)
			.set({
				status: "approved",
				updatedAt: new Date(),
			})
			.where(eq(tools.id, toolId));

		// Revalidate related cache
		revalidateTag("tools-list");
		revalidateTag("tool-details");
		revalidatePath("/tools/approve");

		return { success: true };
	} catch (error) {
		console.error(`[APPROVE_TOOL] Error approving tool ${toolId}:`, error);
		return { success: false, error: "Failed to approve tool" };
	}
}

/**
 * Rejects a tool by changing its status from "pending" to "rejected"
 */
export async function rejectTool(toolId: number) {
	if (!(await isAdmin())) {
		throw new Error("Unauthorized. Admin access required.");
	}

	try {
		// Update the tool status to rejected
		await db
			.update(tools)
			.set({
				status: "rejected",
				updatedAt: new Date(),
			})
			.where(eq(tools.id, toolId));

		// Revalidate related cache
		revalidateTag("tools-list");
		revalidateTag("tool-details");
		revalidatePath("/tools/approve");

		return { success: true };
	} catch (error) {
		console.error(`[REJECT_TOOL] Error rejecting tool ${toolId}:`, error);
		return { success: false, error: "Failed to reject tool" };
	}
}
