import { createToolSuggestion } from "@/lib/data/tools";
import {
	type CreateToolSuggestion,
	createToolSuggestionSchema,
} from "@/schemas";
import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Properly await the auth() function as it returns a Promise
		const { userId } = await auth();

		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const json = await request.json();
		const parseResult = createToolSuggestionSchema.safeParse(json);

		if (!parseResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input data",
					errors: parseResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const suggestionData: CreateToolSuggestion = parseResult.data;

		// Call the server-side function to create the suggestion
		const newTool = await createToolSuggestion(suggestionData, userId);

		// Optional: Invalidate cache if pending suggestions are displayed somewhere
		// revalidateTag('pending-suggestions');

		return NextResponse.json(
			{
				success: true,
				message: "Suggestion submitted successfully.",
				tool: newTool,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[API_TOOLS_SUGGEST_POST] Error:", error);
		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
		}
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
