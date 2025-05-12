import { addVote, removeVote } from "@/lib/data/votes";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const votePayloadSchema = z.object({
	toolId: z.number().int().positive(),
});

// POST handler for adding a vote
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const json = await request.json();
		const parseResult = votePayloadSchema.safeParse(json);

		if (!parseResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input data",
					errors: parseResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { toolId } = parseResult.data;

		const result = await addVote(toolId, userId);

		if (!result.success) {
			// Handle specific cases like 'Already voted'
			if (result.message === "Already voted.") {
				return NextResponse.json(
					{ success: false, message: result.message },
					{ status: 409 },
				); // Conflict
			}
			return NextResponse.json(
				{ success: false, message: result.message || "Failed to add vote" },
				{ status: 400 },
			);
		}

		// Invalidate relevant caches on successful vote
		revalidateTag(`tool-${toolId}`); // Invalidate specific tool cache if slug is known or use ID
		revalidateTag("tools-list"); // Invalidate list if sorting depends on votes
		revalidateTag(`user-${userId}-votes`); // Invalidate user's vote status cache

		// TODO: Fetch and return the new vote count if needed by the client mutation hook

		return NextResponse.json(
			{ success: true, message: "Vote added successfully." },
			{ status: 201 },
		);
	} catch (error) {
		console.error("[API_VOTES_POST] Error:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

// DELETE handler for removing a vote
export async function DELETE(request: NextRequest) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// Assuming toolId is sent in the body for DELETE as well
		const json = await request.json();
		const parseResult = votePayloadSchema.safeParse(json);

		if (!parseResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input data",
					errors: parseResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const { toolId } = parseResult.data;

		const result = await removeVote(toolId, userId);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message || "Failed to remove vote" },
				{ status: 400 },
			);
		}

		// Invalidate relevant caches on successful removal
		revalidateTag(`tool-${toolId}`);
		revalidateTag("tools-list");
		revalidateTag(`user-${userId}-votes`);

		// TODO: Fetch and return the new vote count if needed

		return NextResponse.json(
			{ success: true, message: "Vote removed successfully." },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[API_VOTES_DELETE] Error:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
