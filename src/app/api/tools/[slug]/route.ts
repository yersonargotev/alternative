import { getToolDetailsBySlug } from "@/lib/data/tools";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = {
	params: {
		slug: string;
	};
};

export async function GET(request: NextRequest, { params }: RouteContext) {
	try {
		const { slug } = params;

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
			`[API_TOOLS_SLUG_GET] Error fetching tool ${params.slug}:`,
			error,
		);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

// PATCH /api/tools/[slug] (Admin Update) - Placeholder
export async function PATCH(request: NextRequest, { params }: RouteContext) {
	// TODO: Implement admin tool update
	// 1. Check user authentication and role (Clerk)
	// 2. Validate request body (updateToolSchema)
	// 3. Call an update function in lib/data/tools.ts
	// 4. Invalidate cache tags
	console.warn(`[API] PATCH /api/tools/${params.slug} - Not implemented`);
	return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}

// DELETE /api/tools/[slug] (Admin Delete) - Placeholder
export async function DELETE(request: NextRequest, { params }: RouteContext) {
	// TODO: Implement admin tool deletion
	// 1. Check user authentication and role (Clerk)
	// 2. Call a delete function in lib/data/tools.ts
	// 3. Invalidate cache tags
	console.warn(`[API] DELETE /api/tools/${params.slug} - Not implemented`);
	return NextResponse.json({ message: "Not Implemented" }, { status: 501 });
}
