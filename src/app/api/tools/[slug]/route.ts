import { db } from "@/db";
import { tools } from "@/db/schema";
import { getToolDetailsBySlug } from "@/lib/data/tools";
import { updateToolSchema } from "@/schemas";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

type RouteParams = { slug: string };

/**
 * GET endpoint to fetch tool details by slug
 * This is a public endpoint that doesn't require authentication
 */
export async function GET(request: Request, context: { params: RouteParams }) {
	try {
		const { slug } = context.params;

		if (!slug) {
			return NextResponse.json(
				{ message: "Tool slug is required" },
				{ status: 400 },
			);
		}

		const toolDetails = await getToolDetailsBySlug(slug);

		if (!toolDetails) {
			return NextResponse.json(
				{ message: "Tool not found or not approved" },
				{ status: 404 },
			);
		}

		return NextResponse.json(toolDetails);
	} catch (error) {
		console.error(
			`[API_TOOLS_SLUG_GET] Error fetching tool ${context.params.slug}:`,
			error,
		);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/**
 * Check if the current user is an admin
 * This is a helper function to verify admin status
 */
async function isAdmin() {
	const { userId } = await auth();

	if (!userId) {
		return false;
	}

	// In a real application, you would check if the user has admin privileges
	// This could be done by checking a role in your database or using Clerk's organization roles
	// For now, we'll use a simple check with environment variables for authorized admin IDs
	const adminIds = process.env.ADMIN_USER_IDS?.split(",") || [];
	return adminIds.includes(userId);
}

/**
 * PATCH endpoint to update a tool
 * Only accessible by admin users
 */
export async function PATCH(
	request: Request,
	context: { params: RouteParams },
) {
	try {
		// 1. Check if user is authenticated and is an admin
		if (!(await isAdmin())) {
			return NextResponse.json(
				{ message: "Unauthorized. Admin access required." },
				{ status: 403 },
			);
		}

		const { slug } = context.params;

		// 2. Get the tool from the database to ensure it exists
		const existingTool = await db.query.tools.findFirst({
			where: eq(tools.slug, slug),
		});

		if (!existingTool) {
			return NextResponse.json({ message: "Tool not found" }, { status: 404 });
		}

		// 3. Parse and validate the request body
		const body = await request.json();

		try {
			// Validate the update data
			const validatedData = updateToolSchema.parse({
				...body,
				id: existingTool.id, // Ensure the ID is included
			});

			// 4. Update the tool in the database
			const [updatedTool] = await db
				.update(tools)
				.set({
					...validatedData,
					updatedAt: new Date(),
				})
				.where(eq(tools.id, existingTool.id))
				.returning();

			// 5. Revalidate the cache
			revalidateTag("tools-list");
			revalidateTag("tool-details");

			return NextResponse.json({
				message: "Tool updated successfully",
				tool: updatedTool,
			});
		} catch (error) {
			if (error instanceof ZodError) {
				return NextResponse.json(
					{
						message: "Validation error",
						errors: error.errors,
					},
					{ status: 400 },
				);
			}
			throw error;
		}
	} catch (error) {
		console.error(
			`[API_TOOLS_SLUG_PATCH] Error updating tool ${context.params.slug}:`,
			error,
		);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE endpoint to remove a tool
 * Only accessible by admin users
 */
export async function DELETE(
	request: Request,
	context: { params: RouteParams },
) {
	try {
		// 1. Check if user is authenticated and is an admin
		if (!(await isAdmin())) {
			return NextResponse.json(
				{ message: "Unauthorized. Admin access required." },
				{ status: 403 },
			);
		}

		const { slug } = context.params;

		// 2. Get the tool from the database to ensure it exists
		const existingTool = await db.query.tools.findFirst({
			where: eq(tools.slug, slug),
		});

		if (!existingTool) {
			return NextResponse.json({ message: "Tool not found" }, { status: 404 });
		}

		// 3. Delete the tool from the database
		// Note: Due to foreign key constraints with ON DELETE CASCADE,
		// this will also delete related votes and alternative relationships
		await db.delete(tools).where(eq(tools.id, existingTool.id));

		// 4. Revalidate the cache
		revalidateTag("tools-list");
		revalidateTag("tool-details");

		return NextResponse.json({
			message: "Tool deleted successfully",
		});
	} catch (error) {
		console.error(
			`[API_TOOLS_SLUG_DELETE] Error deleting tool ${context.params.slug}:`,
			error,
		);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
