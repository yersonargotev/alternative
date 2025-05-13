import { type GetToolsParams, getApprovedTools } from "@/lib/data/tools";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Optional: Define schema for query parameters validation
const queryParamsSchema = z.object({
	page: z.coerce.number().int().positive().optional().default(1),
	limit: z.coerce.number().int().positive().max(50).optional().default(12),
	query: z.string().optional(),
	tags: z
		.string()
		.optional()
		.transform((val) => (val ? val.split(",").filter(Boolean) : undefined)),
	sortBy: z.enum(["score", "stars", "createdAt"]).optional().default("score"),
	order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;

		// Validate query parameters
		const validationResult = queryParamsSchema.safeParse(
			Object.fromEntries(searchParams),
		);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid query parameters",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 },
			);
		}

		const params: GetToolsParams = validationResult.data;

		// Fetch data using the server-side function
		const { tools, totalCount } = await getApprovedTools(params);

		// Use the default limit value if params.limit is undefined
		const limit = params.limit ?? 12;

		return NextResponse.json({
			tools, // Return tools array directly with this key for client-side consumption
			pagination: {
				page: params.page,
				limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error("[API_TOOLS_GET] Error fetching tools:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

// Note: POST /api/tools (for creating tools directly by admin) is omitted for now,
// focusing on the suggestion flow via /api/tools/suggest first.
